window.AppAuth = (() => {
  const loginUrl = 'login.html';
  function redirectToLogin() { location.replace(loginUrl); }
  async function getUser() {
    if (!window.supabaseClient) return null;
    const { data, error } = await window.supabaseClient.auth.getUser();
    if (error) { console.error('Falha ao validar sessão:', error); return null; }
    return data.user;
  }
  async function requireUser() {
    const user = await getUser();
    if (!user) { redirectToLogin(); throw new Error('Sessão necessária'); }
    return user;
  }
  async function signOut() {
    if (window.supabaseClient) await window.supabaseClient.auth.signOut();
    redirectToLogin();
  }
  function mountLogoutButton() {
    if (document.getElementById('appLogout')) return;
    const button=document.createElement('button'); button.id='appLogout'; button.type='button'; button.textContent='Sair';
    button.setAttribute('aria-label','Sair da conta');
    button.style.cssText='position:fixed;right:16px;bottom:16px;z-index:9999;border:0;border-radius:999px;padding:10px 16px;background:#574f6b;color:#fff;font:700 14px Segoe UI,sans-serif;cursor:pointer;box-shadow:0 4px 14px #0002';
    if(document.body.classList.contains('life-dashboard-page')) button.style.bottom='82px';
    button.addEventListener('click',signOut); document.body.appendChild(button);
  }
  return { getUser, requireUser, signOut, mountLogoutButton };
})();
