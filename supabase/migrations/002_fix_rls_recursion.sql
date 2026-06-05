-- Avoid infinite recursion when admin policies query profiles inside profiles RLS
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

drop policy if exists "Admins can read all profiles" on profiles;
create policy "Admins can read all profiles" on profiles
  for select using (public.is_admin());

drop policy if exists "Users can insert own profile" on profiles;
create policy "Users can insert own profile" on profiles
  for insert with check (auth.uid() = id);

drop policy if exists "Admins can read all briefs" on briefs;
create policy "Admins can read all briefs" on briefs
  for select using (public.is_admin());

drop policy if exists "Admins can update all briefs" on briefs;
create policy "Admins can update all briefs" on briefs
  for update using (public.is_admin());

drop policy if exists "Admins can manage assignments" on assignments;
create policy "Admins can manage assignments" on assignments
  for all using (public.is_admin());

drop policy if exists "Admins can read all deliverables" on deliverables;
create policy "Admins can read all deliverables" on deliverables
  for select using (public.is_admin());
