-- PhotoFlow 独立摄影师工作台 · Supabase 表结构
-- 在 Supabase 的 SQL Editor 中一次性执行本文件即可。

-- 应用状态表：每个用户一行，data 列以 JSON 保存 { projects, expenses, settings, clients }
create table if not exists public.app_state (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  data       jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- 开启行级安全（RLS）：用户只能读写自己的数据
alter table public.app_state enable row level security;

drop policy if exists "app_state_select_own" on public.app_state;
create policy "app_state_select_own" on public.app_state
  for select using (auth.uid() = user_id);

drop policy if exists "app_state_insert_own" on public.app_state;
create policy "app_state_insert_own" on public.app_state
  for insert with check (auth.uid() = user_id);

drop policy if exists "app_state_update_own" on public.app_state;
create policy "app_state_update_own" on public.app_state
  for update using (auth.uid() = user_id);

-- 登录标识解析：把「邮箱 / 用户名 / 手机号」统一解析回邮箱，供密码登录使用
create or replace function public.resolve_identifier(identifier text)
returns text
language sql
security definer
set search_path = public
as $$
  select email
  from auth.users
  where lower(email) = lower(identifier)
     or lower(coalesce(raw_user_meta_data->>'username','')) = lower(identifier)
     or coalesce(raw_user_meta_data->>'phone','') = identifier
  limit 1;
$$;

grant execute on function public.resolve_identifier(text) to anon, authenticated;
