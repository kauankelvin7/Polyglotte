const STORAGE_KEY = 'polyglotte_history';

/**
 * Salva o progresso de uma mídia
 * @param {Object} mediaData - { id, type, title, poster_path, backdrop_path, season, episode, timestamp, runtime }
 */
export const saveProgress = (mediaData) => {
  try {
    const history = getHistory();
    // Identificador único (se for série, atualizamos a mesma série para não duplicar, salvando o episódio mais recente)
    const uniqueId = `${mediaData.type}_${mediaData.id}`;
    
    // Remove o registro anterior se existir para colocá-lo no topo
    const filteredHistory = history.filter(item => `${item.type}_${item.id}` !== uniqueId);
    
    filteredHistory.unshift({
      ...mediaData,
      updatedAt: Date.now(),
    });

    // Mantém no máximo os últimos 20 itens para não lotar o storage
    const limitedHistory = filteredHistory.slice(0, 20);
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(limitedHistory));
  } catch (error) {
    console.error('Erro ao salvar progresso:', error);
  }
};

/**
 * Recupera o histórico de mídias assistidas
 * @returns {Array} Array de mídias assistidas
 */
export const getHistory = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Erro ao ler progresso:', error);
    return [];
  }
};

/**
 * Remove um item do histórico
 */
export const removeProgress = (id, type) => {
  try {
    const history = getHistory();
    const uniqueId = `${type}_${id}`;
    const newHistory = history.filter(item => `${item.type}_${item.id}` !== uniqueId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory));
  } catch (error) {
    console.error('Erro ao remover progresso:', error);
  }
};
