// Vercel serves the public app; the existing backend retains orders and staff codes.
// No credential is embedded in this file. The destination is deliberately fixed.
const UPSTREAM='https://pizzaria-atrevida-lem.mr-bruno01.chatgpt.site';
export default async function handler(req,res){
 const host=req.headers.host;if(!host||!/^[a-z0-9.-]+(?::\d+)?$/i.test(host)){res.status(400).end();return}const origin='https://'+host;
 const external=['api/payments/webhook','api/printer/cloudprnt'].includes(String(req.query.path||''));
 if(!['GET','POST','PUT',...(external?['DELETE']:[])].includes(req.method)){res.status(405).end();return}
 if(!external&&req.method!=='GET'&&(req.headers.origin!==origin||req.headers['sec-fetch-site']==='cross-site'||!req.headers['content-type']?.includes('application/json'))){res.status(403).json({error:'Origem não permitida'});return}
 const path=String(req.query.path||'');if(!/^api\/[a-z0-9_/-]+$/i.test(path)||path.includes('..')){res.status(400).end();return}
 const target=new URL('/'+path,UPSTREAM);for(const[k,v]of Object.entries(req.query)){if(k!=='path'&&typeof v==='string')target.searchParams.set(k,v)}
 const headers={'content-type':'application/json',origin:UPSTREAM};for(const k of ['cookie','x-atrevida-guest','x-driver-slot','x-driver-token','x-delivery-token','x-tracking-token',...(external?['authorization','x-signature','x-request-id']:[])])if(typeof req.headers[k]==='string')headers[k]=req.headers[k];
 try{let body;if(req.method!=='GET'){body=typeof req.body==='string'?req.body:JSON.stringify(req.body||{});if(Buffer.byteLength(body)>250000){res.status(413).json({error:'Dados muito grandes'});return}}
 const upstream=await fetch(target,{method:req.method,headers,body,redirect:'error',signal:AbortSignal.timeout(25000)});res.status(upstream.status);res.setHeader('Cache-Control','no-store');res.setHeader('X-Content-Type-Options','nosniff');for(const k of ['content-type','set-cookie']){const v=upstream.headers.get(k);if(v)res.setHeader(k,v)}
 if(upstream.headers.get('content-type')?.includes('application/json'))res.end((await upstream.text()).replaceAll(UPSTREAM,origin));else res.end(Buffer.from(await upstream.arrayBuffer()));
 }catch{res.status(503).json({error:'Atendimento temporariamente indisponível. Tente novamente.'})}
}
