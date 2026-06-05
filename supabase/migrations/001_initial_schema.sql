-- Profiles (extends Supabase auth.users)
create table profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  full_name text not null,
  role text not null check (role in ('client', 'provider', 'both', 'admin')),
  university text,
  department text,
  created_at timestamptz default now()
);

-- Briefs
create table briefs (
  id uuid default gen_random_uuid() primary key,
  client_id uuid references profiles(id) on delete cascade not null,
  title text not null,
  description text not null,
  deliverable_type text not null check (deliverable_type in ('3d_model', 'physical_model', '3d_print', 'diagrams', 'full_project')),
  deadline date not null,
  budget numeric(10,2),
  reference_files text[],
  status text not null default 'open' check (status in ('open', 'assigned', 'in_progress', 'delivered', 'completed', 'cancelled')),
  created_at timestamptz default now()
);

-- Assignments
create table assignments (
  id uuid default gen_random_uuid() primary key,
  brief_id uuid references briefs(id) on delete cascade not null,
  provider_id uuid references profiles(id) not null,
  assigned_by uuid references profiles(id) not null,
  notes text,
  created_at timestamptz default now()
);

-- Deliverables
create table deliverables (
  id uuid default gen_random_uuid() primary key,
  brief_id uuid references briefs(id) on delete cascade not null,
  assignment_id uuid references assignments(id) not null,
  provider_id uuid references profiles(id) not null,
  files text[] not null,
  message text,
  status text not null default 'pending_review' check (status in ('pending_review', 'approved', 'rejected')),
  created_at timestamptz default now()
);

-- Notifications
create table notifications (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  type text not null,
  payload jsonb,
  read boolean default false,
  created_at timestamptz default now()
);

-- Row Level Security
alter table profiles enable row level security;
alter table briefs enable row level security;
alter table assignments enable row level security;
alter table deliverables enable row level security;
alter table notifications enable row level security;

-- RLS Policies: profiles
create policy "Users can read own profile" on profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);
create policy "Admins can read all profiles" on profiles for select using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

-- RLS Policies: briefs
create policy "Clients can create briefs" on briefs for insert with check (auth.uid() = client_id);
create policy "Clients can read own briefs" on briefs for select using (auth.uid() = client_id);
create policy "Providers can read open briefs" on briefs for select using (status = 'open');
create policy "Admins can read all briefs" on briefs for select using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);
create policy "Admins can update all briefs" on briefs for update using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

-- RLS Policies: assignments
create policy "Providers can read own assignments" on assignments for select using (auth.uid() = provider_id);
create policy "Admins can manage assignments" on assignments for all using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

-- RLS Policies: deliverables
create policy "Providers can manage own deliverables" on deliverables for all using (auth.uid() = provider_id);
create policy "Clients can read deliverables for own briefs" on deliverables for select using (
  exists (select 1 from briefs where id = brief_id and client_id = auth.uid())
);
create policy "Admins can read all deliverables" on deliverables for select using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

-- RLS Policies: notifications
create policy "Users can read own notifications" on notifications for select using (auth.uid() = user_id);
create policy "Users can update own notifications" on notifications for update using (auth.uid() = user_id);
