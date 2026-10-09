import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {readFileSync} from 'node:fs';
import {access,digest} from '../server/access.js';
const db=new DatabaseSync(':memory:');db.exec(readFileSync('drizzle/0001_chubby_skullbuster.sql','utf8').replaceAll('--> statement-breakpoint',''));db.exec('CREATE TABLE rate_limits (key TEXT PRIMARY KEY,count INTEGER,window INTEGER)');
const DB={prepare(q){const s=(a=[])=>({bind(...b){return s(b)},async first(){return db.prepare(q).get(...a)},async run(){return {meta:{changes:db.prepare(q).run(...a).changes}}}});return s()},async batch(queries){db.exec('BEGIN');try{const r=[];for(const q of queries)r.push(await q.run());db.exec('COMMIT');return r}catch(e){db.exec('ROLLBACK');throw e}}};
const email='brunobrandao179@gmail.com',other='majumello135@gmail.com',old='old-test-code-at-least-20',otherCode='other-test-code-at-least-20',codes=Array.from({length:5},(_,i)=>'replacement-test-code-at-least-20-'+i);
const env={DB,STAFF_ACCESS_CONFIG:JSON.stringify({accounts:[{email,role:'admin',hashes:[await digest(email+'\0'+old)]},{email:other,role:'staff',hashes:[await digest(other+'\0'+otherCode)]}]})};
async function login(e,c){return access(new Request('https://test.example/api/staff/login',{method:'POST'}),env,{waitUntil(p){p.catch(()=>{})}},'/staff/login',async()=>({email:e,code:c}))}
// Seed without consuming either valid code.
await assert.rejects(()=>login(email,'invalid-test-code-at-least-20'));
env.STAFF_ACCESS_RECOVERY_CONFIG=JSON.stringify({id:'recovery:test-recovery-unique-20261009',email,hashes:await Promise.all(codes.map(c=>digest(email+'\0'+c)))});
await assert.rejects(()=>login(email,old));assert.equal(db.prepare('SELECT count(*) n FROM access_codes WHERE email=? AND used IS NULL').get(email).n,5);
assert.equal((await login(email,codes[0])).status,200);await assert.rejects(()=>login(email,codes[0]));assert.equal(db.prepare('SELECT count(*) n FROM access_codes WHERE email=? AND used IS NULL').get(email).n,4);
assert.equal((await login(other,otherCode)).status,200);assert.equal((await login(email,codes[1])).status,200);assert.equal(db.prepare('SELECT count(*) n FROM access_batches WHERE id=?').get('recovery:test-recovery-unique-20261009').n,1);
console.log('PASS: old owner codes revoked, five replacement codes, one-use enforcement, recovery never repeats, other account preserved.');
