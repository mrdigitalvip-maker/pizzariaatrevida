import {api,enableNotifications} from '/common.js?v=push-20261024';
let running=false,subscribed=false;
const card=document.createElement('details');card.id='novidades';card.className='release-news';card.hidden=true;
document.querySelector('#staff-panel')?.prepend(card);
async function refresh(){
 if(running)return;running=true;
 try{
 const {release:r,confirmation}=await api('/staff/release');
 if(!subscribed){subscribed=true;if('Notification'in window&&Notification.permission==='granted')await enableNotifications('staff',true)}
 if(!r||!r.active){card.hidden=true;return}
 card.hidden=false;
 if(card.dataset.release!==r.id){card.dataset.release=r.id;card.innerHTML='<summary></summary><p data-summary></p><ol></ol><label><input type="checkbox" id="print-verified"> Conferi a comanda no papel e está correta.</label><p><button id="release-confirm">Confirmar meu teste</button></p><p role="status" id="release-feedback"></p><button id="release-notifications">Ativar / testar notificações neste aparelho</button><p class="small" id="release-health"></p>';
 card.querySelector('summary').textContent=r.title;card.querySelector('[data-summary]').textContent=r.summary;
 for(const step of r.steps){const li=document.createElement('li');li.textContent=step;card.querySelector('ol').append(li)}
 card.querySelector('#release-confirm').onclick=async()=>{const button=card.querySelector('#release-confirm'),feedback=card.querySelector('#release-feedback');if(!card.querySelector('#print-verified').checked){feedback.textContent='Confira primeiro a impressão no papel e marque a confirmação.';return}button.disabled=true;try{await api('/staff/release/confirm',{method:'POST',body:JSON.stringify({id:r.id,printed:true})});feedback.textContent='Teste confirmado e salvo no seu acesso.'}catch(e){feedback.textContent=e.message;button.disabled=false}};
 card.querySelector('#release-notifications').onclick=()=>enableNotifications('staff');
 if(location.hash==='#novidades'){card.open=true;card.scrollIntoView({block:'start'})}
 }
 if(confirmation?.printed){card.querySelector('#release-confirm').disabled=true;card.querySelector('#print-verified').checked=true;card.querySelector('#release-feedback').textContent='Seu teste de impressão já foi confirmado.'}
 const h=await api('/staff/push-health');card.querySelector('#release-health').textContent=h.configured?`${h.myDevices} aparelho(s) cadastrado(s) no seu acesso. A permissão do Chrome e do sistema deve estar ativa.`:'Serviço de notificações ainda não configurado.';
 }catch(e){if(!card.hidden)card.querySelector('#release-feedback').textContent=e.message}finally{running=false}
}
window.addEventListener('stafforders',refresh);setInterval(refresh,60000);refresh();
