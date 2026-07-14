# LittleCare 🍼

Aplikasi web internal untuk mencatat **feeding NGT** anak dengan Cerebral Palsy.
Dibangun sesuai PRD v1.2 & TDD v1.0.

## Tech Stack

- **Next.js 15** (App Router) + **TypeScript**
- **Tailwind CSS v4**
- **Supabase** (PostgreSQL + **Auth**)
- Deploy: **Vercel**

## Fitur

| Modul         | Isi                                                                    |
| ------------- | --------------------------------------------------------------------- |
| **Auth**      | Login & daftar (email + password). Multi-user: tiap akun data sendiri |
| **Dashboard** | Progress harian, countdown feeding berikutnya, feeding terakhir, form |
| **Riwayat**   | Hari ini, kemarin, date picker                                        |
| **Laporan**   | Minggu ini/lalu, total & rata-rata intake, retensi, ringkasan, catatan |

Isolasi data antar user ditegakkan **Row Level Security** (`auth.uid() = user_id`).

## Business Rules (PRD)

- Target **120 ml** per feeding, **960 ml** per hari (8x).
- Feeding tiap **3 jam**, estimasi durasi ±90 menit.
- `next_time = actual_time + 3 jam`.
- Status: `completed`, `partial`, `skipped` (skip wajib alasan & volume 0).
- Validasi: nama wajib, volume ≥ 0, retensi ≤ volume.

## Setup

Aplikasi membutuhkan Supabase (database + auth).

1. **Buat project** di [Supabase](https://supabase.com).

2. **Jalankan skema**: SQL Editor → tempel `supabase/schema.sql` → Run.
   (Membuat tabel `milk_logs` + `app_settings`, kolom `user_id`, dan RLS per user.)

3. **Aktifkan Email auth**: Authentication → Providers → **Email** = ON.
   Untuk login instan tanpa verifikasi, matikan **Confirm email**
   (kalau dibiarkan ON, user harus klik link di email dulu sebelum bisa login).

4. **Isi env** (dari Project Settings → API):

   ```bash
   cp .env.example .env.local
   ```

   ```env
   NEXT_PUBLIC_SUPABASE_URL=...
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   ```

5. **Jalankan**:

   ```bash
   npm install
   npm run dev
   ```

   Buka http://localhost:3000 → diarahkan ke `/login`. Daftar akun → set nama
   anak sekali → mulai mencatat.

## Struktur Folder

```text
app/            # Halaman: login, dashboard, history, report (Server Components)
components/     # UI: auth form, feeding form, countdown, kartu, navigasi
hooks/          # useCountdown (client)
lib/            # utils, queries, actions, auth-actions, klien Supabase (SSR)
middleware.ts   # Proteksi rute + refresh session
types/          # Tipe MilkLog & lainnya
supabase/       # schema.sql (multi-user + RLS)
```

## Deploy ke Vercel

1. Push repo ke GitHub, import ke Vercel.
2. Set env `NEXT_PUBLIC_SUPABASE_URL` & `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
3. Deploy. Tambahkan domain Vercel ke Supabase → Authentication → URL
   Configuration (Site URL / Redirect URLs) bila perlu.

## Roadmap (Future)

PWA · Push notification · Export PDF · Grafik · Offline mode
