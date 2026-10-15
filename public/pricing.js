import {promotions,priceItem} from './catalog.js';
export const inauguration={type:'percentage',value:10,name:'Desconto nos sabores selecionados',active:true};
export function calculateTotals(subtotal,deliveryFee,promotion=inauguration,cashback=0,eligibleSubtotal=subtotal){const discount=promotion?.active?Math.floor(Math.min(subtotal,eligibleSubtotal)*promotion.value/100):0;const discountedProducts=subtotal-discount;const cashbackUsed=Math.max(0,Math.min(Math.floor(cashback),Math.floor(discountedProducts*.2)));return{subtotal,promotionDiscount:discount,discountedProducts,deliveryFee,cashbackUsed,total:discountedProducts+deliveryFee-cashbackUsed,promotion:discount?{...promotion}:null}}

export function promotionalSubtotal(items){return items.reduce((sum,x)=>sum+([x.id,x.second,x.third].filter(Boolean).every(id=>Object.hasOwn(promotions,id))?(x.unit??priceItem(x))*x.qty:0),0)}
