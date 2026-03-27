-- Tabela de dias trabalhados (calendário)
create table if not exists public.worked_days (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  created_at timestamp with time zone default now(),
  unique(user_id, date)
);

-- Tabela de transações financeiras
create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null check (type in ('income', 'payment_received', 'expense', 'daily_work', 'automatic_daily')),
  amount decimal(10, 2) not null,
  description text,
  date date not null default current_date,
  created_at timestamp with time zone default now()
);

-- Tabela de logs de ações
create table if not exists public.action_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  action_type text not null,
  amount decimal(10, 2),
  description text,
  created_at timestamp with time zone default now()
);

-- Habilitar RLS em todas as tabelas
alter table public.worked_days enable row level security;
alter table public.transactions enable row level security;
alter table public.action_logs enable row level security;

-- Políticas RLS para worked_days
create policy "Users can view their own worked days" on public.worked_days
  for select using (auth.uid() = user_id);

create policy "Users can insert their own worked days" on public.worked_days
  for insert with check (auth.uid() = user_id);

create policy "Users can delete their own worked days" on public.worked_days
  for delete using (auth.uid() = user_id);

-- Políticas RLS para transactions
create policy "Users can view their own transactions" on public.transactions
  for select using (auth.uid() = user_id);

create policy "Users can insert their own transactions" on public.transactions
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own transactions" on public.transactions
  for update using (auth.uid() = user_id);

create policy "Users can delete their own transactions" on public.transactions
  for delete using (auth.uid() = user_id);

-- Políticas RLS para action_logs
create policy "Users can view their own logs" on public.action_logs
  for select using (auth.uid() = user_id);

create policy "Users can insert their own logs" on public.action_logs
  for insert with check (auth.uid() = user_id);

-- Índices para melhor performance
create index if not exists idx_worked_days_user_date on public.worked_days(user_id, date);
create index if not exists idx_transactions_user_date on public.transactions(user_id, date);
create index if not exists idx_action_logs_user_created on public.action_logs(user_id, created_at desc);
