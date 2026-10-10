import {api} from '/common.js';

function injectPolish(){
 if(document.querySelector('link[data-admin-live-polish]'))return;
 const link=document.createElement('link');link.rel='stylesheet';link.href='/admin-live-polish.css';link.dataset.adminLivePolish='1';document.head.append(link);
}

function enablePinLogin(){
 const form=document.querySelector('#login-form');
 const email=document.querySelector('#login-email');
 const secret=document.querySelector('#login-code');
 const submit=document.querySelector('#login-submit');
 const message=document.querySelector('#staff-message');
 const card=document.querySelector('#signin');
 if(!form||!email||!secret||form.dataset.pinReady==='1')return;
 form.dataset.pinReady='1';
 const intro=card?.querySelector('h2 + p');
 const secretLabel=secret.closest('label');
 const notes=card?.querySelectorAll('p.small');
 if(intro)intro.textContent='Use seu e-mail autorizado e seu PIN de 6 dígitos.';
 if(secretLabel)secretLabel.firstChild.textContent='PIN de acesso';
 secret.type='password';secret.inputMode='numeric';secret.pattern='[0-9]{6}';secret.minLength=6;secret.maxLength=6;secret.autocomplete='current-password';secret.placeholder='Digite seu PIN de 6 dígitos';
 if(notes?.[0])notes[0].textContent='Seu acesso permanece conectado neste aparelho por até 30 dias. Não compartilhe seu PIN.';
 if(notes?.[1])notes[1].textContent='Este acesso não solicita a senha do seu Gmail.';
 const normalizeMessage=()=>{if(!message)return;const t=message.textContent||'';if(!t.includes('Acesso autorizado')&&(t.includes('código privado')||t.includes('código ainda não utilizado')))message.textContent='Entre com seu e-mail autorizado e seu PIN de 6 dígitos.'};
 normalizeMessage();
 new MutationObserver(normalizeMessage).observe(message,{childList:true,characterData:true,subtree:true});
 form.addEventListener('submit',async e=>{
  e.preventDefault();e.stopImmediatePropagation();
  const normalizedEmail=email.value.trim().toLowerCase(),pin=secret.value.trim();
  if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(normalizedEmail)){message.textContent='Digite um e-mail válido.';email.focus();return;}
  if(!/^\d{6}$/.test(pin)){message.textContent='Digite um PIN válido de 6 dígitos.';secret.focus();return;}
  submit.disabled=true;message.textContent='Verificando acesso…';
  try{
   const login=await api('/staff/login',{method:'POST',body:JSON.stringify({email:normalizedEmail,pin})});
   if(login?.staffToken)try{sessionStorage.setItem('atrevida_staff_fallback',login.staffToken)}catch{}
   const session=await api('/session');
   if(!session?.staff)throw Error('O PIN foi aceito, mas a sessão não foi mantida. Atualize a página e tente novamente.');
   location.reload();
  }catch(err){
   const t=String(err?.message||'');
   message.textContent=t.includes('código ainda não utilizado')||t.includes('código privado')?'O servidor de acesso ainda está na versão antiga. A atualização do backend precisa ser publicada para aceitar PIN.':(t||'Não foi possível entrar. Confira o e-mail e o PIN.');
  }finally{submit.disabled=false;}
 },true);
}

injectPolish();
enablePinLogin();

let mounted=false,lastLiveAt=0;
function liveBar(){
 let bar=document.querySelector('#live-ops-bar');
 if(bar)return bar;
 bar=document.createElement('div');bar.id='live-ops-bar';bar.className='live-ops-bar';bar.setAttribute('role','status');bar.innerHTML='<i class="live-dot" aria-hidden="true"></i><strong>Operação ao vivo</strong><span id="live-sync">Sincronizando…</span><span class="live-count" id="live-count"></span>';
 const title=document.querySelector('.admin-title');title?.insertAdjacentElement('afterend',bar);return bar;
}
function decorateOrders(){
 const data=Array.isArray(window.staffOrders)?window.staffOrders:[];
 const now=Date.now();
 let urgent=0,active=0;
 for(const o of data){
  const card=document.querySelector(`[data-order-id="${o.id}"]`);if(!card)continue;
  card.classList.remove('is-watch','is-urgent','is-ready','is-late');
  card.querySelector('.priority-chip')?.remove();
  if(['delivered','cancelled'].includes(o.status))continue;
  active++;
  const age=Math.max(0,Math.floor((now-o.created)/60000));
  const deadline=o.confirmed&&o.eta?Math.max(o.confirmed,o.data?.scheduledAt||0)+o.eta*60000:0;
  let tone='',label='';
  if(deadline&&now>deadline){tone='late';label='ATRASADO';card.classList.add('is-late');urgent++}
  else if(o.status==='ready'){tone='ready';label='PRONTO';card.classList.add('is-ready')}
  else if(o.status==='received'&&age<=10){tone='new';label='NOVO'}
  else if((o.status==='received'||o.status==='quote')&&age>=20){tone='urgent';label='URGENTE';card.classList.add('is-urgent');urgent++}
  else if(o.status==='quote'){tone='wait';label='AGUARDANDO';card.classList.add('is-watch')}
  else if(age>=15){tone='wait';label='ATENÇÃO';card.classList.add('is-watch')}
  if(label){const chip=document.createElement('span');chip.className='priority-chip '+tone;chip.textContent=label;card.querySelector('.order-title')?.append(chip)}
 }
 const bar=liveBar();if(!bar)return;
 lastLiveAt=now;
 const sync=bar.querySelector('#live-sync'),count=bar.querySelector('#live-count');
 if(sync)sync.textContent='Atualizado agora · '+new Date(now).toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit',second:'2-digit'});
 if(count)count.textContent=urgent?`${active} ativos · ${urgent} exigem atenção`:`${active} pedido(s) ativo(s)`;
}
function refreshLiveAge(){const sync=document.querySelector('#live-sync');if(!sync||!lastLiveAt)return;const sec=Math.floor((Date.now()-lastLiveAt)/1000);if(sec<8)sync.textContent='Atualizado agora';else if(sec<60)sync.textContent=`Atualizado há ${sec}s`;else sync.textContent=`Atualizado há ${Math.floor(sec/60)} min`}

async function mount(){
 if(mounted)return;
 try{
  const s=await api('/session');if(!s.staff)return;
  mounted=true;liveBar();
  const host=document.createElement('section');host.className='notice live-setup';host.innerHTML='<button type="button" id="setup-help">Ajuda de configuração</button><div id="setup-info" hidden><p><b>Pedidos já chegam ao painel.</b> Para entrega, confirme área atendida, taxa e aprovação do cliente antes do preparo.</p><p>Cobrança online e impressão automática dependem das integrações configuradas. O painel continua operacional mesmo sem elas.</p><button type="button" id="setup-close">Fechar</button></div>';
  const title=document.querySelector('.admin-title');title?.insertAdjacentElement('afterend',host);
  const info=host.querySelector('#setup-info');host.querySelector('#setup-help').onclick=()=>info.hidden=!info.hidden;host.querySelector('#setup-close').onclick=()=>info.hidden=true;
  const studio=document.querySelector('#store-studio'),orders=document.querySelector('#orders-section');if(studio&&orders&&orders.parentElement===studio.parentElement)orders.insertAdjacentElement('afterend',studio);
  decorateOrders();
 }catch{}
}
window.addEventListener('stafforders',()=>{mount();decorateOrders()});
mount();
setInterval(refreshLiveAge,5000);
setInterval(()=>{if(!document.hidden&&window.staffOrders&&document.querySelector('#staff-panel')&&!document.querySelector('#staff-panel').hidden)window.loadOrders?.(true)},10000);
