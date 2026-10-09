# WhatsApp independente da sessão — 09/10/2026

Mensagem montada localmente e aberta no clique, antes de solicitar sessão, orçamento ou salvamento. Inclui itens, personalização, preços do catálogo, desconto, endereço, referência de solicitação e pagamento na entrega. Taxa e localização precisa confirmadas no atendimento. Nenhuma mensagem enviada automaticamente: cliente toca em Enviar no WhatsApp.

Registro no painel em paralelo: falha não fecha WhatsApp e não gera confirmação falsa. Compra direta aguarda salvamento e pede ao cliente que confira seu telefone (não é verificação por SMS). Pix na entrega incluído, cobrança online não oferecida.

Sessão anônima aceita token aleatório existente por cabeçalho quando cookie indisponível; /session entrega token sem logá-lo, frontend conserva somente nesta sessão do navegador; conta autenticada continua prioritária. Proxy Vercel encaminha cabeçalho. Sem mudanças em acesso da equipe ou códigos.

Testes: fechamento com sessão 401, salvamento falhando, popup bloqueado, pedido personalizado, sessão sem cookie até pedido real em banco de teste, isolamento, Pix offline, duplicação, cozinha, entregador, proxy e build. WhatsApp físico e impressora não testados.
