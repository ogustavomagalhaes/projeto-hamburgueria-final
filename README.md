# Como publicar seu projeto com backend e frontend separados

## 1. Hospede o backend Node.js

Você pode usar serviços gratuitos como:
- [Render](https://render.com/)
- [Vercel](https://vercel.com/)
- [Railway](https://railway.app/)
- [Heroku](https://heroku.com/) (pode exigir cartão de crédito)

### Passos básicos (exemplo Render):
1. Crie uma conta em https://render.com/
2. Clique em "New Web Service" e conecte seu repositório do backend (pasta do `server.js`).
3. Configure o build command para `npm install` e start command para `node server.js`.
4. Adicione as variáveis de ambiente (`TRELLO_KEY`, `TRELLO_TOKEN`, `TRELLO_LIST_ID`) na seção de Environment.
5. Após deploy, anote a URL do backend (ex: `https://seu-backend.onrender.com`).

## 2. Configure o frontend para usar o backend

1. No arquivo `docs/js/config.js`, altere:
   ```js
   const BACKEND_URL = 'https://seu-backend.onrender.com';
   ```
2. Faça deploy do frontend normalmente no GitHub Pages.

## 3. Teste

- Acesse seu site no GitHub Pages.
- Envie um pedido normalmente.
- O pedido será enviado para o backend hospedado, que criará o card no Trello.

## 4. Dicas
- O backend precisa estar sempre online para receber pedidos.
- Nunca exponha suas chaves do Trello no frontend.
- Se quiser testar localmente, rode o backend com `node server.js` e use `const BACKEND_URL = 'http://localhost:3000'` no `config.js`.

---

Dúvidas? Veja os logs do backend para erros de autenticação ou problemas de rede.
