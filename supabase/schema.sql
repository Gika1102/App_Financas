-- Execute in Supabase SQL Editor. No service-role key is ever used by the app.
create extension if not exists pgcrypto;
create or replace function public.set_updated_at() returns trigger language plpgsql security invoker set search_path=public as $$ begin new.updated_at=now(); return new; end $$;

-- Every name below is a real application entity table. `data` preserves fields
-- already used by the vanilla-JS UI while user_id/timestamps remain relational.
create or replace function public.create_owned_entity_table(p_table text) returns void language plpgsql security invoker set search_path=public as $$
begin
  execute format('create table if not exists public.%I (id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade default auth.uid(), record_key text not null, data jsonb not null default ''{}''::jsonb, created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(user_id,record_key))', p_table);
  execute format('create index if not exists %I on public.%I(user_id,record_key)', p_table||'_owner_key_idx',p_table);
  execute format('alter table public.%I enable row level security',p_table);
  execute format('alter table public.%I force row level security',p_table);
  execute format('drop policy if exists "owner_select" on public.%I',p_table); execute format('create policy "owner_select" on public.%I for select using (auth.uid()=user_id)',p_table);
  execute format('drop policy if exists "owner_insert" on public.%I',p_table); execute format('create policy "owner_insert" on public.%I for insert with check (auth.uid()=user_id)',p_table);
  execute format('drop policy if exists "owner_update" on public.%I',p_table); execute format('create policy "owner_update" on public.%I for update using (auth.uid()=user_id) with check (auth.uid()=user_id)',p_table);
  execute format('drop policy if exists "owner_delete" on public.%I',p_table); execute format('create policy "owner_delete" on public.%I for delete using (auth.uid()=user_id)',p_table);
  execute format('drop trigger if exists set_updated_at on public.%I',p_table); execute format('create trigger set_updated_at before update on public.%I for each row execute function public.set_updated_at()',p_table);
end $$;

select public.create_owned_entity_table(x) from unnest(array[
 'finance_settings','finance_cycles','finance_budgets','finance_investments','finance_debtors','finance_transactions','finance_recurring_incomes',
 'planner_settings','planner_daily','planner_weekly','planner_monthly','planner_habits','planner_reviews','planner_pomodoro'
]) as x;

-- Bulk replacement is transactional and limited to an allow-list of entity tables.
create or replace function public.replace_entity(p_table text,p_records jsonb) returns void language plpgsql security invoker set search_path=public as $$
begin
  if p_table <> all(array['finance_settings','finance_cycles','finance_budgets','finance_investments','finance_debtors','finance_transactions','finance_recurring_incomes','planner_settings','planner_daily','planner_weekly','planner_monthly','planner_habits','planner_reviews','planner_pomodoro']) then raise exception 'Invalid entity table'; end if;
  execute format('delete from public.%I where user_id=auth.uid()',p_table);
  execute format('insert into public.%I(user_id,record_key,data) select auth.uid(),x.record_key,x.data from jsonb_to_recordset($1) as x(record_key text,data jsonb)',p_table) using p_records;
end $$;
grant select,insert,update,delete on all tables in schema public to authenticated;
grant execute on function public.replace_entity(text,jsonb) to authenticated;
