-- Admin users table — references auth.users
create table admin_users (
  id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table admin_users enable row level security;

-- Only admins can read the admin list
create policy "Admins can read admin list"
  on admin_users for select
  using (auth.uid() = id);

-- Helper function: is current user an admin?
create or replace function is_admin()
returns boolean as $$
  select exists (
    select 1 from admin_users where id = auth.uid()
  );
$$ language sql security definer stable;

-- Admins can read ALL contributions (pending, approved, rejected)
create policy "Admins can read all contributions"
  on contributions for select
  using (is_admin());

-- Admins can update contribution status
create policy "Admins can update contributions"
  on contributions for update
  using (is_admin())
  with check (is_admin());
