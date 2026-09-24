/**
 * Formatadores centralizados para moeda, datas e valores
 * Reutilizáveis entre financas.html e life-dashboard.html
 */
const Formatters = (() => {
  const moneyFormatter = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 2
  });

  const moneyCompactFormatter = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    notation: 'compact',
    maximumFractionDigits: 1
  });

  const moneyNoDecimalFormatter = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0
  });

  /**
   * Formatar valor em moeda brasileira
   * @param {number} value - Valor em reais
   * @param {Object} options - Opções adicionais
   * @param {boolean} [options.compact=false] - Usar notação compacta
   * @param {boolean} [options.noDecimal=false] - Sem casas decimais
   * @returns {string} Valor formatado (ex: "R$ 1.234,56")
   */
  function money(value, options = {}) {
    const num = Number(value || 0);

    if (options.compact) return moneyCompactFormatter.format(num);
    if (options.noDecimal) return moneyNoDecimalFormatter.format(num);

    return moneyFormatter.format(num);
  }

  /**
   * Formatar data para exibição
   * @param {string} dateStr - Data em formato ISO (YYYY-MM-DD)
   * @param {Object} options - Opções de formatação
   * @param {string} [options.format='short'] - 'short', 'long', 'weekday', 'full'
   * @returns {string} Data formatada
   */
  function date(dateStr, options = {}) {
    if (!dateStr) return '—';

    const { format = 'short' } = options;
    const d = new Date(dateStr + 'T12:00:00');

    if (Number.isNaN(d.getTime())) return '—';

    const formats = {
      short: { dateStyle: 'short' },
      long: { dateStyle: 'long' },
      weekday: { weekday: 'short', day: 'numeric', month: 'short' },
      full: { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }
    };

    return d.toLocaleDateString('pt-BR', formats[format] || formats.short);
  }

  /**
   * Formatar duração em minutos
   * @param {number} minutes - Duração em minutos
   * @returns {string} Duração formatada (ex: "1h 30m", "45 min")
   */
  function duration(minutes) {
    const min = Number(minutes || 0);

    if (min < 60) {
      return `${Math.round(min)} min`;
    }

    const hours = Math.floor(min / 60);
    const mins = min % 60;

    if (mins === 0) {
      return `${hours}h`;
    }

    return `${hours}h ${Math.round(mins)}m`;
  }

  /**
   * Formatar percentual
   * @param {number} value - Valor
   * @param {number} total - Total
   * @returns {string} Percentual formatado (ex: "45%")
   */
  function percentage(value, total) {
    if (!total || total === 0) return '0%';
    const pct = Math.max(0, Math.min(100, (value / total) * 100));
    return `${Math.round(pct)}%`;
  }

  /**
   * Formatar número de casas decimais
   * @param {number} value - Valor
   * @param {number} [decimals=2] - Número de casas decimais
   * @returns {string} Número formatado
   */
  function decimal(value, decimals = 2) {
    return Number(value || 0).toFixed(decimals);
  }

  /**
   * Padronizar data ISO (adicionar zeros)
   * @param {number} day - Dia
   * @param {number} month - Mês
   * @param {number} year - Ano
   * @returns {string} Data em formato YYYY-MM-DD
   */
  function toISO(day, month, year) {
    const d = String(day).padStart(2, '0');
    const m = String(month).padStart(2, '0');
    return `${year}-${m}-${d}`;
  }

  /**
   * Extrair ano-mês de data ISO
   * @param {string} isoDate - Data em formato YYYY-MM-DD
   * @returns {string} Ano-mês em formato YYYY-MM
   */
  function yearMonth(isoDate) {
    return isoDate ? isoDate.slice(0, 7) : '';
  }

  return {
    money,
    date,
    duration,
    percentage,
    decimal,
    toISO,
    yearMonth
  };
})();
