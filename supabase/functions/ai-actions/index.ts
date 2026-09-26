import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = { 'Access-Control-Allow-Origin':'*', 'Access-Control-Allow-Headers':'authorization, x-client-info, apikey, content-type' };
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers:{ ...corsHeaders, 'Content-Type':'application/json' } });
const today = () => new Date().toISOString().slice(0, 10);

Deno.serve(async req => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers:corsHeaders });
  try {
    const token = req.headers.get('Authorization')?.replace('Bearer ', '');
    if (!token) return json({ error:'Não autenticado.' }, 401);
    const client = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, { global:{ headers:{ Authorization:`Bearer ${token}` } } });
    const { data:{ user }, error:authError } = await client.auth.getUser(token);
    if (authError || !user) return json({ error:'Sessão inválida.' }, 401);
    const { message } = await req.json();
    if (typeof message !== 'string' || !message.trim() || message.length > 1200) return json({ error:'Mensagem inválida.' }, 400);
    const key = Deno.env.get('GEMINI_API_KEY'); if (!key) return json({ error:'Assistente ainda não configurado.' }, 503);
    const [habits, daily] = await Promise.all([client.from('planner_habits').select('record_key,data').limit(100), client.from('planner_daily').select('record_key,data').order('record_key', { ascending:false }).limit(31)]);
    const habitContext = (habits.data || []).map((row:any) => ({ id:row.record_key, name:row.data?.name })).filter((item:any) => item.name);
    const taskContext = (daily.data || []).flatMap((row:any) => (Array.isArray(row.data?.tasks) ? row.data.tasks.filter((task:any) => !task.done).map((task:any) => ({ id:task.id, date:row.record_key, text:task.text })) : [])).slice(0, 100);
    const prompt = `Extraia no máximo UMA ação de registro desta mensagem. Hoje é ${today()}. Ações permitidas e campos: create_expense {description,amount,category,date,payment_method}; create_task {text,date}; create_habit {name,category}; register_miles {amount,source,operation,date}; record_strength_workout ou record_pilates_workout {count,date}; record_run {kilometers,date}; create_income {description,amount,category,date}; credit_vr {description,amount,date}; create_recurring_income {description,amount,category,day}; complete_habit {habit_id,date}; complete_task {task_id,date}; register_water {glasses,date}; register_mood_energy {mood,energy,date}. source é XP, Livelo, Smiles ou Outros; operation é add ou remove. Categoria de hábito é saude, estudos, trabalho, leitura, exercicios, pessoal ou outro. Para água, glasses é número inteiro de copos de 250 ml; converta litros quando forem informados. Para humor, use somente 😀, 😄, 🙂, 😐, 😔 ou 😭; energia é 1 a 5. Valores são positivos. Para create_task, quando a data não vier na mensagem, use hoje. Nas demais ações com data, não invente datas: use hoje somente quando a mensagem disser hoje/agora; sem data, retorne nulo. Para concluir hábito ou tarefa, use exclusivamente um id destas listas: hábitos=${JSON.stringify(habitContext)}; tarefas pendentes=${JSON.stringify(taskContext)}. Se houver ambiguidade, retorne nulo. Não crie investimentos, transferências, exclusões ou edições. Responda somente JSON válido: {"action":null} ou {"action":"record_run","data":{},"summary":"..."}. Mensagem: ${JSON.stringify(message)}`;
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key=${key}`, { method:'POST', headers:{ 'Content-Type':'application/json' }, body:JSON.stringify({ contents:[{ parts:[{ text:prompt }] }], generationConfig:{ temperature:0, maxOutputTokens:180, responseMimeType:'application/json' } }) });
    if (!response.ok) throw new Error(`Gemini ${response.status}`);
    const result = await response.json(), raw = result?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    let proposal = null;
    try { const parsed = JSON.parse(raw); if (['create_expense','create_task','create_habit','register_miles','record_strength_workout','record_pilates_workout','record_run','create_income','credit_vr','create_recurring_income','complete_habit','complete_task','register_water','register_mood_energy'].includes(parsed?.action) && parsed?.data) proposal = parsed; } catch { /* no proposal */ }
    return json({ proposal });
  } catch (error) { console.error(error); return json({ error:'Não foi possível preparar o registro.' }, 500); }
});
