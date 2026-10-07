import{member}from'./access.js';
const fail=(status,message)=>{throw Object.assign(Error(message),{status})};
const clean=(v,n=120)=>typeof v==='string'?v.trim().slice(0,n):'';
const json=v=>new Response(JSON.stringify(v),{headers:{'content-type':'application/json','cache-control':'no-store'}});
export async function operations(req,env,path,body){
 if(path==='/staff/clients'&&req.method==='GET'){if(!await member(req,env))fail(403,'Entre no painel');const q=new URL(req.url).searchParams.get('q')?.trim().slice(0,80)||'';const rows=await env.DB.prepare("SELECT json_extract(data,'$.phone') AS phone,json_extract(data,'$.customer') AS name,count(*) AS orders,max(created) AS last_order,SUM(CASE WHEN status='delivered' THEN COALESCE(total,0) ELSE 0 END) AS spent FROM orders WHERE (json_extract(data,'$.customer') LIKE ? OR json_extract(data,'$.phone') LIKE ?) GROUP BY json_extract(data,'$.phone') ORDER BY last_order DESC LIMIT 100").bind('%'+q+'%','%'+q+'%').all();return json({clients:rows.results})}
 const m=path.match(/^\/orders\/([\w-]{36})\/operations$/);if(m){if(!await member(req,env))fail(403,'Entre no painel');const row=await env.DB.prepare('SELECT id FROM orders WHERE id=?').bind(m[1]).first();if(!row)fail(404,'Pedido não encontrado');if(req.method==='POST'){const b=await body(req);await env.DB.prepare('INSERT INTO order_ops (order_id,note,courier_name,courier_vehicle) VALUES (?,?,?,?) ON CONFLICT(order_id) DO UPDATE SET note=excluded.note,courier_name=excluded.courier_name,courier_vehicle=excluded.courier_vehicle').bind(m[1],clean(b.note,500),clean(b.courierName,60),clean(b.vehicle,60)).run();return json({ok:true})}}
 return null;
}
export function coordinates(value){if(value==null)return null;if(typeof value!=='object'||!Number.isFinite(value.lat)||!Number.isFinite(value.lng)||Math.abs(value.lat)>90||Math.abs(value.lng)>180)fail(400,'Localização inválida');return{lat:value.lat,lng:value.lng}}
export function scheduled(value){if(!value)return null;const t=Number(value);if(!Number.isFinite(t)||t<Date.now()-60000||t>Date.now()+30*86400000)fail(400,'Escolha um horário futuro de até 30 dias');return t}
