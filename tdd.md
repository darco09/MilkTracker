# LittleCare TDD v1.0

## Tech Stack

-   Next.js App Router
-   TypeScript
-   Tailwind CSS
-   Supabase PostgreSQL
-   Vercel

## Folder Structure

``` text
app/
components/
hooks/
lib/
types/
```

## Architecture

-   Server Components untuk data awal.
-   Client Components untuk countdown dan form.
-   Supabase sebagai backend.

## Main Modules

1.  Dashboard
2.  History
3.  Report

## Data Flow

User submit feeding → insert milk_logs → hitung next_time =
actual_time + 3 jam → refresh dashboard/history/report

## Queries

-   Last feeding
-   Daily progress
-   History by date
-   Weekly report

## UI

Bottom navigation, mobile first, Tailwind, tombol minimum 56px.

## Deployment

-   Vercel
-   Environment:
    -   NEXT_PUBLIC_SUPABASE_URL
    -   NEXT_PUBLIC_SUPABASE_ANON_KEY
