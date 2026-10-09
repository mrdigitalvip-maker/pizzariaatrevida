import {api} from '/common.js';

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

enablePinLogin();

let mounted=false;async function mount(){if(mounted)return;try { const s=await api('/session'); if(s.staff){mounted=true;const host=document.createElement('section');host.className='notice';host.innerHTML='<button type="button" id="setup-help">Como ativar a operação automática</button><div id="setup-info"><p><b>Pedidos já chegam ao painel.</b> Para entrega, confirme área atendida, taxa e aprovação do cliente antes do preparo. O WhatsApp abre com a mensagem pronta: o cliente ainda precisa tocar em Enviar.</p><p>Para cobrança online: configurar a conta Mercado Pago da pizzaria. Para impressão automática: configurar impressora de rede compatível. Com notebook, abra a comanda privada e use Imprimir. Documento fiscal exige integração fiscal própria.</p><button type="button" id="setup-close">Entendi</button></div>';document.querySelector('.staff-main').prepend(host);const info=host.querySelector('#setup-info');host.querySelector('#setup-help').onclick=()=>info.hidden=false;host.querySelector('#setup-close').onclick=()=>info.hidden=true;setTimeout(()=>info.hidden=true,15000);}}catch{}}
window.addEventListener('stafforders',mount);mount();
