export function inaugurationTitle(now=Date.now(),promotion={active:true,value:10}) {
 if(!promotion.active||promotion.value!==10||now<Date.parse('2026-10-09T00:00:00-03:00')||now>=Date.parse('2026-10-12T00:00:00-03:00'))return '';
 return now<Date.parse('2026-10-10T00:00:00-03:00')?'Inauguração hoje!':'Ressaca da inauguração';
}
function polishPublic(){
 if(!document.querySelector('link[data-public-polish]')){const link=document.createElement('link');link.rel='stylesheet';link.href='/public-polish.css';link.dataset.publicPolish='1';document.head.append(link)}
 const main=document.querySelector('main'),hero=document.querySelector('.hero'),orders=document.querySelector('#my-orders');
 if(main&&!document.querySelector('.public-live-strip')){
  const strip=document.createElement('section');strip.className='public-live-strip';strip.setAttribute('aria-label','Informações rápidas do pedido');strip.innerHTML='<article class="public-live-card priority"><span class="public-live-icon">%</span><span><b>10% na inauguração</b><small>Desconto nos produtos · entrega à parte</small></span></article><article class="public-live-card"><span class="public-live-icon">2x</span><span><b>Pizza meio a meio</b><small>Você escolhe até dois sabores</small></span></article><article class="public-live-card"><span class="public-live-icon">↗</span><span><b>Entrega ou retirada</b><small>Taxa confirmada antes do preparo</small></span></article><article class="public-live-card live"><span class="public-live-icon">●</span><span><b>Acompanhe cada etapa</b><small>Pedido, preparo, pronto e entrega</small></span></article>';
  const club=document.querySelector('#club-banner');club?.insertAdjacentElement('afterend',strip);
 }
 if(hero&&orders&&orders.nextElementSibling!==hero)hero.insertAdjacentElement('beforebegin',orders);
 const title=orders?.querySelector('.section-title h2');if(title&&!title.querySelector('.public-live-label')){const live=document.createElement('span');live.className='public-live-label';live.textContent='AO VIVO';title.append(live)}
}
if(typeof document!=='undefined'){
 const update=()=>{const card=document.getElementById('inauguration-banner');if(card){const title=inaugurationTitle(Date.now(),window.storeConfig?.promotion);card.hidden=!title;const target=document.getElementById('inauguration-title');if(target)target.textContent=title}polishPublic();};
 update();setInterval(update,15000);document.addEventListener('visibilitychange',update);
}
