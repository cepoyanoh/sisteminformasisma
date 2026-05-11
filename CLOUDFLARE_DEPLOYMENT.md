# Panduan Deploy ke Cloudflare

## Gambaran Umum

Aplikasi ini adalah aplikasi Node.js berbasis Express.js yang menggunakan SQLite sebagai database. Karena Cloudflare Pages dan Cloudflare Workers tidak mendukung runtime Node.js secara langsung seperti server tradisional, kita perlu melakukan beberapa modifikasi agar aplikasi bisa berjalan di lingkungan Cloudflare.

## Pilihan Deployment di Cloudflare

### 1. Cloudflare Pages (untuk frontend statis)

Cloudflare Pages cocok untuk hosting file statis (HTML, CSS, JS). Namun karena aplikasi ini adalah aplikasi server-side rendering (SSR) dengan EJS, Cloudflare Pages tidak cocok untuk hosting aplikasi utama.

### 2. Cloudflare Workers (untuk backend API)

Kita bisa menggunakan Cloudflare Workers untuk menjalankan backend, tapi dengan beberapa keterbatasan:

- Cloudflare Workers tidak mendukung filesystem secara native
- SQLite tidak didukung karena bersifat file-based
- Kita perlu mengganti database ke D1 (Cloudflare's SQL database) atau solusi database lain yang bisa diakses via jaringan

## Solusi: Konversi ke Arsitektur Terdistribusi

Untuk menjalankan aplikasi ini di Cloudflare, kita perlu:

1. Memisahkan frontend (halaman statis) dari backend (API)
2. Menggunakan Cloudflare Pages untuk frontend
3. Menggunakan Cloudflare Workers + D1 untuk backend
4. Mengganti SQLite dengan Cloudflare D1 atau database eksternal

## File Konfigurasi untuk Wrangler (Cloudflare Workers)

Berikut adalah contoh konfigurasi untuk `wrangler.toml`:

```toml
name = "sistem-informasi-akademik"
main = "src/index.js"
compatibility_date = "2024-01-01"

[env.production]
account_id = "your-account-id"
workers_dev = true
route = ""
zone_id = ""

[[d1_databases]]
binding = "DB"
database_name = "sistem_akademik_db"
database_id = ""
migrations_dir = "./migrations"
```

## Konfigurasi Build untuk Cloudflare

Kita perlu membuat versi server yang dioptimalkan untuk lingkungan Cloudflare. File [cloudflare-server.js](file:///d%3A/SISTEMINFORMASIoke/cloudflare-server.js) akan berisi versi yang disesuaikan:

- Mengganti SQLite dengan D1
- Mengganti sistem template EJS dengan sistem yang sesuai Cloudflare Workers
- Menggunakan environment variables dari Cloudflare

## Alternatif: Deploy ke Platform Lain

Jika modifikasi terlalu kompleks, pertimbangkan platform lain yang mendukung Node.js secara native:

- Render.com
- Railway.app
- Heroku (meskipun sekarang mulai berbayar)
- DigitalOcean App Platform
- AWS (EC2, ECS, atau Lambda)
- Google Cloud Platform

## Catatan Penting

1. SQLite tidak didukung di lingkungan serverless
2. Harus mengganti semua operasi filesystem
3. Session harus disimpan di tempat selain file (misalnya Redis atau database)
4. Upload file mungkin perlu disesuaikan dengan layanan eksternal
5. Cron job perlu diganti dengan scheduled workers