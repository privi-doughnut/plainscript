-- Plainscript — Supabase schema (Phase 2: accounts + My Cabinet)
-- Paste into the Supabase SQL Editor and run.
-- Everything below is scoped per-user by Row-Level Security: a signed-in user
-- can only ever see or change their own rows.
--
-- ONE-TIME PROJECT SETUP (dashboard, ~5 minutes):
-- 1. Run this file in the SQL Editor.
-- 2. Authentication → Providers → enable Google. Create an OAuth client at
--    console.cloud.google.com (APIs & Services → Credentials), set its
--    authorized redirect URI to the callback URL Supabase shows on that
--    provider page, then paste the client ID + secret into Supabase.
--    (Email sign-in needs no extra step here — it's on by default.)
-- 3. Authentication → URL Configuration → add every URL the app runs at to
--    "Redirect URLs" (e.g. http://localhost:8000, your deployed site URL).
--    If the app's URL isn't allow-listed, sign-in silently redirects to the
--    Site URL instead — which looks like a broken login.
-- 4. Project Settings → API → copy the Project URL and anon public key into
--    config.js (SUPABASE_URL / SUPABASE_ANON_KEY).
--
-- The anon key is safe to publish: it only grants what these RLS policies
-- allow, and every policy below is scoped to auth.uid().

-- 1. Per-user profile (settings like theme preference) --------------------
create table if not exists public.profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  theme      text default 'light',
  created_at timestamptz default now()
);

-- 2. A medication saved in a user's cabinet -------------------------------
create table if not exists public.medications (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  name       text not null,        -- what the user typed
  generic    text,                 -- resolved generic name (openFDA/RxNorm)
  brand      text,                 -- resolved brand name
  rxcui      text,                 -- RxNorm id (handy for de-duping)
  drug_class text,
  notes      text,                 -- e.g. "morning, with food"
  created_at timestamptz default now()
);

create index if not exists medications_user_idx on public.medications(user_id);

-- 3. Row-Level Security ----------------------------------------------------
alter table public.profiles    enable row level security;
alter table public.medications enable row level security;

create policy "own profile: select" on public.profiles
  for select using (auth.uid() = id);
create policy "own profile: insert" on public.profiles
  for insert with check (auth.uid() = id);
create policy "own profile: update" on public.profiles
  for update using (auth.uid() = id);

create policy "own meds: select" on public.medications
  for select using (auth.uid() = user_id);
create policy "own meds: insert" on public.medications
  for insert with check (auth.uid() = user_id);
create policy "own meds: update" on public.medications
  for update using (auth.uid() = user_id);
create policy "own meds: delete" on public.medications
  for delete using (auth.uid() = user_id);

-- 4. Auto-create a profile row on signup ----------------------------------
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id) values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
