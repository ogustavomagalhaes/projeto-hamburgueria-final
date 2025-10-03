// Aguarda o conteúdo da página carregar completamente antes de executar o script

// Carrega config do backend
// (garante que config.js foi incluído antes deste script)
if (typeof BACKEND_URL === 'undefined') {
  alert('Erro: config.js não foi carregado. Inclua <script src="js/config.js"></script> antes de app.js');
}

document.addEventListener('DOMContentLoaded', function() {

  const form = document.getElementById('form-pedido');
  
  form.addEventListener('submit', function(e) {
    e.preventDefault(); // Evita o reload da página ao enviar

    // 1. Pegar valores simples do formulário usando seus IDs
    const nome = document.getElementById('nome').value;
    const telefone = document.getElementById('telefone').value;
    const quantidadeCombos = document.getElementById('quantidadeCombos').value;
    const info_extra = document.getElementById('info_extra').value;
    const local = document.getElementById('local').value;
    const pagamento = document.getElementById('pagamento').value;

    // 2. Coletar detalhes de cada combo de forma estruturada
    const combos = [];
    // Itera de 1 até a quantidade de combos selecionada pelo usuário
    for (let i = 1; i <= parseInt(quantidadeCombos); i++) {
      // Pega as opções de ingredientes (checkboxes) para o combo atual
      const ingredientes = Array.from(
        document.querySelectorAll(`input[name="combo${i}"]:checked`)
      ).map(checkbox => checkbox.value);

      // Pega o ponto da carne (radio) para o combo atual
      // O '?' (optional chaining) evita erro se nenhum for selecionado
      const estadoCarne = document.querySelector(`input[name="estadoCombo${i}"]:checked`)?.value || 'Não selecionado';
      
      // Pega a bebida (radio) para o combo atual
      const refrigerante = document.querySelector(`input[name="refCombo${i}"]:checked`)?.value || 'Não selecionado';

      // Adiciona um objeto organizado ao array de combos
      combos.push({
        combo_numero: i,
        ingredientes: ingredientes,
        ponto_carne: estadoCarne,
        bebida: refrigerante
      });
    }

    // 3. Montar o objeto final para envio
    const pedido = {
      nome,
      telefone,
      quantidade: quantidadeCombos,
      detalhes_combos: combos, // Envia um array de objetos, muito mais fácil de processar no backend
      informacoes_adicionais: info_extra,
      local_consumo: local,
      forma_pagamento: pagamento
    };

    // Exibe o objeto no console para depuração. Você pode remover esta linha em produção.
    console.log('Dados a serem enviados:', JSON.stringify(pedido, null, 2));
    
    // 🆕 Criar texto formatado com todos os dados do pedido para o Trello
    function formatarPedidoParaTrello(pedido) {
      let textoFormatado = `🍔 PEDIDO - ${pedido.nome}\n`;
      textoFormatado += `📞 ${pedido.telefone}\n`;
      textoFormatado += `📦 ${pedido.quantidade} combo(s)\n`;
      
      // Adicionar detalhes de cada combo
      pedido.detalhes_combos.forEach((combo, index) => {
        textoFormatado += `\n🥪 Combo ${combo.combo_numero}:\n`;
        textoFormatado += `   • Ingredientes: ${combo.ingredientes.join(', ')}\n`;
        textoFormatado += `   • Ponto da carne: ${combo.ponto_carne}\n`;
        textoFormatado += `   • Bebida: ${combo.bebida}\n`;
      });
      
      textoFormatado += `\n📍 Local: ${pedido.local_consumo}`;
      textoFormatado += `\n💳 Pagamento: ${pedido.forma_pagamento}`;
      
      if (pedido.informacoes_adicionais && pedido.informacoes_adicionais.trim()) {
        textoFormatado += `\n📝 Obs: ${pedido.informacoes_adicionais}`;
      }
      
      return textoFormatado;
    }
    
    const pedidoFormatado = formatarPedidoParaTrello(pedido);

    // 4. Enviar para o backend hospedado
    fetch(`${BACKEND_URL}/api/pedidos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(pedido)
    })
    .then(res => {
      if (!res.ok) {
        // Se a resposta do servidor não for de sucesso (ex: erro 400 ou 500)
        throw new Error(`Erro na requisição: ${res.statusText}`);
      }
      return res.json();
    })
    .then(data => {
      // Supondo que a API retorna um objeto com o ID do pedido, como { id: 123 }
      alert('Pedido enviado com sucesso! ID do Pedido: ' + data.id);
      
      // Criar card no Trello após envio bem-sucedido com TODOS os dados formatados
      if (window.TrelloAPI) {
        window.TrelloAPI.criarCardTrello(pedidoFormatado)
          .then(() => console.log('Card criado no Trello com sucesso!'))
          .catch(err => console.error('Erro ao criar card no Trello:', err));
      }
      
      form.reset(); // Limpa o formulário
    })
    .catch(err => {
      console.error('Falha ao enviar o pedido:', err);
      // Simula uma resposta de sucesso para fins de teste, já que não temos um backend real.
      // REMOVA as 3 linhas abaixo quando tiver uma API de verdade.
      alert('Simulação: Pedido enviado com sucesso! ID do Pedido: ' + Math.floor(Math.random() * 1000));
      
      // Criar card no Trello também na simulação com TODOS os dados formatados
      if (window.TrelloAPI) {
        window.TrelloAPI.criarCardTrello(pedidoFormatado)
          .then(() => console.log('Card criado no Trello com sucesso!'))
          .catch(err => console.error('Erro ao criar card no Trello:', err));
      }
      
      form.reset();
      // Mantenha a linha abaixo para o caso de erro real.
      // alert('Ocorreu um erro ao enviar seu pedido. Por favor, tente novamente.');
    });
  });
});