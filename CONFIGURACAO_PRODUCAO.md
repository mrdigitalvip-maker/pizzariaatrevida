# Atrevida — configuração e validação de produção

Esta edição continua o mesmo sistema. Banco atual: Cloudflare D1 gerenciado pelo Sites; imagens de entregadores no R2. O frontend Vercel encaminha `/api` ao mesmo backend, preservando cadastros, códigos e pedidos. Não existe outro banco da pizzaria ativo nem sincronização com projetos alheios.

## Supabase: migração não realizada

A conexão disponível não listou nenhum projeto Atrevida. Não foi criado um novo projeto nem reaproveitado banco de outro produto. A solicitação de Supabase como fonte central permanece pendente, e não deve ser descrita como concluída. É necessário identificar o projeto exclusivo, ou confirmar a organização e o custo para criar um. A ferramenta de criação exige essas confirmações.

A migração deverá transferir integralmente usuários, hashes/códigos, sessões, pedidos com snapshots, eventos, pagamentos, filas e perfis; validar contagens e integridade; aplicar RLS sem acesso público aos dados operacionais; então trocar o backend em uma única virada, sem escrita dupla. Pedidos atuais continuam no banco original até isso acontecer. Não basta adicionar chaves Supabase: há trabalho de migração e adaptação SQL pendente.

## Segredos do backend

Configurar no backend que executa `server/api.js`, nunca no frontend nem em `NEXT_PUBLIC_*`:

- `GOOGLE_MAPS_API_KEY`: Geocoding API e Routes API habilitadas, restrita a essas APIs, com cotas e faturamento definidos pelo proprietário.
- `MERCADOPAGO_PUBLIC_KEY`: chave pública da aplicação da pizzaria.
- `MERCADOPAGO_ACCESS_TOKEN`: token privado da conta comercial da pizzaria.
- `MERCADOPAGO_WEBHOOK_SECRET`: assinatura das notificações dessa aplicação.
- `PAYMENT_PUBLIC_ORIGIN`: origem HTTPS que encaminha os webhooks ao backend; sem barra final. Inicialmente pode ser a origem Sites. Atualizar/testar após domínio próprio.
- `CLOUDPRNT_USERNAME`, `CLOUDPRNT_PASSWORD`: credenciais exclusivas e fortes do equipamento.
- `CLOUDPRNT_MAC`: MAC da impressora autorizada.

Nunca usar a conta pessoal do desenvolvedor para receber vendas da pizzaria. Antes de ativar meios online, executar transações reais de sandbox com credenciais de teste da conta da loja. Nenhuma credencial foi inventada ou inserida nesta edição.

## Entrega

Origem: Rua I, quadra N, lote 5, Top Park, Luís Eduardo Magalhães/BA. As coordenadas não foram adivinhadas. No painel, confirmar o ponto pelo GPS estando na pizzaria ou informar coordenadas conferidas no Google Maps.

Faixas iniciais por percurso rodoviário: até 2 km R$6,99; 4 km R$9,99; 6 km R$12,99; 9 km R$15,99; 12 km R$17,99. Faixas são editáveis no painel, preservando os limites monetários. Clientes conectados recebem até R$2 de desconto, sem frete menor que R$6,99. Endereços fora da área são recusados para checkout automático; atendimento pode combinar exceção sem inventar taxa.

Geocodificação sem correspondência precisa exige GPS no destino. Cliente confere ponto/endereço e taxa antes de confirmar. Cotação de 15 minutos vinculada à sessão, endereço e revisão da configuração. Alterações exigem nova revisão. Erro no mapa não vira frete fixo. Sem configuração de mapas, retirada funciona e entrega automática fica indisponível com mensagem clara.

## Preços, promoção e fidelidade

16 bebidas definitivas fornecidas pelo proprietário. Itens antigos não confirmados estão desativados; IDs antigos foram preservados. Fotografias de produtos estão no próprio pacote, inclusive no build Vercel; fontes registradas em `public/assets/drinks/*sources.json`. Fotografias de varejistas não têm licença de reutilização explicitamente verificada; substituir por fotos próprias/autorizadas quando disponíveis.

10% de inauguração sobre produtos, inclusive bordas e bebidas, com arredondamento para baixo em centavos no desconto. Entrega não recebe esse desconto. A promoção pode ser desligada em Operação. Descontos das cinco pizzas já destacadas continuam no preço do item; o desconto de inauguração incide sobre esse subtotal. Cashback resgatado é aplicado depois da promoção; limite de 20% dos produtos já descontados. Cashback de 3% é concedido após entrega e registro de recebimento; resgate após cinco compras. Nenhum ajuste muda os snapshots de pedidos antigos.

## Pagamentos

Dinheiro na entrega e cartão na entrega funcionam sem provedor online. Troco é validado contra o total; cartão na entrega exige levar maquininha. Nenhuma escolha marca pagamento como recebido.

Pix online e cartão online usam Mercado Pago Payments API + Card Payment Brick oficial, habilitados apenas com configuração completa. Cartão/CVV não são persistidos; somente token transitório é enviado ao provedor. O valor vem do pedido salvo, não do navegador. Pix mostra QR/copia e cola, valor e estado pendente. Aprovação só é aplicada depois de webhook assinado e consulta autenticada ao pagamento, validando pedido, tentativa, BRL e valor. O recebimento manual é proibido para online.

Idempotência por pedido e tentativa; uma tentativa não encerrada impede cobrança paralela. Timeout mantém tentativa em verificação. Consulta recupera referência do provedor se a resposta de criação se perdeu; a aprovação continua dependente do webhook. Rejeição/cancelamento permitem nova tentativa explícita no mesmo pedido. Notificações repetidas não criam outro pedido nem outra comanda.

Webhook: `POST /api/payments/webhook`, evento `payment`, assinatura HMAC. Configurar e testar a URL no Mercado Pago. Cancelamento/estorno de cobrança online é operado no painel Mercado Pago; o sistema aguarda o webhook correspondente antes de permitir cancelar o pedido. Não há botão local que finja estorno. Reembolsos posteriores à entrega exigem revisão manual dos benefícios de fidelidade; reversão automática de cashback ainda não implementada.

## Impressão

CloudPRNT HTTP: `/api/printer/cloudprnt`, autenticação Basic sobre HTTPS, MAC autorizado, mídia `text/plain` UTF-8, equipamentos com suporte a jobToken e essa mídia. Selecionar modelo/firmware compatível antes da compra. A integração precisa de teste físico de 80 mm, acentos, quebra de linha e corte no modelo escolhido; compatibilidade universal não é afirmada.

Pedido salvo primeiro. Duas comandas por pedido novo elegível: cozinha e entrega/balcão, protegidas por unicidade `(order_id,type)`. Online só entra na fila após pagamento aprovado. Falha da fila não elimina pedido; o polling da própria impressora reconcilia os pedidos elegíveis, sem depender de telefone/notebook. Não imprime pedidos antigos automaticamente.

`PENDING → PROCESSING → PRINTED` somente após resposta de sucesso da impressora. Falha/ausência de confirmação vira `FAILED`; painel solicita conferir o papel antes de repetir, reduzindo cópias acidentais. Retry explícito com espera mínima de 30 s, limitado a cinco tentativas. Sem configuração, pedidos permanecem na fila e painel mostra CONFIGURATION_REQUIRED. Impressão manual/PDF não marca a fila como PRINTED.

## Validação realizada e pendências

`node tests/order-flow.mjs`: regressões de catálogo, meio a meio/borda, promoções, snapshots, frete mínimo/faixas/limite, cotação vencida/adulterada, cadastro, segurança de códigos, entregadores, cashback, pagamento offline, idade, integração de pagamentos com dublês locais, assinatura inválida/válida, webhook repetido, fila, equipamento indisponível, retry e confirmação de impressão.

`node tests/bridge-flow.mjs`: encaminhamento Vercel, domínio, cookies e CSRF. Build Vercel reconstrói imagens a partir dos arquivos base64 versionados.

Não executados: transações sandbox reais de Pix/cartão (faltam credenciais), impressão física (falta equipamento), validação visual interativa em celular nesta sessão, migração/RLS Supabase (falta projeto e adaptação), implantação Vercel (conector retorna recurso não encontrado). Não marcar esses testes como PASS.

## Aceitação pelo dono

1. Entre no painel usando o mesmo e-mail e código privado já fornecido.
2. Confira bebidas e a promoção; configure a localização exata da loja e o serviço de mapas antes de testar entregas.
3. Faça um pedido de retirada como cliente, sem login, escolhendo dinheiro ou cartão na entrega; revise os 10%, confirme e abra a comanda.
4. No painel, confirme prazo, avance preparo/pronto/entrega, e registre recebimento somente quando efetivamente recebido.
5. Repita com cadastro e confira benefícios, entregador e histórico.
6. Com mapas ativos, valide endereço próximo, distante e fora da área. Depois, com credenciais de teste e impressora configuradas, valide Pix, cartão, falhas e impressão física antes da operação comercial.
