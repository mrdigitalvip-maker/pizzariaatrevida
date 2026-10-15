export function inaugurationTitle(now=Date.now(),promotion={active:true,value:10}) {
 if(!promotion.active||promotion.value!==10||now<Date.parse('2026-10-09T00:00:00-03:00')||now>=Date.parse('2026-10-12T00:00:00-03:00'))return '';
 return now<Date.parse('2026-10-10T00:00:00-03:00')?'Inauguração hoje!':'Ressaca da inauguração';
}

const HOLIDAYS_2026={
 '2026-01-01':'Confraternização Universal',
 '2026-04-03':'Paixão de Cristo',
 '2026-04-21':'Tiradentes',
 '2026-05-01':'Dia do Trabalho',
 '2026-06-24':'São João',
 '2026-07-02':'Independência da Bahia',
 '2026-09-07':'Independência do Brasil',
 '2026-10-12':'Nossa Senhora Aparecida',
 '2026-11-02':'Finados',
 '2026-11-15':'Proclamação da República',
 '2026-11-20':'Dia da Consciência Negra',
 '2026-12-25':'Natal'
};
const REGULAR_DAYS=new Set([0,4,5,6]);
function bahiaParts(now=Date.now()){
 const parts=new Intl.DateTimeFormat('pt-BR',{timeZone:'America/Bahia',year:'numeric',month:'2-digit',day:'2-digit',weekday:'short'}).formatToParts(new Date(now));
 const get=t=>parts.find(p=>p.type===t)?.value||'';
 const date=`${get('year')}-${get('month')}-${get('day')}`;
 const weekday=new Date(`${date}T12:00:00-03:00`).getDay();
 return{date,weekday};
}
function nextHoliday(date){
 const item=Object.entries(HOLIDAYS_2026).filter(([d])=>d>date).sort(([a],[b])=>a.localeCompare(b))[0];
 if(!item)return null;
 const [d,name]=item,[y,m,day]=d.split('-');return{date:d,name,label:`${day}/${m}`};
}
export function publicOpeningStatus(now=Date.now()){
 const {date,weekday}=bahiaParts(now),holiday=HOLIDAYS_2026[date]||'',regular=REGULAR_DAYS.has(weekday),next=nextHoliday(date);
 return{date,holiday,regular,next};
}
function openingMarkup(now=Date.now()){
 const s=publicOpeningStatus(now);
 const status=s.regular?'Dia regular de atendimento':'Fora dos dias regulares';
 const holiday=s.holiday?`<span class="opening-holiday">FERIADO · ${s.holiday}</span><small>Consulte a equipe sobre o atendimento especial de hoje.</small>`:'';
 const next=s.next&&!s.holiday?`<small>Próximo feriado: ${s.next.label} · ${s.next.name}</small>`:'';
 return `<div class="opening-main"><span class="eyebrow">FUNCIONAMENTO</span><b>Quinta a domingo</b><span class="opening-status ${s.regular?'open-day':'closed-day'}">${status}</span></div><div class="opening-extra">${holiday||next}<small>Horários do dia são confirmados pela equipe.</small></div>`;
}
function polishPublic(){
 if(!document.querySelector('link[data-public-polish]')){const link=document.createElement('link');link.rel='stylesheet';link.href='/public-polish.css';link.dataset.publicPolish='1';document.head.append(link)}
 const main=document.querySelector('main'),hero=document.querySelector('.hero'),orders=document.querySelector('#my-orders');
 if(main&&!document.querySelector('.public-live-strip')){
  const strip=document.createElement('section');strip.className='public-live-strip';strip.setAttribute('aria-label','Informações rápidas do pedido');strip.innerHTML='<article class="public-live-card"><span class="public-live-icon">3x</span><span><b>Família com até 3 sabores</b><small>Média e grande: até dois sabores</small></span></article><article class="public-live-card"><span class="public-live-icon">↗</span><span><b>Entrega ou retirada</b><small>Taxa confirmada antes do preparo</small></span></article><article class="public-live-card live"><span class="public-live-icon">●</span><span><b>Acompanhe cada etapa</b><small>Pedido, preparo, pronto e entrega</small></span></article>';
  const club=document.querySelector('#club-banner');club?.insertAdjacentElement('afterend',strip);
 }
 let opening=document.querySelector('#public-opening-status');
 if(!opening){opening=document.createElement('section');opening.id='public-opening-status';opening.className='public-opening-status';opening.setAttribute('aria-label','Funcionamento da Pizzaria Atrevida');const strip=document.querySelector('.public-live-strip'),club=document.querySelector('#club-banner');(strip||club)?.insertAdjacentElement('afterend',opening)}
 if(opening)opening.innerHTML=openingMarkup();
 // The brand hero stays first; order tracking remains in its document position.
 const title=orders?.querySelector('.section-title h2');if(title&&!title.querySelector('.public-live-label')){const live=document.createElement('span');live.className='public-live-label';live.textContent='AO VIVO';title.append(live)}
 const localText=document.querySelector('#local .contact-card p');if(localText)localText.textContent='Funcionamento regular de quinta a domingo. Em feriados, confira o aviso do dia e confirme o atendimento com a equipe.';
}
if(typeof document!=='undefined'){
 const update=()=>{const card=document.getElementById('inauguration-banner');if(card){const title=inaugurationTitle(Date.now(),window.storeConfig?.promotion);card.hidden=!title;const target=document.getElementById('inauguration-title');if(target)target.textContent=title}polishPublic();};
 update();setInterval(update,15000);document.addEventListener('visibilitychange',update);
}

