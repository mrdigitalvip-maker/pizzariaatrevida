import assert from 'node:assert/strict';import vm from 'node:vm';import{readFileSync}from'node:fs';
import{raw,prices,promotions,priceItem,beverages,borderPrice,flavorLabel}from'../public/catalog.js';
import{calculateTotals,promotionalSubtotal}from'../public/pricing.js';import{printPayload}from'../server/printing.js';
for(const [size,edge]of [['Média',600],['Grande',800],['Família',1000]]){assert.equal(priceItem({id:5,size,border:'Cheddar'})-priceItem({id:5,size,border:'Sem borda recheada'}),edge)}
assert.deepEqual(Object.keys(promotions).map(Number),[1,2,3,4,13,17]);for(const id of [1,2,3,4,13,17])assert.equal(priceItem({id,size:'Grande'}),4800);
for(const [id,value]of [[54,500],[64,500],[55,1000],[67,1000]])assert.equal(priceItem({id}),value);
assert.equal(priceItem({id:1,second:3,third:40,size:'Família',border:'Cheddar'}),8000);assert.throws(()=>priceItem({id:1,second:3,third:40,size:'Grande'}));
const items=[{id:1,size:'Grande',qty:1},{id:51,qty:1},{id:40,size:'Família',qty:1}];assert.equal(promotionalSubtotal(items),4800);assert.equal(calculateTotals(13300,699,undefined,0,promotionalSubtotal(items)).total,13519);
const snap={id:1,name:'Mussarela',second:3,secondName:'Calabresa I',third:40,thirdName:'Camarão',qty:1,size:'Família',border:'Cheddar',unit:8000};const receipt=printPayload({id:'12345678',created:Date.now(),total:8000,data:{items:[snap],customer:'Teste',delivery:'pickup',payment:'Pix na entrega',subtotal:8000}});assert.match(receipt,/⅓ Camarão/);assert.match(receipt,/80,00/);
const app=readFileSync('public/app.js','utf8'),nodes=new Map();function $(s){if(!nodes.has(s))nodes.set(s,{value:'',innerHTML:'',textContent:'',hidden:false,disabled:false});return nodes.get(s)}
const ctx={$,pizzas:raw.map(([name,description],i)=>({id:i+1,name,description})),selected:null,borders:[{name:'Cheddar'}],photo:p=>String(p.id),photoMarkup:()=>'',esc:String,priceItem,borderPrice,promotions,money:n=>String(n),toast(){}};
vm.createContext(ctx);vm.runInContext(app.slice(app.indexOf('function updateThirdOptions'),app.indexOf('\nfunction choose(')),ctx);
for(const [id,value]of Object.entries({first:'1',second:'3',third:'40',size:'Família',split:'triple',border:'Cheddar',quantity:'1'}))$('#'+id).value=value;
ctx.syncBuilder();assert.equal($('#third').value,'40');assert.equal($('#third-label').hidden,false);assert.equal($('#builder-price').textContent,'8000');
$('#second').value='40';ctx.syncBuilder();assert.notEqual($('#third').value,'40');$('#size').value='Média';ctx.syncBuilder();assert.equal($('#split').value,'half');assert.equal($('#third-label').hidden,true);assert.equal($('#split option[value="triple"]').disabled,true);
assert.ok(!readFileSync('public/index.html','utf8').includes('promotions-section'));assert.ok(!readFileSync('public/inauguration.js','utf8').includes('public-live-card priority'));
console.log('PASS: size-based crusts, six promotions, four beers, three-flavor pricing/validation/builder, distinct flavor selection, mixed-cart discount, thermal payload and removed cards.');
