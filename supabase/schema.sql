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

-- 1. Per-user profile (settings like theme + language preference) ---------
create table if not exists public.profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  theme      text default 'light',
  lang       text default 'en',
  created_at timestamptz default now()
);
-- safe to re-run against an existing table that predates the `lang` column
alter table public.profiles add column if not exists lang text default 'en';

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

-- 5. Shareable read-only cabinet links (Phase 5) ----------------------------
-- Lets a signed-in user generate an unguessable link that shows their
-- cabinet, read-only, to someone with no account at all (a caregiver).
--
-- Security model, read this before changing anything here:
--   - `token` is a random uuid (gen_random_uuid() — 122 bits of randomness),
--     so it can't be guessed or brute-forced.
--   - The anon (public, signed-out) role has ZERO policies on this table —
--     it cannot SELECT/INSERT/UPDATE/DELETE cabinet_shares directly, at
--     all. Only the owner (auth.uid() = user_id) can see or manage their
--     own share rows.
--   - The ONLY way anon ever reads shared data is get_shared_cabinet()
--     below: a SECURITY DEFINER function that takes exactly one token and
--     returns only the medications belonging to whoever owns that token
--     (and only if it hasn't been revoked). There is no way to pass in a
--     wildcard, list all tokens, or reach any row you don't already hold
--     the exact token for. It also returns a deliberately narrow column
--     set (generic/brand/class/notes) — never id, user_id, or rxcui.
--   - Revoking is just setting revoked_at — the function checks that on
--     every call, so a revoked link stops working immediately.
create table if not exists public.cabinet_shares (
  token      uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz default now(),
  revoked_at timestamptz
);

create index if not exists cabinet_shares_user_idx on public.cabinet_shares(user_id);

alter table public.cabinet_shares enable row level security;

-- owner-only. No anon/public policy exists on this table on purpose.
create policy "own shares: select" on public.cabinet_shares
  for select using (auth.uid() = user_id);
create policy "own shares: insert" on public.cabinet_shares
  for insert with check (auth.uid() = user_id);
create policy "own shares: update" on public.cabinet_shares
  for update using (auth.uid() = user_id);

create or replace function public.get_shared_cabinet(share_token uuid)
returns table (generic text, brand text, drug_class text, notes text)
language sql security definer stable set search_path = public, pg_temp as $$
  select m.generic, m.brand, m.drug_class, m.notes
  from public.medications m
  join public.cabinet_shares s on s.user_id = m.user_id
  where s.token = share_token and s.revoked_at is null;
$$;

-- anon = signed-out visitors following a share link; authenticated =
-- someone who happens to be signed into their own account while viewing
-- someone else's link. Both need EXECUTE; neither gets direct table access.
grant execute on function public.get_shared_cabinet(uuid) to anon, authenticated;
