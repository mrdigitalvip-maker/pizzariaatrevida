# Atrevida — operação e teste de aceitação

Acesso da equipe: `/equipe`. E-mails, códigos já entregues e sessões existentes foram preservados. Cliente não precisa de login. Entregador entra pelo link exclusivo atribuído ao pedido, sem acessar a administração.

## Fluxo diário

1. Cliente escolhe pizza, tamanho, uma ou duas metades, borda de R$8 e bebidas. Entrega custa R$7; retirada é gratuita. Pode solicitar horário futuro e compartilhar, por permissão, a localização do destino.
2. O pedido é gravado antes de abrir o WhatsApp. A mensagem precisa ser enviada pelo cliente. A equipe confirma valor e prazo no painel. Conversas do WhatsApp não são lidas automaticamente.
3. Bebidas ainda dependem de orçamento. O cliente aprova pela loja ou pelo link de acompanhamento. A equipe também pode registrar uma aprovação expressa recebida por telefone/WhatsApp, com registro no histórico.
4. Cozinha: confirmado → em preparo → pronto. Não há avanço fictício por passagem de tempo.
5. Entregas: registrar responsável e veículo, gerar link exclusivo e encaminhá-lo ao entregador. Novo link revoga o anterior. O entregador personaliza os dados daquela entrega, abre a rota, registra a saída e confirma o recebimento pelo cliente.
6. Cliente, equipe e entregador consultam a mesma situação do pedido. Ao encerrar, os dados pessoais são ocultados do link do entregador.

## Áreas

- Operação: indicadores, fila, pesquisa, confirmação, orçamento, notas internas e links.
- Cozinha: fila ordenada pelos horários, sabores e preparo.
- Entregas: pedidos de entrega e atribuição de responsável.
- Agenda: pedidos com horário solicitado. Aceitação depende da pizzaria.
- Clientes: pesquisa por nome/WhatsApp, quantidade e valores dos pedidos entregues.
- Acessos: mantém as regras anteriores. Apenas Bruno libera novos lotes de códigos.
- Registrar pedido: lançamento de balcão, WhatsApp ou telefone, com vários itens e agendamento opcional.

A atualização ocorre a cada 15 segundos no painel visível e 10 segundos nos links de entrega/acompanhamento. Notificações push exigem permissão e suporte do aparelho. O som é opt-in e funciona com o painel aberto. Os indicadores não significam pagamento processado pelo site.

## Teste com o dono

1. Abrir loja em outro navegador como cliente e administração com o acesso já entregue.
2. Pedir pizza com borda, conferir total e taxa, enviar mensagem no WhatsApp.
3. Confirmar prazo no painel e percorrer a cozinha.
4. Compartilhar o link do pedido com o entregador e testar rota/saída/conclusão.
5. Conferir a mesma etapa nas três telas.
6. Testar um pedido com bebida e aprovação do orçamento, um agendado e um lançamento manual.
7. Ativar push no aparelho e conferir o aviso de teste. Não reutilizar códigos consumidos.

## Google e domínio

A loja tem canonical, dados estruturados de restaurante, Open Graph, robots e sitemap. Rotas privadas ficam fora do sitemap e usam noindex. Quando o domínio for comprado, conectar ao provedor, atualizar canonical/URLs do sitemap/dados estruturados e validar no Search Console. Esta preparação não garante indexação ou posição no Google.

## Verificação nesta edição

Testes isolados de preços, persistência, idempotência, autenticação existente, CSRF, segregação entre clientes, permissões do entregador, orçamento e criptografia push. Cenário adicional: pedido manual agendado → acompanhamento privado → confirmação → cozinha → saída → entrega; repetição segura do envio, localização e ocultação dos dados no encerramento. Não foram enviados pedidos de teste ao WhatsApp real.

## Edição de clientes e entregadores — 7 de outubro de 2026

- Cliente pode continuar sem cadastro. Cadastro opcional por e-mail, senha exclusiva da loja e recuperação por código privado mostrado na criação. Não há envio de SMS nem verificação de caixa postal.
- Entrega: R$8,99 visitante; R$6,99 com sessão de cliente válida. Retirada grátis. O servidor calcula os valores e mantém o valor histórico no pedido.
- Cashback: 3% dos produtos efetivamente pagos em pedidos entregues; entrega excluída. Após 5 compras entregues, uso limitado a 20% dos produtos da próxima compra. Crédito reservado ao enviar, devolvido no cancelamento. Operações atômicas com saldo protegido impedem débito duplicado e saldo negativo.
- Entregas: quatro perfis, foto JPEG salva, link privado revogável, atribuição de pedidos. Na área /entregador o responsável vê apenas pedidos atribuídos a seu perfil e pode passar de pronto para a caminho e entregue. Endereço ocultado após conclusão. Guarde o link privado; gerar outro revoga o anterior.
- Personalização por acesso e por aba: título, cor, densidade, ordem e filtro, persistidos no banco. Contadores indicam pendências da lista e clientes com pedidos hoje; não são contadores de mensagens não lidas.
- Clientes: lista privada dos últimos 200 cadastros e histórico por telefone informado. Telefones/e-mails não são usados para dar acesso a pedidos de terceiros.
- Grade de 12 bebidas: valores de teste comercial definidos pelo solicitante para validação do dono, sem alegação de tabela oficial. Referências consultadas: https://volarepizzaria.com.br/wp-content/uploads/Cardapio-Versao-Digital-2026-ok.pdf e https://www.bordadeouropizzaria.com/ . Valores em public/catalog.js. Confirmar estoque e preços antes de operação comercial continuada.
- Atualizações de pedido a cada 5 segundos com página aberta; push depende de permissão, navegador compatível e conectividade. Não há simulação de movimentação GPS nem avanço de status por relógio.

## GitHub e entrada pela Vercel

Repositório solicitado: mrdigitalvip-maker/pizzariaatrevida. Não contém códigos reais, senhas ou arquivos de ambiente.

A configuração vercel.json publica o frontend e a função api/bridge.js encaminha as APIs para o backend atual. O banco, fotos, códigos da equipe e serviço de push continuam no serviço existente; esta configuração NÃO migra banco para a Vercel. Não desligue o backend atual. A publicação Vercel não pôde ser validada porque o conector retornou projeto não encontrado e criação sem permissão na equipe Mr Digital.

Para publicar: importar este repositório na Vercel, preset Other, manter os comandos do vercel.json. SITE_URL opcional deve conter a URL HTTPS definitiva do domínio comprado. O build reescreve canonical e sitemap com SITE_URL ou VERCEL_PROJECT_PRODUCTION_URL. Links: / público; /equipe administração; /entregador exige link exclusivo gerado pela equipe. Notificações devem ser ativadas novamente no novo domínio. Cookies não migram entre domínios; os códigos existentes continuam válidos no mesmo backend, mas os já usados continuam consumidos.

Antes de promover a entrada Vercel, testar autenticação, gravação de pedido, API de fotos, notificações e limites: o backend recebe tráfego intermediado pela função, podendo agrupar limites de IP. O deploy atual pelo endereço original permanece a opção validada até concluir esse teste.

Validação automática: node tests/order-flow.mjs. Cobre conta/recuperação, taxas, sabores, preços, carrinho, idempotência, isolamento, códigos privados, entregadores, transições, preferências, cashback e push criptografado. Não envia mensagens WhatsApp nem consome códigos reais.

## Edição de atendimento e operação — pesquisa aplicada

Referências primárias consultadas: Square, personalização de pedidos online (https://api.squareup.com/help/us/en/article/6861-create-an-order-online-page-with-square-online-store); Square KDS e temporizadores (https://squareup.com/help/us/en/article/7944-get-started-with-square-kds-android); Toast, fluxo de conclusão no KDS (https://support.toasttab.com/en/article/Item-and-Order-Fulfillment-on-KDS). São referências de recursos existentes, não evidência de um ranking global nem promessa de aumento de vendas.

Módulos e funcionamento:
- Loja: primeira compra sem cadastro obrigatório, recompra com preços atuais, sugestão opcional de bebida, carrinho, benefícios e acompanhamento.
- Operação: centro de atendimento para pausar novos pedidos, sugerir prazo e marcar sabores/bebidas indisponíveis. Bloqueio validado no servidor, inclusive segunda metade da pizza. Painel de sete dias mostra pedidos criados e valores dos entregues, sem confundir receita com lucro.
- Cozinha: etapas por clique e confirmação, previsão escolhida em lista, horários efetivamente registrados e aviso de prazo ultrapassado. Nenhuma transição é disparada pelo relógio.
- Entregas: responsável atribuído e perfil persistente; nome, veículo e foto ficam visíveis somente ao cliente autorizado quando o pedido está pronto ou a caminho. A foto exige cookie do cliente ou token de acompanhamento, não é uma galeria pública de entregadores.
- Agenda, Clientes e Acessos: capacidades anteriores e credenciais preservadas.
- Visual: relógio numerado + hora digital da Bahia, barra de cinco etapas para entrega e quatro para retirada, animação suave e respeito à preferência por movimento reduzido. A loja pública não oferece link de administração, atalho de instalação para administração nem iFood.

Notificações continuam dependentes da permissão e suporte do aparelho. Atualizações visuais por consulta periódica não equivalem a rastreamento GPS em movimento. Testes automatizados adicionais cobrem pausa, disponibilidade de meia pizza, informações do entregador e privacidade da foto.
