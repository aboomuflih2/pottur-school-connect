
-- Enable required extension for UUID generation (safe if already present)
create extension if not exists pgcrypto;

-- 1) Roles enum
create type public.app_role as enum ('admin', 'moderator', 'user');

-- 2) Roles table
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);

-- 3) Seed the requested super admin
insert into public.user_roles (user_id, role)
values ('1e940592-fa5a-4662-87b8-3a852fb9ac86', 'admin')
on conflict (user_id, role) do nothing;

-- 4) Enable RLS
alter table public.user_roles enable row level security;

-- 5) Security definer function to check roles (prevents recursive RLS issues)
create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles
    where user_id = _user_id
      and role = _role
  );
$$;

-- 6) RLS policies
-- Users can read their own roles
create policy "Users can read their own roles"
on public.user_roles
for select
to authenticated
using (auth.uid() = user_id);

-- Admins can read all roles
create policy "Admins can read all roles"
on public.user_roles
for select
to authenticated
using (public.has_role(auth.uid(), 'admin'));

-- Admins can insert roles
create policy "Admins can insert roles"
on public.user_roles
for insert
to authenticated
with check (public.has_role(auth.uid(), 'admin'));

-- Admins can update roles
create policy "Admins can update roles"
on public.user_roles
for update
to authenticated
using (public.has_role(auth.uid(), 'admin'))
with check (public.has_role(auth.uid(), 'admin'));

-- Admins can delete roles
create policy "Admins can delete roles"
on public.user_roles
for delete
to authenticated
using (public.has_role(auth.uid(), 'admin'));
