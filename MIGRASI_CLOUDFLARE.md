# Migrasi Aplikasi Express ke Cloudflare Workers

## Gambaran Umum

Aplikasi ini saat ini merupakan aplikasi Node.js berbasis Express dengan database SQLite lokal. Untuk menjalankannya di Cloudflare Workers, kita perlu melakukan perubahan signifikan karena perbedaan lingkungan eksekusi.

## Perbedaan Lingkungan

| Aspek | Lingkungan Node.js Tradisional | Lingkungan Cloudflare Workers |
|-------|-------------------------------|------------------------------|
| Filesystem | Akses penuh ke filesystem | Tidak ada akses filesystem |
| Database | SQLite (file-based) | D1, KV, atau database eksternal |
| Session | File atau memory | KV atau database |
| Upload | Lokal ke server | Ke layanan eksternal (R2, S3, dll) |
| Eksekusi | Server permanen | Serverless, stateless |

## Langkah-langkah Migrasi

### 1. Ganti Database SQLite

#### Sebelum (Node.js tradisional)
```javascript
// config/dbConfig.js
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.db');
```

#### Sesudah (Cloudflare Workers + D1)
```javascript
// Dalam handler worker
const stmt = env.DB.prepare("SELECT * FROM users WHERE id = ?");
const user = await stmt.bind(userId).all();
```

### 2. Ganti Sistem Template

#### Sebelum (EJS dengan layout)
```javascript
app.set('view engine', 'ejs');
res.render('index', { data: someData });
```

#### Sesudah (HTML template dalam JavaScript)
```javascript
const html = `
  <html>
    <body>
      <h1>${data.title}</h1>
      <p>${data.content}</p>
    </body>
  </html>
`;
return new Response(html, { headers: { 'Content-Type': 'text/html' } });
```

### 3. Ganti Sistem Session

#### Sebelum (express-session)
```javascript
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true
}));
```

#### Sesudah (Cloudflare KV untuk session)
```javascript
// Simpan session ke KV
await env.MY_KV.put(sessionId, JSON.stringify(sessionData), { expirationTtl: 86400 });

// Ambil session dari KV
const sessionData = await env.MY_KV.get(sessionId);
```

### 4. Ganti File Upload

#### Sebelum (Multer)
```javascript
const upload = multer({ dest: 'uploads/' });
```

#### Sesudah (Upload ke layanan eksternal)
```javascript
// Upload ke R2 atau layanan lain
const formData = await request.formData();
const file = formData.get('file');
```

## Komponen yang Perlu Dimodifikasi

### Models
- Ganti semua operasi SQLite dengan D1
- Ubah sintaks query dari SQL tradisional ke sintaks D1
- Sesuaikan dengan struktur data Workers

### Routes
- Ubah dari sistem routing Express ke handler permintaan Workers
- Sesuaikan parameter URL dan parsing body
- Tangani otentikasi tanpa sistem session tradisional

### Views
- Ganti EJS dengan template HTML dalam JavaScript
- Atau gunakan sistem build statis sebelum deploy

## File-file yang Perlu Dimodifikasi

1. [app.js](file:///d%3A/SISTEMINFORMASIoke/app.js) - Ganti keseluruhan struktur aplikasi
2. Semua file di [/models](file:///d%3A/SISTEMINFORMASIoke/models) - Ganti operasi database
3. Semua file di [/routes](file:///d%3A/SISTEMINFORMASIoke/routes) - Ganti ke handler Workers
4. File [/config/dbConfig.js](file:///d%3A/SISTEMINFORMASIoke/config/dbConfig.js) - Ganti dengan konfigurasi D1
5. File [/public](file:///d%3A/SISTEMINFORMASIoke/public) - Dipindahkan ke Pages jika dipisah

## Strategi Migrasi Bertahap

1. **Persiapan Database**
   - Buat skema D1
   - Migrasi data dari SQLite ke D1
   - Uji coba query D1

2. **Pembuatan Handler Dasar**
   - Implementasikan endpoint utama
   - Gunakan mock data untuk pengujian awal

3. **Integrasi Otentikasi**
   - Implementasikan sistem login
   - Gunakan Cloudflare KV untuk session

4. **Implementasi Fitur**
   - Pindahkan fitur satu per satu
   - Uji setiap fitur secara menyeluruh

5. **Optimalisasi**
   - Optimalkan query D1
   - Tambahkan caching jika diperlukan
   - Tambahkan error handling

## Alat Bantu untuk Migrasi

1. **Wrangler CLI** - Untuk manajemen Workers
2. **Miniflare** - Untuk testing lokal
3. **D1 CLI** - Untuk manajemen database
4. **KV CLI** - Untuk manajemen session dan cache

## Alternatif Pendekatan

Jika migrasi penuh terlalu kompleks:

1. **Gunakan Platform Alternatif**
   - Render.com
   - Railway.app
   - Heroku

2. **Arsitektur Hybrid**
   - Frontend di Cloudflare Pages
   - Backend tetap di platform lain
   - Komunikasi via API

3. **Static Site Generation**
   - Generate halaman statis dari data
   - Deploy ke Cloudflare Pages
   - Gunakan Web API untuk interaktivitas

## Kesimpulan

Migrasi dari aplikasi Express tradisional ke Cloudflare Workers memerlukan perubahan arsitektur yang signifikan. Meskipun Workers menawarkan performa tinggi dan skalabilitas otomatis, proses migrasi memerlukan investasi waktu dan sumber daya yang cukup besar.