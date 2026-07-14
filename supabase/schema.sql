-- LittleCare — skema database untuk Supabase (PostgreSQL)
-- Jalankan di Supabase Dashboard -> SQL Editor

create extension if not exists "pgcrypto";

create table if not exists public.milk_logs (
  id                uuid primary key default gen_random_uuid(),
  child_name        text        not null,
  target_time       timestamptz not null,
  actual_time       timestamptz not null,
  next_time         timestamptz not null,
  volume_target     integer     not null default 120,
  volume_actual     integer     not null default 0,
  retention_checked boolean     not null default false,
  retention_volume  integer,
  feeding_status    text        not null default 'completed'
                      check (feeding_status in ('completed', 'partial', 'skipped')),
  skip_reason       text,
  notes             text,
  created_at        timestamptz not null default now(),

  -- Aturan validasi PRD ditegakkan di level database
  constraint volume_non_negative check (volume_actual >= 0),
  constraint retention_within_volume
    check (retention_volume is null or retention_volume <= volume_actual),
  constraint skip_requires_reason
    check (
      feeding_status <> 'skipped'
      or (volume_actual = 0 and skip_reason is not null and length(trim(skip_reason)) > 0)
    )
);

-- Index untuk query per-tanggal & feeding terakhir
create index if not exists milk_logs_actual_time_idx
  on public.milk_logs (actual_time desc);

-- Pengaturan aplikasi (single-row). Menyimpan nama anak yang diisi sekali.
create table if not exists public.app_settings (
  id         text primary key default 'app',
  child_name text,
  updated_at timestamptz not null default now()
);

-- Aplikasi single-user tanpa login: aktifkan RLS lalu izinkan akses via anon key.
-- (Untuk penggunaan pribadi/internal. Perketat bila diperlukan.)
alter table public.milk_logs enable row level security;

drop policy if exists "allow anon full access" on public.milk_logs;
create policy "allow anon full access"
  on public.milk_logs
  for all
  to anon
  using (true)
  with check (true);

alter table public.app_settings enable row level security;

drop policy if exists "allow anon full access" on public.app_settings;
create policy "allow anon full access"
  on public.app_settings
  for all
  to anon
  using (true)
  with check (true);
