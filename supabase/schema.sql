-- co|co private reports (Admiraal Real Estate first; File XO and recomemo can share these accounts later)
-- Paste into Supabase: SQL Editor > New query > Run. Safe to run once on a new project.

create table if not exists public.admins (email text primary key);
insert into public.admins (email) values ('richardadmiraal@gmail.com') on conflict do nothing;

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  property text,
  prepared_for text,
  report_date date default current_date,
  owner_email text not null default lower(auth.jwt() ->> 'email'),
  created_at timestamptz default now()
);

create table if not exists public.report_access (
  report_id uuid references public.reports (id) on delete cascade,
  email text not null,
  added_by text default lower(auth.jwt() ->> 'email'),
  added_at timestamptz default now(),
  primary key (report_id, email)
);

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  name text,
  recomemo_optin boolean default false,   -- only true when the person ticks the box
  created_at timestamptz default now()
);

create or replace function public.me() returns text
language sql stable as $$ select lower(coalesce(auth.jwt() ->> 'email', '')) $$;

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from admins where lower(email) = me())
$$;

create or replace function public.can_see(r uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select is_admin()
      or exists (select 1 from reports where id = r and lower(owner_email) = me())
      or exists (select 1 from report_access where report_id = r and lower(email) = me())
$$;

alter table public.admins enable row level security;
alter table public.reports enable row level security;
alter table public.report_access enable row level security;
alter table public.profiles enable row level security;

drop policy if exists "admins read" on public.admins;
create policy "admins read" on public.admins for select using (is_admin());

drop policy if exists "reports read" on public.reports;
create policy "reports read" on public.reports for select using (can_see(id));
drop policy if exists "reports write" on public.reports;
create policy "reports write" on public.reports for all using (is_admin()) with check (is_admin());

drop policy if exists "access read" on public.report_access;
create policy "access read" on public.report_access for select using (can_see(report_id));
-- anyone who can see a report can share it with another email address
drop policy if exists "access add" on public.report_access;
create policy "access add" on public.report_access for insert with check (can_see(report_id));
drop policy if exists "access remove" on public.report_access;
create policy "access remove" on public.report_access for delete using (is_admin() or lower(added_by) = me());

drop policy if exists "profile own" on public.profiles;
create policy "profile own" on public.profiles for all using (id = auth.uid() or is_admin()) with check (id = auth.uid());

-- Private file storage: one folder per report, named by the report id
insert into storage.buckets (id, name, public) values ('reports', 'reports', false) on conflict do nothing;

drop policy if exists "report files read" on storage.objects;
create policy "report files read" on storage.objects for select
  using (bucket_id = 'reports' and public.can_see(((storage.foldername(name))[1])::uuid));
drop policy if exists "report files write" on storage.objects;
create policy "report files write" on storage.objects for all
  using (bucket_id = 'reports' and public.is_admin()) with check (bucket_id = 'reports' and public.is_admin());
