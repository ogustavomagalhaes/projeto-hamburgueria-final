const express = require('express');
const path = require('path');
const fs = require('fs');
// Carrega variáveis de ambiente do arquivo `process.env` (renomeado para .env é recomendado)
require('dotenv').config();

// Importa função para criar card no Trello no backend
const { criarCardTrello } = require('./utils/pedidoUtilsBackend');

const app = express();
const PORT = process.env.PORT || 3000;


// 1. Permite que o servidor entenda JSON enviado no corpo das requisições
app.use(express.json());

// 2. Serve os arquivos estáticos (HTML, CSS, JS) da sua pasta
app.use(express.static(path.join(__dirname, 'docs')));

// Rota para LER/GET todos os pedidos
app.get('/api/pedidos', (req, res) => {
  const caminhoArquivo = path.join(__dirname, 'pedidos.json');

  fs.readFile(caminhoArquivo, 'utf8', (err, data) => {
    if (err) {
      if (err.code === 'ENOENT') {
        return res.json([]);
      }
      console.error('Erro ao ler o arquivo de pedidos:', err);
      return res.status(500).json({ message: 'Erro ao ler os pedidos.' });
    }
    res.json(JSON.parse(data));
  });
});

// 3. Define a rota que o seu formulário está tentando acessar (POST /api/pedidos)
app.post('/api/pedidos', (req, res) => {
  const novoPedido = req.body;
  const caminhoArquivo = path.join(__dirname, 'pedidos.json');

  // Adiciona a data/hora ao pedido
  novoPedido.data_pedido = new Date().toISOString();

  // Função para ler o arquivo de pedidos existente
  fs.readFile(caminhoArquivo, 'utf8', (err, data) => {
    let pedidos = [];
    if (!err && data) {
      pedidos = JSON.parse(data);
    }

    // ==================== LÓGICA DO NOVO ID (CORRIGIDA) ====================
    // A linha Date.now() foi REMOVIDA daqui.
    if (pedidos.length > 0) {
      const ultimoPedido = pedidos[pedidos.length - 1];
      novoPedido.id = ultimoPedido.id + 1;
    } else {
      novoPedido.id = 1;
    }
    // ======================================================================

    pedidos.push(novoPedido);

    const dadosParaSalvar = JSON.stringify(pedidos, null, 2);

    fs.writeFile(caminhoArquivo, dadosParaSalvar, (writeErr) => {
      if (writeErr) {
        console.error('Erro ao salvar o pedido:', writeErr);
        return res.status(500).json({ message: 'Erro interno ao salvar o pedido.' });
      }

      console.log('========== NOVO PEDIDO SALVO! ==========');
      console.log(`ID do Pedido: ${novoPedido.id}`);
      console.log('========================================');

      // Tenta criar um card no Trello com o pedido formatado (não bloqueia a resposta ao cliente)
      (async () => {
        try {
          const titulo = `Pedido #${novoPedido.id} - ${novoPedido.nome}`;
          await criarCardTrello(titulo + '\n' + (novoPedido.informacoes_adicionais || ''));
          console.log('Pedido também enviado para o Trello.');
        } catch (err) {
          console.error('Falha ao criar card no Trello (não bloqueante):', err.message || err);
        }
      })();

      res.status(200).json({ 
        message: 'Pedido recebido e salvo com sucesso!',
        id: novoPedido.id 
      });
    });
  });
});

// Endpoint para criar card no Trello a partir do frontend sem expor chaves
app.post('/api/trello-card', express.json(), async (req, res) => {
  const { titulo, descricao } = req.body || {};
  if (!titulo) {
    return res.status(400).json({ message: 'Campo "titulo" é obrigatório.' });
  }

  try {
    const texto = titulo + (descricao ? '\n' + descricao : '');
    const data = await criarCardTrello(texto);
    return res.status(201).json({ message: 'Card criado', card: data });
  } catch (err) {
    console.error('Erro ao criar card via endpoint /api/trello-card:', err.message || err);
    return res.status(500).json({ message: 'Erro ao criar card no Trello.' });
  }
});

// 4. Inicia o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando! Acesse http://localhost:${PORT} no seu navegador.` );
});
