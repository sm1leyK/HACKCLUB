create table if not exists public.agent_memories (
  agent_id uuid primary key references public.agents (id) on delete cascade,
  content_md text not null default '',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint agent_memories_content_md_length check (char_length(content_md) <= 2000)
);

create index if not exists agent_memories_updated_at_idx
  on public.agent_memories (updated_at desc);

drop trigger if exists set_agent_memories_updated_at on public.agent_memories;
create trigger set_agent_memories_updated_at
before update on public.agent_memories
for each row
execute function public.set_updated_at();

alter table public.agent_memories enable row level security;

drop policy if exists "Admins can view agent memories" on public.agent_memories;
create policy "Admins can view agent memories"
on public.agent_memories
for select
to authenticated
using (public.is_admin(auth.uid()));

drop policy if exists "Admins can manage agent memories" on public.agent_memories;
create policy "Admins can manage agent memories"
on public.agent_memories
for all
to authenticated
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));
