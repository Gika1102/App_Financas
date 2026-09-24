/**
 * Cache em memória para preferências não persistentes.
 * Dados pessoais são persistidos exclusivamente por AppDatabase/Supabase.
 */
const Storage = (() => {
  const memory = new Map();
  /**
   * Obter valor do armazenamento
   * @param {string} key - Chave de armazenamento
   * @param {*} fallback - Valor padrão se não encontrar
   * @returns {Promise<*>} Valor armazenado ou fallback
   */
  async function get(key, fallback = null) {
    try {
      // Tenta storage externo primeiro (para PWA/Electron)
      if (window.storage && typeof window.storage.get === 'function') {
        const result = await window.storage.get(key);
        if (result && result.value) {
          return result.value;
        }
      }
    } catch (e) {
      console.warn(`Storage.get: External storage failed for "${key}"`, e);
    }

    return memory.has(key) ? memory.get(key) : fallback;
  }

  /**
   * Salvar valor no armazenamento
   * @param {string} key - Chave de armazenamento
   * @param {*} value - Valor a salvar
   * @returns {Promise<boolean>} true se sucesso, false se falhou
   */
  async function set(key, value) {
    try {
      if (window.storage && typeof window.storage.set === 'function') {
        await window.storage.set(key, value);
        return true;
      }
    } catch (e) {
      console.warn(`Storage.set: External storage failed for "${key}"`, e);
    }

    memory.set(key, value);
    return true;
  }

  /**
   * Remover valor do armazenamento
   * @param {string} key - Chave a remover
   * @returns {Promise<void>}
   */
  async function remove(key) {
    try {
      if (window.storage && typeof window.storage.remove === 'function') {
        await window.storage.remove(key);
      }
    } catch (e) {
      console.warn(`Storage.remove: External storage failed for "${key}"`, e);
    }

    memory.delete(key);
  }

  /**
   * Limpar todo armazenamento (cuidado!)
   * @returns {Promise<void>}
   */
  async function clear() {
    try {
      if (window.storage && typeof window.storage.clear === 'function') {
        await window.storage.clear();
      }
    } catch (e) {
      console.warn('Storage.clear: External storage failed', e);
    }

    memory.clear();
  }

  return {
    get,
    set,
    remove,
    clear
  };
})();
