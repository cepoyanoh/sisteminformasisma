# Perbedaan Hosting di Vercel versus Pendekatan Tradisional

## Gambaran Umum

Aplikasi Sistem Informasi Akademik saat ini berjalan di lingkungan Node.js/Express tradisional, sedangkan Vercel menggunakan lingkungan serverless. Dokumen ini menjelaskan perbedaan mendasar antara kedua pendekatan ini.

## Lingkungan Tradisional (Seperti saat ini)

### Karakteristik:
- **Runtime**: Node.js runtime penuh
- **Database**: SQLite (file-based) atau database server
- **Filesystem**: Akses penuh ke filesystem
- **Session**: Disimpan di memory atau filesystem
- **Server**: Selalu aktif, menunggu permintaan
- **State**: Dapat menyimpan state antar permintaan
- **Durasi eksekusi**: Tidak terbatas (dalam batas wajar)

### Contoh arsitektur saat ini:
```
Browser <--HTTP--> Express Server (Node.js) <--File I/O--> SQLite (database.db)
                      |
                      |-- Memory --> Sessions
                      |-- Filesystem --> Views (EJS templates)
                      '-- Network --> External APIs
```

## Lingkungan Vercel (Serverless Functions)

### Karakteristik:
- **Runtime**: Lingkungan serverless berbasis container sementara
- **Database**: Harus menggunakan database eksternal (PostgreSQL, MySQL, MongoDB)
- **Filesystem**: Tidak ada akses persisten ke filesystem
- **Session**: Disimpan di database eksternal atau dengan JWT
- **Server**: Hanya aktif saat menerima permintaan (cold start/hot start)
- **State**: Stateless - tidak ada penyimpanan antar permintaan
- **Durasi eksekusi**: Terbatas (maksimal 10 detik untuk plan gratis, 60 detik untuk Pro)

### Contoh arsitektur untuk Vercel:
```
Browser <--HTTP--> Vercel Edge Network --> Serverless Function --> PostgreSQL
                                                                     |
                                                                     |-- Redis (Sessions)
                                                                     '-- Network --> External APIs
```

## Konsekuensi Teknis

### 1. Database
- **Tradisional**: SQLite disimpan sebagai file lokal
- **Vercel**: Harus menggunakan database eksternal seperti PostgreSQL

### 2. Sistem Template
- **Tradisional**: EJS templates disimpan dan dibaca dari filesystem
- **Vercel**: Harus menggunakan Next.js dengan React components atau kirimkan data JSON

### 3. Session Management
- **Tradisional**: express-session menyimpan data di memory atau file
- **Vercel**: Harus menggunakan JWT atau menyimpan di database eksternal

### 4. File Upload
- **Tradisional**: Disimpan di direktori lokal
- **Vercel**: Harus menggunakan layanan eksternal seperti AWS S3

### 5. Middleware
- **Tradisional**: Middleware Express berjalan dalam urutan tertentu
- **Vercel**: Harus menggunakan API Routes dengan logika validasi sendiri

## Implementasi Praktis

### Contoh perbedaan penanganan rute:

#### Tradisional (Express):
```javascript
// routes/siswa.js
app.get('/siswa', requireAuth, (req, res) => {
  Siswa.getAll((err, siswaList) => {
    if (err) return res.status(500).send(err.message);
    res.render('siswa/index', { siswa: siswaList, user: req.session.user });
  });
});
```

#### Vercel (Next.js API Routes):
```javascript
// pages/api/siswa.js
import { getSession } from 'next-auth/react';

export default async function handler(req, res) {
  const session = await getSession({ req });
  
  if (!session || !['admin', 'super_admin'].includes(session.role)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  try {
    const siswaList = await getSiswaFromDatabase();
    res.status(200).json(siswaList);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
```

## Cold Start dan Performa

### Cold Start di Vercel:
- Fungsi pertama kali dijalankan mungkin lambat (cold start)
- Fungsi yang baru-baru ini diakses akan cepat (hot start)
- Tergantung pada ukuran bundle kode

### Performa Tradisional:
- Server selalu aktif, respons cepat
- Tergantung pada kapasitas server fisik/virtual

## Keterbatasan Spesifik Vercel

### 1. Ukuran Bundle
- Fungsi serverless maksimal 50MB (untuk plan gratis)
- Harus mengoptimalkan dependensi

### 2. Waktu Eksekusi
- Maksimal 10 detik untuk plan gratis
- Maksimal 60 detik untuk akun Pro Team

### 3. Akses Filesystem
- Hanya bisa menulis ke /tmp (dengan batasan ruang)
- Tidak ada persistensi file

## Kesimpulan

Hosting aplikasi Node.js/Express tradisional seperti Sistem Informasi Akademik di Vercel memerlukan:

1. **Rekayasa ulang arsitektur** dari Express ke Next.js
2. **Penggantian database** dari SQLite ke database eksternal
3. **Penggantian sistem templating** dari EJS ke React components
4. **Penggantian sistem session** dari memory/file ke JWT atau database
5. **Optimasi untuk serverless** (ukuran bundle, waktu eksekusi)

## Alternatif Pendekatan

Jika konversi penuh terlalu kompleks:
1. Gunakan platform seperti Render atau Railway yang mendukung aplikasi Express tradisional
2. Gunakan Vercel hanya untuk frontend statis (jika aplikasi dipecah menjadi frontend/backend terpisah)
3. Gunakan pendekatan hybrid dengan proxy