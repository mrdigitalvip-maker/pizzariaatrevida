# Pizzaria Atrevida

Loja pública, carrinho, atendimento por WhatsApp, painel privado, cozinha, quatro entregadores, clientes e cashback.

- Loja atual: https://pizzaria-atrevida-lem.mr-bruno01.chatgpt.site
- Administração: https://pizzaria-atrevida-lem.mr-bruno01.chatgpt.site/equipe
- Vercel: importe este repositório e mantenha a configuração `vercel.json` (preset Other).
- Guia operacional, arquitetura, condições dos benefícios e limitações: [OPERACAO.md](OPERACAO.md).
- Testes: `node tests/order-flow.mjs` (Node 24). Não usam dados de produção.

## Domínio Vercel confirmado pelo proprietário

Após importar e implantar esta edição: https://pizzariaatrevida.vercel.app/ (público) e https://pizzariaatrevida.vercel.app/equipe (equipe com códigos privados).

Parte das imagens é armazenada sem alteração em `.assets-base64` devido à limitação do envio de blobs pelo conector. O build restaura os arquivos originais automaticamente, sem serviço externo de imagens.

## Arquitetura

Frontend HTML/CSS/JS e APIs com armazenamento persistente. O backend atual usa Cloudflare Worker/D1/R2. A entrada Vercel preparada serve o frontend e encaminha APIs ao backend existente para preservar pedidos, fotos e códigos privados. Não é uma migração do banco para a Vercel.

A implantação Vercel ainda precisa ser validada em produção; o conector não encontrou o projeto na equipe e negou permissão para criação. Nenhum domínio Vercel é anunciado como publicado.

Os acessos de equipe são mantidos apenas no ambiente de execução; não há códigos reais neste repositório. Clientes podem pedir sem cadastro.
