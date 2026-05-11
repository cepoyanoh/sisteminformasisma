# Hosting Aplikasi di Vercel

## Gambaran Umum

Vercel adalah platform hosting modern yang dirancang untuk aplikasi serverless. Namun, aplikasi Sistem Informasi Akademik saat ini adalah aplikasi Node.js/Express tradisional yang menggunakan SQLite (database berbasis file). Untuk dapat di-host di Vercel, kita perlu melakukan beberapa modifikasi.

## Perbedaan Lingkungan

### Lingkungan Saat Ini (Node.js/Express Tradisional)
- Runtime Node.js penuh
- Akses filesystem
- Database SQLite (file-based)
- Server berjalan terus-menerus
- Session disimpan di memory atau filesystem

### Lingkungan Vercel (Serverless Functions)
- Lingkungan serverless
- Tidak ada akses filesystem persisten
- Tidak mendukung SQLite (karena bersifat file-based)
- Fungsi berjalan sesuai permintaan
- Stateless - tidak ada session persisten

## Modifikasi yang Diperlukan

### 1. Ganti Database SQLite

Vercel tidak mendukung SQLite karena bersifat file-based. Kita perlu mengganti ke database server seperti PostgreSQL:

Install dependensi:
```bash
npm install pg
```

Ubah konfigurasi database:
```javascript
// config/dbConfig.js
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

module.exports = {
  query: (text, params) => pool.query(text, params),
};
```

### 2. Konversi Rute ke API Routes

Ubah dari sistem routing Express ke API Routes Vercel:

#### Sebelum (Express):
```javascript
// routes/siswa.js
app.get('/siswa', (req, res) => {
  Siswa.getAll((err, siswaList) => {
    if (err) return res.status(500).send(err.message);
    res.render('siswa/index', { siswa: siswaList });
  });
});
```

#### Sesudah (Vercel API Routes):
```javascript
// api/siswa/index.js
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { rows } = await db.query('SELECT * FROM siswa');
    res.status(200).json(rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}
```

### 3. Ganti Sistem Template

Ubah dari EJS ke sistem template yang kompatibel dengan Next.js (jika menggunakan Next.js) atau kirimkan data JSON dan render di sisi klien.

## Pendekatan untuk Vercel

### Pendekatan 1: Konversi ke Next.js (Direkomendasikan)

1. Ubah aplikasi menjadi aplikasi Next.js
2. Gunakan API Routes untuk backend
3. Gunakan React untuk frontend
4. Gunakan database eksternal (PostgreSQL, MySQL, dll.)

#### Struktur Next.js:
```
/pages
  /api
    /siswa.js
    /guru.js
    /kelas.js
  /siswa.js
  /guru.js
  /kelas.js
  /index.js
```

### Pendekatan 2: Gunakan Adapter untuk Express

Gunakan adapter untuk menjalankan Express di Vercel:

1. Install nextjs-serverless:
```bash
npm install @sls-next/lambda-at-edge
```

2. Buat file konfigurasi Vercel:
```json
{
  "version": 2,
  "name": "sistem-informasi-akademik",
  "builds": [
    {
      "src": "app.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "app.js"
    }
  ]
}
```

## Konfigurasi Vercel

### File vercel.json:
```json
{
  "version": 2,
  "name": "sistem-informasi-akademik",
  "builds": [
    {
      "src": "app.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "app.js"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
```

## Langkah-langkah Deploy ke Vercel

### 1. Persiapan
- Pastikan aplikasi telah dimodifikasi untuk kompatibilitas serverless
- Ganti SQLite dengan database eksternal
- Ganti sistem session ke JWT atau database

### 2. Install CLI Vercel
```bash
npm i -g vercel
```

### 3. Login ke Vercel
```bash
vercel login
```

### 4. Inisialisasi Proyek
```bash
vercel
```

### 5. Set Environment Variables
- DATABASE_URL: URL koneksi database eksternal
- SESSION_SECRET: Secret untuk enkripsi session
- DLL

## Alternatif: Pendekatan Hybrid

Jika konversi terlalu kompleks, pertimbangkan pendekatan hybrid:

1. Deploy backend ke platform lain (Render, Railway)
2. Gunakan Vercel untuk frontend statis
3. Konfigurasi proxy untuk menghubungkan keduanya

## Keterbatasan dan Solusi

### Keterbatasan:
- Tidak bisa menggunakan SQLite
- Waktu eksekusi fungsi terbatas
- Tidak ada state persisten
- Batas ukuran payload

### Solusi:
- Gunakan database eksternal (Supabase, PlanetScale, MongoDB Atlas)
- Gunakan service external untuk session (Redis)
- Gunakan service external untuk file upload (AWS S3, Cloudinary)

## Kesimpulan

Hosting aplikasi Express tradisional di Vercel memerlukan perubahan arsitektural signifikan. Pendekatan terbaik adalah:
1. Konversi ke Next.js dengan API Routes
2. Ganti database ke sistem eksternal
3. Gunakan JWT untuk autentikasi
4. Atau gunakan pendekatan hybrid dengan backend di platform lain

Vercel sangat baik untuk frontend statis dan API serverless, tetapi mungkin bukan pilihan terbaik untuk aplikasi Node.js tradisional dengan database file-based seperti SQLite.