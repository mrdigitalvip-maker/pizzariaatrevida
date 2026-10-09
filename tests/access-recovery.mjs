import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {readFileSync} from 'node:fs';
import {access,digest,member} from '../server/access.js';
const db=new DatabaseSync(':memory:');db.exec(readFileSync('drizzle/0001_chubby_skullbuster.sql','utf8').replaceAll('--> statement-breakpoint',''));db.exec('CREATE TABLE rate_limits (key TEXT PRIMARY KEY,count INTEGER,window INTEGER)');
const DB={prepare(q){const s=(a=[])=>({bind(...b){return s(b)},async first(){return db.prepare(q).get(...a)},async run(){return {meta:{changes:db.prepare(q).run(...a).changes}}}});return s()},async batch(queries){db.exec('BEGIN');try{const r=[];for(const q of queries)r.push(await q.run());db.exec('COMMIT');return r}catch(e){db.exec('ROLLBACK');throw e}}};
const email='brunobrandao179@gmail.com',other='majumello135@gmail.com',old='old-test-code-at-least-20',otherCode='other-test-code-at-least-20',codes=Array.from({length:5},(_,i)=>'replacement-test-code-at-least-20-'+i);
const env={DB,STAFF_ACCESS_CONFIG:JSON.stringify({accounts:[{email,role:'admin',hashes:[await digest(email+'\0'+old)]},{email:other,role:'staff',hashes:[await digest(other+'\0'+otherCode)]}]})};
async function login(e,c){return access(new Request('https://test.example/api/staff/login',{method:'POST'}),env,{waitUntil(p){p.catch(()=>{})}},'/staff/login',async()=>({email:e,code:c}))}
// Seed without consuming either valid code.
await assert.rejects(()=>login(email,'invalid-test-code-at-least-20'));
env.STAFF_ACCESS_RECOVERY_CONFIG=JSON.stringify({id:'recovery:test-recovery-unique-20261009',email,hashes:await Promise.all(codes.map(c=>digest(email+'\0'+c)))});
await assert.rejects(()=>login(email,old));assert.equal(db.prepare('SELECT count(*) n FROM access_codes WHERE email=? AND used IS NULL').get(email).n,5);
const auth=await login(email,codes[0]);assert.equal(auth.status,200);const payload=await auth.json();assert.match(payload.staffToken,/^[\w-]{43}$/);const headerReq=new Request('https://test.example/api/session',{headers:{'x-atrevida-staff':payload.staffToken}});assert.equal((await member(headerReq,env)).email,email);assert.equal(await member(new Request('https://test.example/api/session'),env),null);await assert.rejects(()=>login(email,codes[0]));assert.equal(db.prepare('SELECT count(*) n FROM access_codes WHERE email=? AND used IS NULL').get(email).n,4);
assert.equal((await login(other,otherCode)).status,200);assert.equal((await login(email,codes[1])).status,200);assert.equal(db.prepare('SELECT count(*) n FROM access_batches WHERE id=?').get('recovery:test-recovery-unique-20261009').n,1);
console.log('PASS: old owner codes revoked, five replacement codes, one-use enforcement, recovery never repeats, other account preserved.');

await access(new Request('https://test.example/api/staff/logout',{method:'POST',headers:{'x-atrevida-staff':payload.staffToken}}),env,{},'/staff/logout',async()=>({}));assert.equal(await member(headerReq,env),null);console.log('PASS: no-cookie staff session, protected member lookup and logout revocation.');
// Exercise the actual browser API helper with cookies deliberately discarded.
const {default:vm}=await import('node:vm');
const memory=new Map();
function browser(){const context={AbortController,setTimeout,clearTimeout,window:{addEventListener(){}},sessionStorage:{getItem:k=>memory.get(k),setItem:(k,v)=>memory.set(k,v),removeItem:k=>memory.delete(k)},fetch:async(url,options={})=>{const req=new Request('https://test.example'+url,options),path=new URL(req.url).pathname.replace('/api','');if(path==='/session')return Response.json({staff:await member(req,env)});try{return await access(req,env,{waitUntil(p){p.catch(()=>{})}},path,async()=>JSON.parse(options.body||'{}'))}catch(e){return Response.json({error:e.message},{status:e.status||500})}}};vm.createContext(context);vm.runInContext(readFileSync('public/common.js','utf8').replaceAll('export ',''),context);return context}
const client=browser();await client.api('/staff/login',{method:'POST',body:JSON.stringify({email,code:codes[3]})});assert.equal((await client.api('/session')).staff.email,email);assert.equal((await client.api('/staff/access')).canRenew,true);
const reloaded=browser();assert.equal((await reloaded.api('/session')).staff.email,email);await reloaded.api('/staff/logout',{method:'POST',body:'{}'});assert.equal((await reloaded.api('/session')).staff,null);assert.equal(memory.has('atrevida-staff'),false);console.log('PASS: real browser API helper login → cookie-free session → protected panel → page reload → logout.');
