-- Create enum types
create type contribution_status as enum ('pending', 'approved', 'rejected');
create type dialect_type as enum ('oriente', 'noroccidente', 'centro', 'sur', 'costa', 'otro');
create type source_type as enum ('hablante_nativo', 'estudiante', 'academico', 'evento', 'otro');

-- Contributions table
create table contributions (
  id uuid primary key default gen_random_uuid(),
  maya_text text not null check (char_length(maya_text) >= 1 and char_length(maya_text) <= 2000),
  spanish_translation text not null check (char_length(spanish_translation) >= 1 and char_length(spanish_translation) <= 2000),
  audio_url text,
  contributor_name text not null check (char_length(contributor_name) >= 1 and char_length(contributor_name) <= 200),
  consent_given boolean not null default false check (consent_given = true),
  dialect dialect_type not null,
  source source_type not null,
  status contribution_status not null default 'pending',
  created_at timestamptz not null default now()
);

-- Index for browsing approved entries
create index idx_contributions_status on contributions (status) where status = 'approved';
create index idx_contributions_created on contributions (created_at desc);

-- Row Level Security
alter table contributions enable row level security;

-- Anyone can insert (anonymous contributions)
create policy "Anyone can contribute"
  on contributions for insert
  with check (true);

-- Anyone can read approved entries
create policy "Anyone can read approved contributions"
  on contributions for select
  using (status = 'approved');

-- Admins can read all entries (via service role key, bypasses RLS)
-- Admin updates handled via service role key

-- Enable realtime for live counter
alter publication supabase_realtime add table contributions;
