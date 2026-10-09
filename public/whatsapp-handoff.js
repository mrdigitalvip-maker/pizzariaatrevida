// Reserve the browsing context during the customer's click, before any await.
export function prepareWhatsApp(browser=window){
 let tab=null;
 try{tab=browser.open('about:blank','_blank');if(tab){tab.opener=null;tab.document.title='Preparando seu pedido · Atrevida';tab.document.body.textContent='Registrando seu pedido na Atrevida… Aguarde. Se esta janela continuar aberta, volte à loja para conferir a mensagem.';}}
 catch{try{tab?.close()}catch{}tab=null;}
 return {
  open(value){const url=new URL(value);if(url.origin!=='https://wa.me'||url.pathname!=='/557798071769'||!url.searchParams.get('text'))throw Error('Não foi possível preparar o WhatsApp da pizzaria.');try{if(tab&&!tab.closed){tab.location.replace(url.href);return 'reserved';}}catch{}browser.location.assign(url.href);return 'same-tab';},
  cancel(){try{if(tab&&!tab.closed)tab.close()}catch{}}
 };
}
