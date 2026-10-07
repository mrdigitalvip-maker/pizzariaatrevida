import assert from'node:assert/strict';import handler from'../api/bridge.js';
let seen;globalThis.fetch=async(url,options)=>{seen={url:String(url),options};return new Response(JSON.stringify({url:'https://pizzaria-atrevida-lem.mr-bruno01.chatgpt.site/entregador#private-test'}),{headers:{'content-type':'application/json','set-cookie':'atrevida_account=test; Path=/; Secure; HttpOnly; SameSite=Lax'}})};
function response(){return{code:200,headers:{},status(x){this.code=x;return this},setHeader(k,v){this.headers[k]=v},end(x){this.body=x;return this},json(x){this.body=x;return this}}}
const req={headers:{host:'pizzariaatrevida.vercel.app',origin:'https://pizzariaatrevida.vercel.app','content-type':'application/json',cookie:'atrevida_customer=private-test'},query:{path:'api/staff/drivers/1/link'},method:'POST',body:{}};
let res=response();await handler(req,res);assert.equal(res.code,200);assert.match(res.body,/https:\/\/pizzariaatrevida.vercel.app\/entregador/);assert.equal(seen.options.headers.origin,'https://pizzaria-atrevida-lem.mr-bruno01.chatgpt.site');assert.equal(seen.options.headers.cookie,req.headers.cookie);assert.ok(res.headers['set-cookie']);
res=response();await handler({...req,headers:{...req.headers,origin:'https://evil.example'}},res);assert.equal(res.code,403);
res=response();await handler({...req,query:{path:'../private'}},res);assert.equal(res.code,400);
console.log('PASS: Vercel bridge domain rewrite, cookie preservation, fixed destination and CSRF rejection. Live Vercel deployment still requires access.');
