/**
 * Funções utilitárias compartilhadas
 */
const Utils = (() => {
  /**
   * Obter elemento por ID
   * @param {string} id - ID do elemento
   * @returns {HTMLElement|null} Elemento encontrado ou null
   */
  function getElement(id) {
    return document.getElementById(id);
  }

  /**
   * Obter múltiplos elementos por seletor CSS
   * @param {string} selector - Seletor CSS
   * @returns {NodeList} Elementos encontrados
   */
  function getElements(selector) {
    return document.querySelectorAll(selector);
  }

  /**
   * Criar data ISO do dia atual
   * @returns {string} Data em formato YYYY-MM-DD
   */
  function today() {
    const d = new Date();
    return Formatters.toISO(d.getDate(), d.getMonth() + 1, d.getFullYear());
  }

  /**
   * Criar data ISO de um objeto Date
   * @param {Date} date - Date object
   * @returns {string} Data em formato YYYY-MM-DD
   */
  function dateToISO(date) {
    if (!(date instanceof Date)) return '';
    return Formatters.toISO(date.getDate(), date.getMonth() + 1, date.getFullYear());
  }

  /**
   * Obter ano-mês atual
   * @returns {string} Ano-mês em formato YYYY-MM
   */
  function currentMonth() {
    const d = new Date();
    return Formatters.yearMonth(Formatters.toISO(1, d.getMonth() + 1, d.getFullYear()));
  }

  /**
   * Calcular percentual (com limites 0-100)
   * @param {number} value - Valor
   * @param {number} total - Total
   * @returns {number} Percentual entre 0 e 100
   */
  function percentage(value, total) {
    if (!total || total === 0) return 0;
    return Math.max(0, Math.min(100, (value / total) * 100));
  }

  /**
   * Clone profundo com structuredClone (fallback para browsers antigos)
   * @param {*} obj - Objeto a clonar
   * @returns {*} Clone profundo
   */
  function deepClone(obj) {
    if (typeof structuredClone === 'function') {
      return structuredClone(obj);
    }

    // Fallback para JSON (cuidado com funções e undefined)
    try {
      return JSON.parse(JSON.stringify(obj));
    } catch (e) {
      console.error('deepClone failed:', e);
      return obj;
    }
  }

  /**
   * Debounce para funções
   * @param {Function} fn - Função a executar
   * @param {number} delay - Delay em ms
   * @returns {Function} Função debounced
   */
  function debounce(fn, delay) {
    let timeoutId = null;

    return function (...args) {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        fn.apply(this, args);
      }, delay);
    };
  }

  /**
   * Throttle para funções
   * @param {Function} fn - Função a executar
   * @param {number} limit - Intervalo mínimo em ms
   * @returns {Function} Função throttled
   */
  function throttle(fn, limit) {
    let inThrottle = false;

    return function (...args) {
      if (!inThrottle) {
        fn.apply(this, args);
        inThrottle = true;
        setTimeout(() => {
          inThrottle = false;
        }, limit);
      }
    };
  }

  /**
   * Agrupar array por função
   * @param {Array} arr - Array a agrupar
   * @param {Function} keyFn - Função para extrair chave
   * @returns {Object} Objeto com grupos
   */
  function groupBy(arr, keyFn) {
    return arr.reduce((acc, item) => {
      const key = keyFn(item);
      if (!acc[key]) acc[key] = [];
      acc[key].push(item);
      return acc;
    }, {});
  }

  /**
   * Filtrar e mapear em uma operação
   * @param {Array} arr - Array a processar
   * @param {Function} fn - Função que retorna item ou null
   * @returns {Array} Array filtrado e mapeado
   */
  function filterMap(arr, fn) {
    return arr.map(fn).filter(item => item !== null && item !== undefined);
  }

  /**
   * Mesclar dois objetos (shallow merge)
   * @param {Object} target - Objeto alvo
   * @param {Object} source - Objeto fonte
   * @returns {Object} Objeto mesclado
   */
  function merge(target, source) {
    return { ...target, ...source };
  }

  /**
   * Verificar se valor é vazio (null, undefined, "", 0, false, [])
   * @param {*} value - Valor a verificar
   * @returns {boolean} true se vazio
   */
  function isEmpty(value) {
    if (value === null || value === undefined) return true;
    if (typeof value === 'string') return value.trim() === '';
    if (Array.isArray(value)) return value.length === 0;
    if (typeof value === 'object') return Object.keys(value).length === 0;
    if (typeof value === 'number') return value === 0;
    if (typeof value === 'boolean') return value === false;
    return false;
  }

  /**
   * Validar email simples
   * @param {string} email - Email a validar
   * @returns {boolean} true se válido
   */
  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  /**
   * Capitalizar primeira letra
   * @param {string} str - String a capitalizar
   * @returns {string} String capitalizada
   */
  function capitalize(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }

  /**
   * Truncar string com ellipsis
   * @param {string} str - String a truncar
   * @param {number} length - Comprimento máximo
   * @returns {string} String truncada
   */
  function truncate(str, length) {
    if (!str || str.length <= length) return str;
    return str.slice(0, length) + '…';
  }

  return {
    getElement,
    getElements,
    today,
    dateToISO,
    currentMonth,
    percentage,
    deepClone,
    debounce,
    throttle,
    groupBy,
    filterMap,
    merge,
    isEmpty,
    isValidEmail,
    capitalize,
    truncate
  };
})();
