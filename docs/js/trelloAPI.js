/**
 * API do Trello para o frontend
 * Funções para interagir com a API do Trello diretamente do navegador
 */

/**
 * Cria um card no Trello via backend para não expor chaves no frontend.
 * @param {string} titulo - Título do card.
 * @param {string} descricao - Descrição do card (opcional).
 * @returns {Promise<Object>} - Resposta do endpoint backend que cria o card.
 */
async function criarCardTrello(titulo, descricao) {
    try {
        if (typeof BACKEND_URL === 'undefined') {
            throw new Error('config.js não carregado: BACKEND_URL indefinido');
        }
        const response = await fetch(`${BACKEND_URL}/api/trello-card`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ titulo, descricao })
        });

        if (!response.ok) {
            const text = await response.text();
            throw new Error(`Erro ao criar card via backend: ${response.status} ${response.statusText} - ${text}`);
        }

        const data = await response.json();
        console.log('Card criado no Trello (via backend):', data);
        return data;
    } catch (err) {
        console.error('Erro ao criar card no Trello (frontend->backend):', err);
        throw err;
    }
}

/**
 * Outras funções úteis do Trello podem ser adicionadas aqui
 */

// Torna as funções disponíveis globalmente
window.TrelloAPI = {
    criarCardTrello
};