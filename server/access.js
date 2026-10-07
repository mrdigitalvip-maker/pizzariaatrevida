import {b64,notify} from './push.js';
const now=()=>Date.now();
export const digest=async s=>b64(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s)));
const random=()=>b64(crypto.getRandomValues(new Uint8Array(32)));
const emailOf=s=>String(s||'').trim().toLowerCase();
const reject=(status,message)=>{throw Object.assign(Error(message),{status})};
const reply=(v,status=200,headers={})=>new Response(JSON.stringify(v),{status,headers:{'content-type':'application/json','cache-control':'no-store',...headers}});
const cfg=env=>JSON.parse(env.STAFF_ACCESS_CONFIG||'{"accounts":[]}');
export const allowed=(env,email)=>cfg(env).accounts.find(a=>a.email===email);
const tokenOf=req=>req.headers.get('cookie')?.match(/(?:^|;\s*)atrevida_staff=([\w-]{43})(?:;|$)/)?.[1];
async function seed(env){const tasks=[];for(const a of cfg(env).accounts){tasks.push(env.DB.prepare('INSERT OR IGNORE INTO access_batches (id,email,generation,created) VALUES (?,?,0,?)').bind(a.email+':0',a.email,now()));for(const h of a.hashes)tasks.push(env.DB.prepare('INSERT OR IGNORE INTO access_codes (hash,email,batch,used) VALUES (?,?,?,NULL)').bind(h,a.email,a.email+':0'))}if(tasks.length)await env.DB.batch(tasks)}
export async function member(req,env){const token=tokenOf(req);if(!token)return null;const row=await env.DB.prepare('SELECT email,expires FROM staff_sessions WHERE hash=? AND expires>?').bind(await digest(token),now()).first();if(!row)return null;const a=allowed(env,row.email);return a?{id:'email:'+a.email,email:a.email,role:a.role,expires:row.expires}:null}
async function limit(env,key,max){const t=Math.floor(now()/600000);const r=await env.DB.prepare('INSERT INTO rate_limits (key,count,window) VALUES (?,1,?) ON CONFLICT(key) DO UPDATE SET count=CASE WHEN window=excluded.window THEN count+1 ELSE 1 END,window=excluded.window RETURNING count').bind(key,t).first();if(r.count>max)reject(429,'Muitas tentativas. Aguarde 10 minutos e tente novamente.')}
const remaining=async(env,email)=>(await env.DB.prepare('SELECT count(*) AS n FROM access_codes WHERE email=? AND used IS NULL').bind(email).first()).n;
export async function access(req,env,ctx,path,body){
 if(path==='/staff/login'&&req.method==='POST'){
  await limit(env,'login-ip:'+await digest(req.headers.get('cf-connecting-ip')||'unknown'),30);const b=await body(req),email=emailOf(b.email);await limit(env,'login-email:'+await digest(email),10);await seed(env);
  const code=String(b.code||'').trim();const account=allowed(env,email);if(!account||code.length<20||code.length>120)reject(403,'Acesso não autorizado. Confira seu e-mail e um código ainda não utilizado.');
  const h=await digest(email+'\0'+code),token=random(),sessionHash=await digest(token),t=now();
  // The consumed code stores the session hash. D1 batch is atomic: a concurrent replay cannot create a second session.
  const result=await env.DB.batch([
   env.DB.prepare('UPDATE access_codes SET used=? WHERE hash=? AND email=? AND used IS NULL').bind(sessionHash,h,email),
   env.DB.prepare('INSERT INTO staff_sessions (hash,email,expires) SELECT ?,?,? WHERE EXISTS (SELECT 1 FROM access_codes WHERE hash=? AND used=?)').bind(sessionHash,email,t+43200000,h,sessionHash)
  ]);if(!result[0].meta.changes)reject(403,'Acesso não autorizado. Confira seu e-mail e um código ainda não utilizado.');
  const left=await remaining(env,email);if(left===0)ctx.waitUntil(notify(env,'staff',null,{title:'Renovação de acesso necessária',body:'Um integrante utilizou seu último código. Confira a área de acessos.',url:'/equipe',tag:'access-renewal'}));
  return reply({ok:true,remaining:left},200,{'set-cookie':`atrevida_staff=${token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=43200`});
 }
 if(path==='/staff/logout'&&req.method==='POST'){const token=tokenOf(req);if(token)await env.DB.prepare('DELETE FROM staff_sessions WHERE hash=?').bind(await digest(token)).run();return reply({ok:true},200,{'set-cookie':'atrevida_staff=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0'})}
 if(path==='/staff/access'&&req.method==='GET'){const s=await member(req,env);if(!s)reject(403,'Entre na área privada');await seed(env);const accounts=s.role==='admin'?cfg(env).accounts:[allowed(env,s.email)];return reply({accounts:await Promise.all(accounts.map(async a=>({email:a.email,role:a.role,remaining:await remaining(env,a.email)}))),canRenew:s.role==='admin',expires:s.expires})}
 if(path==='/staff/renew'&&req.method==='POST'){const s=await member(req,env);if(!s||s.role!=='admin')reject(403,'Somente Bruno pode liberar novos códigos');const b=await body(req),email=emailOf(b.email);if(!allowed(env,email))reject(400,'E-mail não autorizado');await seed(env);if(await remaining(env,email)>0)reject(409,'Ainda existem códigos válidos para este e-mail');const row=await env.DB.prepare('SELECT max(generation) AS n FROM access_batches WHERE email=?').bind(email).first();const generation=(row?.n??0)+1,batch=email+':'+generation,codes=Array.from({length:5},()=>b64(crypto.getRandomValues(new Uint8Array(18))));const hashes=await Promise.all(codes.map(code=>digest(email+'\0'+code)));try{await env.DB.batch([env.DB.prepare('INSERT INTO access_batches (id,email,generation,created) VALUES (?,?,?,?)').bind(batch,email,generation,now()),...hashes.map(h=>env.DB.prepare('INSERT INTO access_codes (hash,email,batch,used) VALUES (?,?,?,NULL)').bind(h,email,batch))])}catch{reject(409,'Acesso já renovado. Atualize a tela.')}return reply({email,codes})}
 return null;
}
