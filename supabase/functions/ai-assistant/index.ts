import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = { 'Access-Control-Allow-Origin':'*', 'Access-Control-Allow-Headers':'authorization, x-client-info, apikey, content-type' };
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers:{ ...corsHeaders, 'Content-Type':'application/json' } });
const number = (value: unknown) => Math.abs(Number(value) || 0);
const month = (date: unknown) => String(date || '').slice(0, 7);
const money = (value: number) => `R$ ${value.toFixed(2).replace('.', ',')}`;

function financeSignals(transactions: any[], budgets: any[], investments: any[]) {
  const now = new Date().toISOString().slice(0, 7);
  const previous = new Date(new Date(`${now}-01T12:00:00`).setMonth(new Date(`${now}-01T12:00:00`).getMonth() - 1)).toISOString().slice(0, 7);
  const ownExpense = (item: any) => item.type === 'expense' && item.ownerType !== 'third_party' && item.ownerType !== 'reimbursable';
  const sum = (items: any[]) => items.reduce((total, item) => total + number(item.amount), 0);
  const current = transactions.filter(item => month(item.date) === now), prior = transactions.filter(item => month(item.date) === previous);
  const byCategory = (items: any[]) => Object.entries(items.filter(ownExpense).reduce((groups: Record<string, number>, item: any) => { const key = item.category || 'Sem categoria'; groups[key] = (groups[key] || 0) + number(item.amount); return groups; }, {})).sort((a: any, b: any) => b[1] - a[1]).slice(0, 5).map(([category, amount]) => ({ category, amount }));
  const spent = sum(current.filter(ownExpense)), spentBefore = sum(prior.filter(ownExpense)), income = sum(current.filter(item => item.type === 'income'));
  const invested = sum(current.filter(item => item.type === 'investment'));
  const budgetStatus = budgets.map((item: any) => { const used = current.filter(tx => ownExpense(tx) && tx.category === item.name).reduce((total, tx) => total + number(tx.amount), 0); return { category:item.name, used, limit:number(item.limit || item.amount), ratio:number(item.limit || item.amount) ? used / number(item.limit || item.amount) : null }; }).filter(item => item.ratio !== null && item.ratio >= .8);
  const allocation = investments.map((item: any) => ({ name:item.name || 'Aplicação sem nome', type:item.type || item.category || 'Não classificado', value:number(item.current || item.amount) })).filter(item => item.value).sort((a, b) => b.value - a.value);
  const totalInvested = allocation.reduce((total, item) => total + item.value, 0);
  return { referenceMonth:now, cashflow:{ income, spent, invested, result:income - spent - invested, spentChange:spentBefore ? (spent - spentBefore) / spentBefore : null }, topCategories:byCategory(current), budgetAlerts:budgetStatus, investment:{ total:totalInvested, largest:allocation[0] ? { ...allocation[0], share:allocation[0].value / totalInvested } : null, allocation }, dataNote:`${current.length} movimentações no mês atual; comparação com ${prior.length} no mês anterior.` };
}

function wellbeingSignals(daily: any[], habits: any[]) {
  const records = daily.map((row: any) => ({ date:row.record_key, ...(row.data || {}) })).slice(0, 30);
  const values = (keys: string[]) => records.map(item => keys.map(key => Number(item[key])).find(value => Number.isFinite(value) && value > 0)).filter((value): value is number => value !== undefined);
  const moodScale: Record<string, number> = { '😀':5, '😄':4.5, '🙂':4, '😐':3, '😔':2, '😫':1 };
  const mood = records.map(item => moodScale[item.mood] ?? Number(item.mood ?? item.humor)).filter(value => Number.isFinite(value) && value > 0);
  const energy = values(['energy', 'energia']);
  const completed = records.reduce((total, item) => total + (Array.isArray(item.tasks) ? item.tasks.filter((task: any) => task.done || task.completed).length : 0), 0);
  return { daysRecorded:records.length, averageMood:mood.length ? mood.reduce((a,b) => a+b, 0)/mood.length : null, averageEnergy:energy.length ? energy.reduce((a,b) => a+b, 0)/energy.length : null, completedTasks:completed, activeHabits:habits.filter((item: any) => item.data?.active !== false && item.active !== false).length };
}

async function askGemini(key: string, instruction: string, payload: unknown, maxOutputTokens = 260) {
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key=${key}`, { method:'POST', headers:{ 'Content-Type':'application/json' }, body:JSON.stringify({ contents:[{ parts:[{ text:`${instruction}\nDados calculados e autorizados: ${JSON.stringify(payload)}` }] }], generationConfig:{ temperature:.2, maxOutputTokens } }) });
  if (!response.ok) throw new Error(`Gemini ${response.status}`);
  const result = await response.json();
  return result?.candidates?.[0]?.content?.parts?.[0]?.text || '';
}

type ActionProposal = { action:'create_expense'|'create_task'|'create_habit'; data:Record<string, unknown>; summary:string };
const today = () => new Date().toISOString().slice(0, 10);
const validDate = (value: unknown) => { if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false; const date = new Date(`${value}T12:00:00Z`); return !Number.isNaN(date.valueOf()) && date.toISOString().slice(0, 10) === value; };
const cleanText = (value: unknown, max = 140) => String(value || '').trim().replace(/\s+/g, ' ').slice(0, max);
const newId = (prefix: string) => `${prefix}-${Date.now()}-${crypto.randomUUID().slice(0, 8)}`;

function validateProposal(value: unknown): ActionProposal {
  const proposal = value as ActionProposal;
  if (!proposal || !['create_expense','create_task','create_habit'].includes(proposal.action) || !proposal.data) throw new Error('Ação inválida.');
  if (proposal.action === 'create_expense') {
    const amount = Number(proposal.data.amount), description = cleanText(proposal.data.description);
    if (!description || !Number.isFinite(amount) || amount <= 0 || amount > 1_000_000 || !validDate(proposal.data.date)) throw new Error('Dados do gasto inválidos.');
    return { action:proposal.action, data:{ description, amount:Math.round(amount * 100) / 100, category:cleanText(proposal.data.category, 60) || 'Outros', date:proposal.data.date, payment_method:proposal.data.payment_method === 'credito' ? 'credito' : 'conta' }, summary:cleanText(proposal.summary, 180) };
  }
  if (proposal.action === 'create_task') {
    const text = cleanText(proposal.data.text);
    if (!text || !validDate(proposal.data.date)) throw new Error('Dados da tarefa inválidos.');
    return { action:proposal.action, data:{ text, date:proposal.data.date }, summary:cleanText(proposal.summary, 180) };
  }
  const name = cleanText(proposal.data.name), category = String(proposal.data.category || 'outro');
  if (!name || !['saude','estudos','trabalho','leitura','exercicios','pessoal','outro'].includes(category)) throw new Error('Dados do hábito inválidos.');
  return { action:proposal.action, data:{ name, category }, summary:cleanText(proposal.summary, 180) };
}

async function executeProposal(client: any, proposal: ActionProposal) {
  if (proposal.action === 'create_task') {
    const key = String(proposal.data.date), { data:current, error } = await client.from('planner_daily').select('data').eq('record_key', key).maybeSingle();
    if (error) throw error;
    const daily = current?.data || { priorities:['','',''], tasks:[], agenda:[], water:0, mood:'', energy:3, gratitude:'', notes:'', strengthWorkouts:0, pilatesWorkouts:0, runs:0 };
    daily.tasks = Array.isArray(daily.tasks) ? daily.tasks : [];
    daily.tasks.push({ id:newId('task'), text:proposal.data.text, done:false });
    const { error:saveError } = await client.from('planner_daily').upsert({ record_key:key, data:daily }, { onConflict:'user_id,record_key' });
    if (saveError) throw saveError;
    return `Tarefa criada para ${key}.`;
  }
  if (proposal.action === 'create_habit') {
    const key = newId('habit'), colors:Record<string,string> = { saude:'#8FCB9B', estudos:'#8AB4EA', trabalho:'#F0C777', leitura:'#C9A6EA', exercicios:'#EA9AA4', pessoal:'#F6C9D9', outro:'#B8A9E8' };
    const { error } = await client.from('planner_habits').insert({ record_key:key, data:{ id:key, name:proposal.data.name, category:proposal.data.category, color:colors[String(proposal.data.category)] || colors.outro, completions:{} } });
    if (error) throw error;
    return 'Hábito criado.';
  }
  const { data:cycles, error:cycleError } = await client.from('finance_cycles').select('data');
  if (cycleError) throw cycleError;
  const date = String(proposal.data.date), day = Number(date.slice(-2));
  const cycle = (cycles || []).map((row:any) => row.data).find((item:any) => { const range = String(item?.name || '').match(/(\d+)\D+(\d+)/); return range && day >= Number(range[1]) && day <= Number(range[2]); })?.name || null;
  const data = { id:newId('tx'), desc:proposal.data.description, amount:proposal.data.amount, type:'expense', category:proposal.data.category, ownerType:'own', bank:'', paymentMethod:proposal.data.payment_method, faturaDay:'', installment:'', installmentCurrent:0, installmentTotal:0, investmentName:'', investmentId:'', debtor:'', date, cycle, installmentGroup:'', linkedTransactionIds:[] };
  const { error } = await client.from('finance_transactions').insert({ record_key:data.id, data });
  if (error) throw error;
  return `Gasto de ${money(Number(proposal.data.amount))} registrado.`;
}

const extendedActions = ['register_miles','record_strength_workout','record_pilates_workout','record_run','create_income','credit_vr','create_recurring_income','complete_habit','complete_task','register_water','register_mood_energy'];
const positive = (value: unknown, max: number) => { const number = Number(value); if (!Number.isFinite(number) || number <= 0 || number > max) throw new Error('Valor inválido.'); return number; };
const proposalData = (value: unknown) => { const proposal = value as any; if (!proposal || !extendedActions.includes(proposal.action) || !proposal.data || typeof proposal.data !== 'object') throw new Error('Ação inválida.'); return proposal; };
async function readDaily(client:any, key:string) { const { data, error } = await client.from('planner_daily').select('data').eq('record_key', key).maybeSingle(); if (error) throw error; return data?.data || { priorities:['','',''], tasks:[], agenda:[], water:0, mood:'', energy:3, gratitude:'', notes:'', strengthWorkouts:0, pilatesWorkouts:0, runs:0 }; }
async function saveDaily(client:any, key:string, data:any) { const { error } = await client.from('planner_daily').upsert({ record_key:key, data }, { onConflict:'user_id,record_key' }); if (error) throw error; }
async function readFinanceSettings(client:any) { const { data, error } = await client.from('finance_settings').select('data').eq('record_key', 'settings').maybeSingle(); if (error) throw error; return data?.data || {}; }
async function saveFinanceSettings(client:any, data:any) { const { error } = await client.from('finance_settings').upsert({ record_key:'settings', data }, { onConflict:'user_id,record_key' }); if (error) throw error; }
async function cycleForDate(client:any, date:string) { const { data, error } = await client.from('finance_cycles').select('data'); if (error) throw error; const day = Number(date.slice(-2)); return (data || []).map((row:any) => row.data).find((item:any) => { const range = String(item?.name || '').match(/(\d+)\D+(\d+)/); return range && day >= Number(range[1]) && day <= Number(range[2]); })?.name || null; }
async function executeExtendedProposal(client:any, raw:unknown) {
  const proposal = proposalData(raw), data = proposal.data as Record<string, unknown>;
  const needsDate = ['register_miles','record_strength_workout','record_pilates_workout','record_run','create_income','credit_vr','complete_habit','complete_task','register_water','register_mood_energy'];
  if (needsDate.includes(proposal.action) && !validDate(data.date)) throw new Error('Data inválida.');
  if (proposal.action === 'register_miles') {
    const amount = Math.round(positive(data.amount, 10_000_000)), source = String(data.source || ''), operation = String(data.operation || '');
    if (!['XP','Livelo','Smiles','Outros'].includes(source) || !['add','remove'].includes(operation)) throw new Error('Movimentação de milhas inválida.');
    const settings = await readFinanceSettings(client), balances = { XP:0, Livelo:0, Smiles:0, Outros:0, ...(settings.miles?.balances || {}) }, current = Number(balances[source] || 0);
    if (operation === 'remove' && amount > current) throw new Error('O resgate é maior que o saldo disponível.');
    balances[source] = operation === 'remove' ? current - amount : current + amount;
    settings.miles = { ...(settings.miles || {}), balances, current:Object.values(balances).reduce((total:number, value:any) => total + Math.max(0, Number(value) || 0), 0) };
    settings.milesHistory = Array.isArray(settings.milesHistory) ? settings.milesHistory : [];
    settings.milesHistory.unshift({ id:newId('miles'), date:data.date, source, operation, amount }); settings.milesHistory = settings.milesHistory.slice(0, 500);
    await saveFinanceSettings(client, settings); return `${operation === 'add' ? 'Acúmulo' : 'Resgate'} de milhas registrado.`;
  }
  if (['record_strength_workout','record_pilates_workout','record_run','register_water','register_mood_energy'].includes(proposal.action)) {
    const daily = await readDaily(client, String(data.date));
    if (proposal.action === 'record_strength_workout') daily.strengthWorkouts = (Number(daily.strengthWorkouts) || 0) + Math.round(positive(data.count || 1, 20));
    if (proposal.action === 'record_pilates_workout') daily.pilatesWorkouts = (Number(daily.pilatesWorkouts) || 0) + Math.round(positive(data.count || 1, 20));
    if (proposal.action === 'record_run') daily.runs = (Number(daily.runs) || 0) + positive(data.kilometers, 500);
    if (proposal.action === 'register_water') daily.water = Math.min(8, (Number(daily.water) || 0) + Math.round(positive(data.glasses, 8)));
    if (proposal.action === 'register_mood_energy') { const energy = Number(data.energy); if (!Number.isInteger(energy) || energy < 1 || energy > 5 || !['😀','😄','🙂','😐','😔','😭'].includes(String(data.mood))) throw new Error('Check-in inválido.'); daily.energy = energy; daily.mood = data.mood; }
    await saveDaily(client, String(data.date), daily); return 'Registro diário atualizado.';
  }
  if (proposal.action === 'complete_habit') {
    const id = cleanText(data.habit_id, 100), { data:row, error } = await client.from('planner_habits').select('record_key,data').eq('record_key', id).maybeSingle(); if (error || !row) throw new Error('Hábito não encontrado.'); const habit = row.data || {}; habit.completions = habit.completions || {}; habit.completions[String(data.date)] = true; const { error:saveError } = await client.from('planner_habits').upsert({ record_key:id, data:habit }, { onConflict:'user_id,record_key' }); if (saveError) throw saveError; return 'Hábito marcado como concluído.';
  }
  if (proposal.action === 'complete_task') { const daily = await readDaily(client, String(data.date)), id = cleanText(data.task_id, 100), task = Array.isArray(daily.tasks) ? daily.tasks.find((item:any) => item.id === id) : null; if (!task) throw new Error('Tarefa não encontrada.'); task.done = true; await saveDaily(client, String(data.date), daily); return 'Tarefa marcada como concluída.'; }
  if (proposal.action === 'create_recurring_income') {
    const amount = Math.round(positive(data.amount, 1_000_000) * 100) / 100, day = Number(data.day), desc = cleanText(data.description); if (!desc || !Number.isInteger(day) || day < 1 || day > 31) throw new Error('Dados da receita recorrente inválidos.'); const id = newId('recurring'); const { error } = await client.from('finance_recurring_incomes').insert({ record_key:id, data:{ id, desc, amount, category:cleanText(data.category,60) || 'Receitas', day, startMonth:today().slice(0,7), active:true } }); if (error) throw error; return 'Receita recorrente criada.';
  }
  const amount = Math.round(positive(data.amount, 1_000_000) * 100) / 100, desc = cleanText(data.description); if (!desc) throw new Error('Descrição inválida.'); const date = String(data.date), entry = { id:newId('tx'), desc, amount, type:'income', category:proposal.action === 'credit_vr' ? 'Vale-Refeição' : (cleanText(data.category,60) || 'Receitas'), ownerType:'own', bank:'', paymentMethod:'', faturaDay:'', installment:'', installmentCurrent:0, installmentTotal:0, investmentName:'', investmentId:'', debtor:'', date, cycle:await cycleForDate(client, date), installmentGroup:'', linkedTransactionIds:[] }; const { error } = await client.from('finance_transactions').insert({ record_key:entry.id, data:entry }); if (error) throw error; return proposal.action === 'credit_vr' ? 'Crédito de VR registrado.' : `Receita de ${money(amount)} registrada.`;
}

Deno.serve(async req => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers:corsHeaders });
  try {
    const token = req.headers.get('Authorization')?.replace('Bearer ', '');
    if (!token) return json({ error:'Não autenticado.' }, 401);
    const client = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, { global:{ headers:{ Authorization:`Bearer ${token}` } } });
    const { data:{ user }, error:authError } = await client.auth.getUser(token); if (authError || !user) return json({ error:'Sessão inválida.' }, 401);
    const body = await req.json(), message = body?.message, mode = ['auto', 'investments', 'movements', 'wellbeing'].includes(body?.mode) ? body.mode : 'auto';
    if (body?.operation === 'execute_action') {
      const result = extendedActions.includes(body?.proposal?.action) ? await executeExtendedProposal(client, body?.proposal) : await executeProposal(client, validateProposal(body?.proposal));
      return json({ result });
    }
    if (typeof message !== 'string' || !message.trim() || message.length > 1200) return json({ error:'Mensagem inválida.' }, 400);
    const [tx, budgets, investments, daily, habits, history] = await Promise.all([
      client.from('finance_transactions').select('data').order('created_at', { ascending:false }).limit(360), client.from('finance_budgets').select('data').limit(60), client.from('finance_investments').select('data').limit(80), client.from('planner_daily').select('record_key,data').order('record_key', { ascending:false }).limit(30), client.from('planner_habits').select('data').limit(80), client.from('ai_conversations').select('role,message').order('created_at', { ascending:false }).limit(6)
    ]);
    const finance = financeSignals(tx.data?.map(row => row.data) || [], budgets.data?.map(row => row.data) || [], investments.data?.map(row => row.data) || []);
    const wellbeing = wellbeingSignals(daily.data || [], habits.data || []);
    await client.from('ai_conversations').insert({ user_id:user.id, role:'user', message:message.trim() });
    const key = Deno.env.get('GEMINI_API_KEY'); if (!key) return json({ error:'Assistente ainda não configurado.' }, 503);
    const selected = mode === 'auto' ? ['investments', 'movements', 'wellbeing'] : [mode];
    const roles: Record<string, string> = {
      investments:'Você é o agente de investimentos. Analise diversificação, concentração e aportes somente pelos números fornecidos. Não recomende ativos específicos, não invente rentabilidade. Entregue: sinal principal, evidência numérica e uma pergunta útil para a decisão.',
      movements:'Você é o agente de movimentações e orçamento. Detecte mudanças, vazamentos, pressão de orçamento e fluxo de caixa. Diferencie fato de hipótese e cite os números que sustentam o ponto. Entregue: sinal principal, evidência e uma ação prática.',
      wellbeing:'Você é o agente de comportamento e bem-estar. Procure relações prudentes entre registros de humor, energia, hábitos e tarefas; correlação não é causalidade. Nunca faça diagnóstico de saúde. Entregue: padrão observado, limite dos dados e um experimento pequeno.'
    };
    const specialistReports = await Promise.all(selected.map(role => askGemini(key, roles[role], role === 'wellbeing' ? wellbeing : finance)));
    const synthesis = await askGemini(key, `Você é a orquestradora de insights pessoais. Responda à pergunta: "${message}". Sintetize os pareceres especializados sem repetir dados crus. Em português do Brasil, use exatamente esta estrutura curta em texto simples:\nResumo: uma conclusão priorizada.\nO que chama atenção: até 3 frases com evidências numéricas.\nPróxima melhor ação: uma ação específica, realista e mensurável.\nConfiança: alta, média ou baixa, explicando brevemente a limitação.\nSe os dados forem insuficientes, diga qual registro falta. Não dê recomendação de compra/venda de ativo, diagnóstico de saúde, nem afirme causalidade sem base.`, { finance, wellbeing, reports:specialistReports, recentHistory:(history.data || []).reverse() }, 460);
    const answer = synthesis || `Resumo: ainda não há dados suficientes para uma análise confiável.\nPróxima melhor ação: registre movimentações e ao menos alguns dias de humor/energia para eu identificar padrões.`;
    await client.from('ai_conversations').insert({ user_id:user.id, role:'assistant', message:answer });
    return json({ answer, specialists:selected });
  } catch (error) { console.error(error); return json({ error:'Erro inesperado no assistente.' }, 500); }
});
