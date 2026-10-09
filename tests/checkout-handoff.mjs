import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
import {whatsappDraft} from '../public/order-whatsapp.js';
import {prepareWhatsApp} from '../public/whatsapp-handoff.js';
const app=readFileSync('public/app.js','utf8');
const handler=app.slice(app.indexOf("$('#checkout-form').onsubmit="),app.indexOf("\ndocument.querySelectorAll('[data-cat]')"));
const submit=app.slice(app.indexOf('async function submitOrder('),app.indexOf('\nconst labels='));
const message='Olá Atrevida!\n½ Mussarela + ½ Calabresa\nGrande / Cheddar\n2x Coca-Cola 2 L\nRua I, 5, Top Park\nSem cebola\nEntrega a confirmar';
const url='https://wa.me/557798071769?text='+encodeURIComponent(message);
function fixture({blocked=false,fail=false,direct=false,failSession=false}={}){
 const nodes=new Map();const node=id=>{if(!nodes.has(id))nodes.set(id,{value:'',textContent:'',hidden:false,disabled:false,dataset:{},showModal(){this.open=true},querySelectorAll(){return buttons}});return nodes.get(id)};
 const buttons=[{disabled:false},{disabled:false}],events=[];
 const tab={closed:false,opener:{},document:{title:'',body:{}},location:{replace(u){events.push(['navigate',u])}},close(){this.closed=true;events.push(['close'])}};
 const browser={open(){events.push(['reserve']);return blocked?null:tab},location:{assign(u){events.push(['assign',u])}},customerAccount:null,useCashback:false};
 const values={customer:'Cliente Teste','customer-phone':'77999990000',delivery:'delivery',street:'Rua I',number:'5',neighborhood:'Top Park',complement:'Quadra N',reference:'Portão azul',payment:'Cartão na entrega',change:'','order-notes':'Sem cebola','scheduled-at':''};
 for(const [id,value] of Object.entries(values))node('#'+id).value=value;
 let release;const gate=new Promise(r=>release=r);let payload;
 const context={whatsappDraft,all:[{id:1,name:'Mussarela'},{id:3,name:'Calabresa'},{id:51,name:'Coca-Cola 2 L'}],pizzas:[{id:1,name:'Mussarela'},{id:3,name:'Calabresa'}],window:browser,location:browser.location,URL,crypto,console,cart:[{id:1,second:3,size:'Grande',border:'Cheddar',qty:1,notes:'Sem cebola'},{id:51,qty:2}],checkoutBusy:false,checkoutAdultConfirmed:false,deliveryQuote:null,quoteAccount:null,deliveryLocation:null,sentNonce:null,lastSaved:'',beverages:[],localStorage:{removeItem(){}},$:node,prepareWhatsApp:()=>prepareWhatsApp(browser),renderTotals(){},totals:()=>({delivery:0,known:7740,subtotal:8600,promotionDiscount:860,promotion:{name:'Inauguração'}}),deliveryInput:()=>({street:'Rua I',number:'5',neighborhood:'Top Park',location:null}),money:n=>'R$ '+n/100,saveDraft:()=>{throw Error('Checkout must not wait for draft')},updateCart(){},closeDialog(){},refreshOrders:()=>new Promise(()=>{}),confirm:()=>true,
 api:async(path,opts)=>{events.push(['api',path]);if(path==='/session'){if(failSession)throw Object.assign(Error('Reabra a loja'),{status:401});return {};}if(path==='/delivery/quote')return{id:'quote-id',pending:true,fee:null};if(path==='/orders'){payload=JSON.parse(opts.body);await gate;if(fail)throw Error('Servidor indisponível');return{whatsapp:url,order:{id:'abcd1234-0000-0000-0000-000000000000',total:null,known_total:7740,data:{items:[{qty:1,name:'Mussarela',second:3,secondName:'Calabresa',size:'Grande'}],deliveryPending:true,payment:'Cartão na entrega'}}};}throw Error(path)}};
 vm.createContext(context);vm.runInContext(handler+'\n'+submit,context);
 const event={preventDefault(){},target:node('#checkout-form'),submitter:{dataset:{channel:direct?'site':'whatsapp'}}};
 return {context,node,events,tab,release,event,get payload(){return payload},run:()=>node('#checkout-form').onsubmit(event)};
}
for(const blocked of [false,true]){
 const f=fixture({blocked});const task=f.run();assert.equal(f.events[0][0],'reserve');await new Promise(r=>setImmediate(r));assert.ok(f.payload, f.node('#checkout-error').textContent);assert.equal(f.payload.items[0].second,3);assert.equal(f.payload.items[0].border,'Cheddar');assert.equal(f.payload.items[1].qty,2);assert.equal(f.payload.complement,'Quadra N');assert.equal(f.payload.notes,'Sem cebola');assert.equal(f.payload.expectedDeliveryFee,null);
 await f.run();assert.equal(f.events.filter(e=>e[0]==='reserve').length,1);f.release();await task;
 const nav=f.events.find(e=>['navigate','assign'].includes(e[0]));assert.match(decodeURIComponent(nav[1]),/Coca-Cola 2 L/);assert.match(decodeURIComponent(nav[1]),/confirmar a localização/);assert.equal(nav[0],blocked?'assign':'navigate');assert.equal(f.node('#whatsapp-send').href,url);assert.equal(f.context.cart.length,0);assert.equal(f.context.checkoutBusy,false);
}
const failed=fixture({fail:true});const task=failed.run();await Promise.resolve();failed.release();await task;assert.equal(failed.context.cart.length,2);assert.equal(failed.tab.closed,false);assert.ok(failed.context.sentNonce);assert.match(failed.node('#checkout-error').textContent,/Registro no painel não confirmado/);assert.equal(failed.events.some(e=>e[0]==='navigate'),true);
const direct=fixture({direct:true});const dt=direct.run();await Promise.resolve();direct.release();await dt;assert.equal(direct.events.some(e=>['reserve','navigate','assign'].includes(e[0])),false);assert.equal(direct.node('#review-dialog').open,true);
assert.throws(()=>prepareWhatsApp({open:()=>null,location:{assign(){throw Error('must not navigate')}}}).open('https://evil.example/?text=test'));
console.log('PASS: actual checkout handler, customized pizza + drinks + address payload, synchronous WhatsApp reservation, blocked-popup fallback, stalled order-list independence, double-click lock, failed-save recovery, direct-site confirmation, canonical link validation.');

const noSession=fixture({failSession:true});await noSession.run();assert.ok(noSession.events.find(e=>e[0]==='navigate'));assert.equal(noSession.context.cart.length,2);assert.match(noSession.node('#checkout-error').textContent,/Não foi possível confirmar o registro/);console.log('PASS: WhatsApp opens with full message even when session endpoint returns 401; no false saved-order confirmation.');
