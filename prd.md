# LittleCare PRD v1.2

## Overview

LittleCare adalah aplikasi internal pribadi untuk mencatat feeding NGT
anak dengan Cerebral Palsy.

## Goals

-   Tracking feeding
-   Countdown feeding berikutnya
-   History
-   Report mingguan

## User

Single user, tanpa login.

## Business Rules

-   Target 120 ml per feeding.
-   Target harian 960 ml.
-   Feeding setiap 3 jam.
-   Estimasi durasi ±90 menit.
-   Acuan jadwal adalah waktu mulai feeding (`actual_time`).
-   `next_time = actual_time + 3 jam`.

## Feeding Status

-   Completed
-   Partial
-   Skipped (wajib alasan)

## Database

Table `milk_logs`

  Column              Type
  ------------------- -------------
  id                  uuid
  child_name          text
  target_time         timestamptz
  actual_time         timestamptz
  next_time           timestamptz
  volume_target       integer
  volume_actual       integer
  retention_checked   boolean
  retention_volume    integer
  feeding_status      text
  skip_reason         text
  notes               text
  created_at          timestamptz

## Features

### Dashboard

-   Progress harian
-   Countdown
-   Last feeding
-   Form feeding

### History

-   Hari ini
-   Kemarin
-   Date picker

### Report

-   Minggu ini
-   Minggu lalu
-   Total intake
-   Average intake
-   Retention frequency
-   Feeding summary
-   Notes

## Validation

-   Nama wajib
-   Volume \>=0
-   Retention \<= volume
-   Skip =\> volume=0 & reason wajib

## Future

-   PWA
-   Push notification
-   Export PDF
-   Grafik
-   Offline mode
