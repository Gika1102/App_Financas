/* Persistence by domain. RLS in schema.sql is the security boundary. */
window.AppDatabase = (() => {
  const sb = () => window.supabaseClient;
  const fail = (label, error) => { console.error(label, error); throw error || new Error(label); };
  const tables = {
    finance: { meta:'finance_settings', cycles:'finance_cycles', budgets:'finance_budgets', investments:'finance_investments', debtors:'finance_debtors', tx:'finance_transactions', recurring:'finance_recurring_incomes' },
    planner: { settings:'planner_settings', daily:'planner_daily', weekly:'planner_weekly', monthly:'planner_monthly', habits:'planner_habits', review:'planner_reviews', pomodoro:'planner_pomodoro' }
  };
  async function rows(table) { const {data,error}=await sb().from(table).select('record_key,data'); if(error) fail('Erro ao carregar dados',error); return data||[]; }
  async function replace(table, records) {
    const {error}=await sb().rpc('replace_entity',{p_table:table,p_records:records});
    if(error) fail('Erro ao salvar dados',error);
  }
  const list = a => (a||[]).map((x,i)=>({record_key:String(x.id || x.name || i),data:x}));
  async function loadFinance() {
    const t=tables.finance; const [meta,cycles,budgets,investments,debtors,tx,recurring]=await Promise.all(Object.values(t).map(rows));
    const settings=meta.find(x=>x.record_key==='settings')?.data || {};
    return {...settings, cycles:cycles.map(x=>x.data),budgets:budgets.map(x=>x.data),investments:investments.map(x=>x.data),debtors:debtors.map(x=>x.data),tx:tx.map(x=>x.data),recurringIncomes:recurring.map(x=>x.data)};
  }
  async function saveFinance(s) {
    const meta={...s}; ['cycles','budgets','investments','debtors','tx','recurringIncomes'].forEach(k=>delete meta[k]);
    const snapshot={settings:[{record_key:'settings',data:meta}],cycles:list(s.cycles),budgets:list(s.budgets),investments:list(s.investments),debtors:list(s.debtors),transactions:list(s.tx),recurring_incomes:list(s.recurringIncomes)};
    const {error}=await sb().rpc('save_finance_snapshot',{p_snapshot:snapshot});
    if(error) fail('Erro ao salvar finanças',error);
  }
  async function loadPlanner() { const t=tables.planner; const result={}; for (const [name,table] of Object.entries(t)) { const r=await rows(table); result[name]= name==='settings'||name==='pomodoro' ? (r.find(x=>x.record_key==='settings')?.data || (name==='pomodoro'?{settings:{},log:{}}:{})) : Object.fromEntries(r.map(x=>[x.record_key,x.data])); } return result; }
  async function savePlanner(p) { const t=tables.planner; const keyed=(obj)=>Object.entries(obj||{}).map(([record_key,data])=>({record_key,data})); await Promise.all([replace(t.settings,[{record_key:'settings',data:p.settings}]),replace(t.daily,keyed(p.daily)),replace(t.weekly,keyed(p.weekly)),replace(t.monthly,keyed(p.monthly)),replace(t.habits,keyed(p.habits)),replace(t.review,keyed(p.review)),replace(t.pomodoro,[{record_key:'settings',data:p.pomodoro}])]); }
  async function migrateLegacy(user) {
    const marker=`supabase-migrated-${user.id}`; if (localStorage.getItem(marker)) return;
    const finance=localStorage.getItem('finance-state-cute'), planner=localStorage.getItem('lifeDashboardData_v1');
    if (!finance && !planner) { localStorage.setItem(marker,'1'); return; }
    try { if(finance) await saveFinance(JSON.parse(finance)); if(planner) await savePlanner(JSON.parse(planner)); localStorage.setItem(marker,'1'); }
    catch(e) { console.error('Migração local falhou; os dados locais foram preservados.',e); throw e; }
  }
  return { loadFinance,saveFinance,loadPlanner,savePlanner,migrateLegacy };
})();
