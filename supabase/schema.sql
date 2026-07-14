-- LittleCare — skema database Supabase (PostgreSQL), MULTI-USER
-- Jalankan di Supabase Dashboard -> SQL Editor.
-- Tiap user (keluarga) hanya bisa mengakses datanya sendiri (RLS per user_id).

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Tabel utama: catatan feeding
-- ---------------------------------------------------------------------------
create table if not exists public.milk_logs (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null default auth.uid()
                      references auth.users (id) on delete cascade,
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

create index if not exists milk_logs_user_time_idx
  on public.milk_logs (user_id, actual_time desc);

-- ---------------------------------------------------------------------------
-- Pengaturan per user: nama anak (diisi sekali)
-- ---------------------------------------------------------------------------
create table if not exists public.app_settings (
  user_id    uuid primary key default auth.uid()
               references auth.users (id) on delete cascade,
  child_name text,
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Row Level Security: setiap user hanya melihat/mengubah barisnya sendiri
-- ---------------------------------------------------------------------------
alter table public.milk_logs enable row level security;
drop policy if exists "own milk_logs" on public.milk_logs;
create policy "own milk_logs"
  on public.milk_logs
  for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

alter table public.app_settings enable row level security;
drop policy if exists "own app_settings" on public.app_settings;
create policy "own app_settings"
  on public.app_settings
  for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
