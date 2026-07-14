# LittleCare 🍼

Aplikasi web internal untuk mencatat **feeding NGT** anak dengan Cerebral Palsy.
Dibangun sesuai PRD v1.2 & TDD v1.0.

## Tech Stack

- **Next.js 15** (App Router) + **TypeScript**
- **Tailwind CSS v4**
- **Supabase** (PostgreSQL)
- Deploy: **Vercel**

## Fitur

| Modul         | Isi                                                                    |
| ------------- | --------------------------------------------------------------------- |
| **Dashboard** | Progress harian, countdown feeding berikutnya, feeding terakhir, form |
| **Riwayat**   | Hari ini, kemarin, date picker                                        |
| **Laporan**   | Minggu ini/lalu, total & rata-rata intake, retensi, ringkasan, catatan |

## Business Rules (PRD)

- Target **120 ml** per feeding, **960 ml** per hari (8x).
- Feeding tiap **3 jam**, estimasi durasi ±90 menit.
- `next_time = actual_time + 3 jam`.
- Status: `completed`, `partial`, `skipped` (skip wajib alasan & volume 0).
- Validasi: nama wajib, volume ≥ 0, retensi ≤ volume.

## Jalankan di Lokal (tanpa Supabase) ✅

App bisa langsung jalan penuh tanpa setup apa pun. Data disimpan otomatis ke
file `.data/milk_logs.json`.

```bash
npm install
npm run dev
```

Buka http://localhost:3000 — langsung bisa nyatet feeding, countdown, riwayat,
dan laporan.

## Pakai Supabase (opsional, untuk produksi)

1. Buat project di [Supabase](https://supabase.com), jalankan
   `supabase/schema.sql` di **SQL Editor**.

2. Salin env dan isi kredensial (dari Supabase → Project Settings → API):

   ```bash
   cp .env.example .env.local
   ```

   ```env
   NEXT_PUBLIC_SUPABASE_URL=...
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   ```

3. Restart `npm run dev`. App otomatis pindah dari mode lokal ke Supabase.

> Deteksi backend otomatis: ada kredensial → Supabase, tidak ada → file lokal.

## Struktur Folder

```text
app/            # Halaman (dashboard, history, report) — Server Components
components/     # UI: form, countdown, kartu, navigasi
hooks/          # useCountdown (client)
lib/            # constants, utils, queries, actions, klien Supabase
types/          # Tipe MilkLog & lainnya
supabase/       # schema.sql
```

## Deploy ke Vercel

1. Push repo ke GitHub, import ke Vercel.
2. Set env `NEXT_PUBLIC_SUPABASE_URL` & `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
3. Deploy.

## Roadmap (Future)

PWA · Push notification · Export PDF · Grafik · Offline mode
