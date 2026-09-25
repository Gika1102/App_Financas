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

Deno.serve(async req => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers:corsHeaders });
  try {
    const token = req.headers.get('Authorization')?.replace('Bearer ', '');
    if (!token) return json({ error:'Não autenticado.' }, 401);
    const client = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, { global:{ headers:{ Authorization:`Bearer ${token}` } } });
    const { data:{ user }, error:authError } = await client.auth.getUser(token); if (authError || !user) return json({ error:'Sessão inválida.' }, 401);
    const body = await req.json(), message = body?.message, mode = ['auto', 'investments', 'movements', 'wellbeing'].includes(body?.mode) ? body.mode : 'auto';
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
