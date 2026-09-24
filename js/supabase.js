/* Public browser configuration. Never put a service_role key in this file. */
window.SUPABASE_CONFIG = window.SUPABASE_CONFIG || {
  url: 'https://euyypgavmssomyywkawk.supabase.co',
  anonKey: 'sb_publishable_KBiPX3dNr4Z0xd1BM0nJ3Q_9NHGMye3'
};

window.supabaseClient = null;
window.isSupabaseConfigured = function () {
  const c = window.SUPABASE_CONFIG;
  return c && /^https:\/\/.+\.supabase\.co$/i.test(c.url || '') && c.anonKey && !c.anonKey.startsWith('YOUR_');
};

if (window.isSupabaseConfigured()) {
  window.supabaseClient = window.supabase.createClient(window.SUPABASE_CONFIG.url, window.SUPABASE_CONFIG.anonKey, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
  });
}
