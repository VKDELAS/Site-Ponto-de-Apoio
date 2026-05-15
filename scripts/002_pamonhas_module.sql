-- Tabela de sabores de pamonha
create table if not exists public.pamonha_sabores (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  nome text not null,
  categoria text not null check (categoria in ('SALGADA', 'DOCE')),
  barbante_cor text not null,
  quantidade integer not null default 0,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Tabela de movimentações de estoque
create table if not exists public.movimentacoes_estoque (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  pamonha_id uuid not null references public.pamonha_sabores(id) on delete cascade,
  tipo text not null check (tipo in ('entrada', 'saida')),
  quantidade integer not null,
  observacao text,
  created_at timestamp with time zone default now()
);

-- Tabela de logs de ações específicas de pamonhas
create table if not exists public.pamonha_action_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  action_type text not null,
  description text,
  sabor_id uuid,
  created_at timestamp with time zone default now()
);

-- Habilitar RLS
alter table public.pamonha_sabores enable row level security;
alter table public.movimentacoes_estoque enable row level security;
alter table public.pamonha_action_logs enable row level security;

-- Políticas RLS para pamonha_sabores
create policy "Users can view their own pamonha sabores" on public.pamonha_sabores
  for select using (auth.uid() = user_id);

create policy "Users can insert their own pamonha sabores" on public.pamonha_sabores
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own pamonha sabores" on public.pamonha_sabores
  for update using (auth.uid() = user_id);

create policy "Users can delete their own pamonha sabores" on public.pamonha_sabores
  for delete using (auth.uid() = user_id);

-- Políticas RLS para movimentacoes_estoque
create policy "Users can view their own movimentacoes" on public.movimentacoes_estoque
  for select using (auth.uid() = user_id);

create policy "Users can insert their own movimentacoes" on public.movimentacoes_estoque
  for insert with check (auth.uid() = user_id);

-- Políticas RLS para pamonha_action_logs
create policy "Users can view their own pamonha logs" on public.pamonha_action_logs
  for select using (auth.uid() = user_id);

create policy "Users can insert their own pamonha logs" on public.pamonha_action_logs
  for insert with check (auth.uid() = user_id);

-- Índices
create index if not exists idx_pamonha_sabores_user on public.pamonha_sabores(user_id);
create index if not exists idx_movimentacoes_user_pamonha on public.movimentacoes_estoque(user_id, pamonha_id);
create index if not exists idx_movimentacoes_created on public.movimentacoes_estoque(created_at desc);

-- Inserts iniciais (Exemplos baseados na solicitação)
-- Nota: O user_id precisa ser o ID do usuário autenticado. 
-- Estes inserts são apenas para referência de estrutura.

/*
INSERT INTO public.pamonha_sabores (user_id, nome, categoria, barbante_cor, quantidade) VALUES 
('SEU_USER_ID', 'Sal sem queijo', 'SALGADA', '#ffffff', 6),
('SEU_USER_ID', 'Sal com queijo', 'SALGADA', '#ffffff', 10),
('SEU_USER_ID', 'Doce tradicional', 'DOCE', '#22c55e', 14),
('SEU_USER_ID', 'Doce com queijo', 'DOCE', '#fb923c', 15),
('SEU_USER_ID', 'Goiabada', 'DOCE', 'linear-gradient(45deg, #22c55e 50%, #fb923c 50%)', 8);
*/
