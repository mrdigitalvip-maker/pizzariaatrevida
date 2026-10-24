import {member} from './access.js';
import {notify,staffSubscriptions} from './push.js';
export const release={id:'v25-print-push-20261024',title:'Nova atualização 2.5 · Impressão de pedidos',summary:'O botão Imprimir pedido abre a comanda real. Notificações da equipe revisadas.',steps:['Abra um pedido real no painel e clique em Imprimir pedido.','Confira a impressora da loja e clique em Imprimir. Veja se os itens e o total saíram no papel.','Se deu certo, confirme abaixo. Para novos pedidos, ative o automático no computador e mantenha o painel aberto.']};
const section='release:'+release.id;
const read=async(env,owner,key)=>{const row=await env.DB.prepare('SELECT data FROM section_settings WHERE owner=? AND section=?').bind(owner,key).first();return row?JSON.parse(row.data):null};
const save=(env,owner,key,data)=>env.DB.prepare('INSERT INTO section_settings(owner,section,data,updated) VALUES(?,?,?,?) ON CONFLICT(owner,section) DO UPDATE SET data=excluded.data,updated=excluded.updated').bind(owner,key,JSON.stringify(data),Date.now()).run();
export async function publishRelease(env,retry=false){
 const at=Date.now(),data={publishedAt:at,expiresAt:at+86400000,state:'sending'};
 const claim=await env.DB.prepare('INSERT OR IGNORE INTO section_settings(owner,section,data,updated) VALUES(?,?,?,?)').bind('store',section,JSON.stringify(data),at).run();
 if(!claim.meta.changes){
  const previous=await read(env,'store',section);
  if(!retry||previous?.state==='sending'||previous?.delivery?.accepted!==0||!previous.delivery.failed||(previous.attempts||1)>=3||Date.now()-previous.publishedAt<30000)return previous;
  Object.assign(data,previous,{state:'sending',attempts:(previous.attempts||1)+1});
  const lock=await env.DB.prepare('UPDATE section_settings SET data=?,updated=? WHERE owner=? AND section=? AND data=?').bind(JSON.stringify(data),at,'store',section,JSON.stringify(previous)).run();
  if(!lock.meta.changes)return read(env,'store',section);
 }
 try{data.delivery=await notify(env,'staff',null,{title:release.title,body:'Impressão real corrigida. Abra o painel e siga os 3 passos para conferir.',url:'/equipe#novidades',staff:true,tag:release.id});data.state=data.delivery.failed?(data.delivery.accepted?'partial':'failed'):'completed'}catch(e){data.state='failed';data.error=String(e.message).slice(0,150)}
 await save(env,'store',section,data);return data;
}
export async function releaseRoutes(req,env,path){
 if(!path.startsWith('/staff/release')&&path!=='/staff/push-health')return null;
 const staff=await member(req,env);if(!staff)throw Object.assign(Error('Entre na equipe primeiro'),{status:403});
 const json=v=>Response.json(v,{headers:{'cache-control':'no-store'}});
 if(path==='/staff/release'&&req.method==='GET'){const published=await read(env,'store',section);return json({release:published?{...release,...published,active:Date.now()<published.expiresAt}:null,confirmation:await read(env,staff.id,section)})}
 if(path==='/staff/release/confirm'&&req.method==='POST'){const b=await req.json();if(b.id!==release.id||b.printed!==true)throw Object.assign(Error('Confirme somente depois de conferir o papel impresso.'),{status:400});await save(env,staff.id,section,{confirmedAt:Date.now(),printed:true});return json({ok:true})}
 if(path==='/staff/release/publish'&&req.method==='POST'){if(staff.role!=='admin')throw Object.assign(Error('Somente administradores.'),{status:403});const b=await req.json();return json(await publishRelease(env,b.retry===true))}
 if(path==='/staff/push-health'&&req.method==='GET'){const rows=await staffSubscriptions(env);return json({configured:!!(env.VAPID_PUBLIC_KEY&&env.VAPID_PRIVATE_JWK),myDevices:rows.filter(r=>r.owner===staff.id).length,...(staff.role==='admin'?{teamDevices:rows.length,lastRelease:await read(env,'store',section)}:{})})}
 return null;
}
