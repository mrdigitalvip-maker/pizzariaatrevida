export function inaugurationTitle(now=Date.now(),promotion={active:true,value:10}) {
 if(!promotion.active||promotion.value!==10||now<Date.parse('2026-10-09T00:00:00-03:00')||now>=Date.parse('2026-10-12T00:00:00-03:00'))return '';
 return now<Date.parse('2026-10-10T00:00:00-03:00')?'Inauguração hoje!':'Ressaca da inauguração';
}
if(typeof document!=='undefined'){
 const update=()=>{const card=document.getElementById('inauguration-banner');if(!card)return;const title=inaugurationTitle(Date.now(),window.storeConfig?.promotion);card.hidden=!title;document.getElementById('inauguration-title').textContent=title;};
 update();setInterval(update,15000);document.addEventListener('visibilitychange',update);
}
