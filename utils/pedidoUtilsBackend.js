// Para usar no Node.js (backend)
// Instale primeiro: npm install node-fetch@2

/**
 * Cria um card no Trello para o pedido especificado.
 * @param {string} nomePedido - O nome do pedido a ser usado como título do card.
 * @returns {Promise<Object>} - Uma promessa que resolve para a resposta da API do Trello.
 */
const criarCardTrello = async (nomePedido) => {
    // Importa dinamicamente o fetch para Node.js
    const fetch = (await import('node-fetch')).default;
    
    try {
        const idList = process.env.TRELLO_LIST_ID;
        const key = process.env.TRELLO_KEY;
        const token = process.env.TRELLO_TOKEN;
        
        const url = `https://api.trello.com/1/cards?` +
                    `idList=${idList}&` +
                    `key=${key}&` +
                    `token=${token}&` +
                    `name=${encodeURIComponent(nomePedido)}`;
                    
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Accept': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error(`Erro ao criar card no Trello: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('Card criado no Trello (backend):', data);
        return data;
        
    } catch (err) {
        console.error('Erro ao criar card no Trello (backend):', err);
        throw err;
    }
};

/**
 * Outras funções utilitárias para pedidos
 */
function calcularEstatisticasPedidos(pedidos) {
    const stats = {
        total: pedidos.length,
        porLocal: {},
        porPagamento: {},
        combosPopulares: {},
        bebidasPopulares: {}
    };

    pedidos.forEach(pedido => {
        // Count by location
        stats.porLocal[pedido.local_consumo] = (stats.porLocal[pedido.local_consumo] || 0) + 1;
        
        // Count by payment method
        stats.porPagamento[pedido.forma_pagamento] = (stats.porPagamento[pedido.forma_pagamento] || 0) + 1;
        
        // Count popular drinks and ingredients
        if (pedido.detalhes_combos) {
            pedido.detalhes_combos.forEach(combo => {
                if (combo.bebida) {
                    stats.bebidasPopulares[combo.bebida] = (stats.bebidasPopulares[combo.bebida] || 0) + 1;
                }
                if (combo.ingredientes) {
                    combo.ingredientes.forEach(ingrediente => {
                        stats.combosPopulares[ingrediente] = (stats.combosPopulares[ingrediente] || 0) + 1;
                    });
                }
            });
        }
    });

    return stats;
}

function filtrarPedidosPorData(pedidos, dataInicio, dataFim) {
    return pedidos.filter(pedido => {
        const dataPedido = new Date(pedido.data_pedido);
        return dataPedido >= new Date(dataInicio) && dataPedido <= new Date(dataFim);
    });
}

function buscarPedidos(pedidos, termo) {
    return pedidos.filter(pedido => 
        pedido.nome.toLowerCase().includes(termo.toLowerCase()) ||
        pedido.telefone.includes(termo)
    );
}

module.exports = {
    criarCardTrello,
    calcularEstatisticasPedidos,
    filtrarPedidosPorData,
    buscarPedidos
};