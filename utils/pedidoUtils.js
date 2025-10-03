// This code sample uses the 'node-fetch' library:
// https://www.npmjs.com/package/node-fetch

import fetch from 'node-fetch';

/**
 * Cria um card no Trello para o pedido especificado.
 * @param {string} nomePedido - O nome do pedido a ser usado como título do card.
 * @returns {Promise<string>} - Uma promessa que resolve para a resposta da API do Trello como texto.
 */
const criarCardTrello = async (nomePedido) => {
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
        console.log(`Response: ${response.status} ${response.statusText}`);
        const text = await response.text();
        console.log(text);
        return text;
    } catch (err) {
        console.error(err);
        throw err;
    }
};

export { criarCardTrello };
