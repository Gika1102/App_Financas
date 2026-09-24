/**
 * Gerenciador centralizado de tema claro/escuro
 * Usado por: index.html, financas.html, life-dashboard.html
 */
const Theme = (() => {
  const THEME_KEY = 'homeThemePref';
  const DARK = 'dark';
  const LIGHT = 'light';

  /**
   * Aplicar tema ao documento
   * @param {string} theme - 'light' ou 'dark'
   */
  function apply(theme) {
    document.body.setAttribute('data-theme', theme);
    updateThemeButton(theme);
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch (e) {
      console.warn('localStorage unavailable for theme', e);
    }
  }

  /**
   * Obter tema atual salvo
   * @returns {string} 'light' ou 'dark'
   */
  function getCurrent() {
    try {
      return localStorage.getItem(THEME_KEY) || LIGHT;
    } catch (e) {
      return LIGHT;
    }
  }

  /**
   * Alternar entre temas
   */
  function toggle() {
    const current = document.body.getAttribute('data-theme') || LIGHT;
    apply(current === DARK ? LIGHT : DARK);
  }

  /**
   * Atualizar ícone do botão de tema
   * @private
   */
  function updateThemeButton(theme) {
    const btn = document.getElementById('themeBtn');
    if (btn) {
      btn.textContent = theme === DARK ? '☀️' : '🌙';
    }
  }

  /**
   * Inicializar tema e configurar listener
   */
  function init() {
    const saved = getCurrent();
    apply(saved);

    const themeBtn = document.getElementById('themeBtn');
    if (themeBtn) {
      themeBtn.addEventListener('click', toggle);
    }
  }

  return {
    init,
    apply,
    getCurrent,
    toggle,
    THEME_KEY,
    DARK,
    LIGHT
  };
})();
