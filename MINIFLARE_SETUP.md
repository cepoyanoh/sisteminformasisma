# Setup Miniflare untuk Pengujian Lokal

## Gambaran Umum

Miniflare adalah alat pengujian lokal untuk Cloudflare Workers yang memungkinkan Anda menjalankan dan menguji Workers secara lokal sebelum dideploy ke produksi. Dokumen ini menjelaskan cara mengatur dan menggunakan Miniflare untuk menguji aplikasi Sistem Informasi Akademik.

## Instalasi

### Prasyarat

- Node.js versi 16.13 atau lebih baru
- npm atau yarn

### Instalasi Miniflare

Instal Miniflare sebagai dependensi dev:

```bash
npm install --save-dev miniflare
```

Atau secara global untuk penggunaan CLI:

```bash
npm install -g miniflare
```

## Konfigurasi Miniflare

Anda dapat mengkonfigurasi Miniflare melalui beberapa cara:

### 1. Melalui file wrangler.toml

```toml
# wrangler.toml
name = "sistem-informasi-akademik"
main = "src/index.js"
compatibility_date = "2024-05-11"

# Konfigurasi untuk Miniflare
[miniflare]
# Aktifkan D1
d1 = true
# Aktifkan KV
kv_persist = true
# Aktifkan Cache
cache = true
# Port untuk server lokal
port = 8787
```

### 2. Melalui file miniflare.json

```json
{
  "name": "sistem-informasi-akademik",
  "script": "./cloudflare-server.js",
  "modules": true,
  "d1": true,
  "kv": ["MY_KV_NAMESPACE"],
  "port": 8787,
  "upstream": "http://localhost:3000",
  "env": {
    "NODE_ENV": "development",
    "DEBUG": "true"
  }
}
```

### 3. Melalui perintah CLI

```bash
miniflare ./cloudflare-server.js \
  --modules \
  --d1 \
  --kv MY_KV_NAMESPACE \
  --port 8787 \
  --env.NODE_ENV development
```

## Menjalankan Aplikasi Secara Lokal

### 1. Menjalankan dengan perintah npx

```bash
npx miniflare ./cloudflare-server.js \
  --modules \
  --watch \
  --port 8787
```

Flag `--watch` akan otomatis merestart server ketika ada perubahan file.

### 2. Menjalankan dengan perintah global

```bash
miniflare ./cloudflare-server.js --modules
```

### 3. Menjalankan dengan npm script

Tambahkan ke [package.json](file:///d%3A/SISTEMINFORMASIoke/package.json):

```json
{
  "scripts": {
    "dev:miniflare": "miniflare ./cloudflare-server.js --modules --watch --port 8787"
  }
}
```

Lalu jalankan:

```bash
npm run dev:miniflare
```

## Konfigurasi D1 (Database)

Untuk menggunakan D1 di Miniflare, Anda perlu:

1. Membuat skema database:

```sql
-- migrations/001_create_users.sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT CHECK(role IN ('super_admin', 'admin', 'guru', 'siswa')) NOT NULL,
  guru_id INTEGER,
  siswa_id INTEGER,
  is_active INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (guru_id) REFERENCES guru (id),
  FOREIGN KEY (siswa_id) REFERENCES siswa (id)
);
```

2. Menambahkan konfigurasi D1 ke wrangler.toml:

```toml
[d1_databases]
binding = "DB"                          # Tersedia di Worker sebagai env.DB
database_name = "sistem-akademik-db"    # Nama database D1 Anda
database_id = ""                        # Akan otomatis terisi saat deploy
migrations_dir = "./migrations"         # Direktori skema migrasi
```

## Konfigurasi KV (Key-Value Store)

Untuk menyimpan session dan data sementara:

```toml
[kv_namespaces]
binding = "SESSION_STORE"
id = "your-kv-namespace-id"
preview_id = "your-preview-namespace-id"
```

## Testing API

Setelah menjalankan Miniflare, Anda bisa menguji API di:

```
http://localhost:8787
```

Contoh permintaan API:

```bash
curl -X GET http://localhost:8787/api/stats
curl -X GET http://localhost:8787/api/siswa
```

## Debugging

Untuk debugging, aktifkan mode verbose:

```bash
npx miniflare ./cloudflare-server.js --modules --debug
```

Atau tambahkan flag `--verbose` untuk informasi lebih detail:

```bash
npx miniflare ./cloudflare-server.js --modules --verbose
```

## Environment Variables

Untuk mengatur environment variables di Miniflare, Anda bisa:

1. Menggunakan file [.env](file:///d%3A/SISTEMINFORMASIoke/.env):

```
DATABASE_URL=your_database_url
SESSION_SECRET=your_session_secret
```

2. Atau mengatur langsung di konfigurasi Miniflare:

```json
{
  "env": {
    "DATABASE_URL": "your_database_url",
    "SESSION_SECRET": "your_session_secret"
  }
}
```

## Integrasi dengan Proses Pengembangan

Tambahkan skrip berikut ke [package.json](file:///d%3A/SISTEMINFORMASIoke/package.json) untuk mempermudah workflow:

```json
{
  "scripts": {
    "dev:miniflare": "miniflare ./cloudflare-server.js --modules --watch --port 8787",
    "test:miniflare": "miniflare ./cloudflare-server.js --modules --port 0",  // Gunakan port acak
    "debug:miniflare": "miniflare ./cloudflare-server.js --modules --debug --port 8787"
  }
}
```

## Troubleshooting

### Masalah Umum dan Solusi

1. **Module tidak ditemukan**:
   Pastikan Anda menambahkan flag `--modules` saat menjalankan Miniflare

2. **D1 tidak berfungsi**:
   Pastikan konfigurasi D1 benar dan migrasi telah dijalankan

3. **Port sudah digunakan**:
   Ganti ke port lain dengan flag `--port`

4. **Environment variables tidak terbaca**:
   Pastikan file [.env](file:///d%3A/SISTEMINFORMASIoke/.env) berada di direktori yang benar dan terbaca oleh Miniflare

## Deploy ke Production

Setelah selesai pengujian lokal, deploy ke Cloudflare:

```bash
wrangler deploy
```

Pastikan Anda telah mengkonfigurasi akun Cloudflare dan izin yang diperlukan.