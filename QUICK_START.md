# Quick Start Guide - Sistem Informasi Tanpa Login

## ✅ Masalah Telah Diperbaiki

Error `Cannot find module './routes/pengguna'` telah diperbaiki dengan menghapus import route pengguna dari [`app.js`](file://d:\SISTEMINFORMASI\app.js).

## 🚀 Cara Menjalankan Aplikasi

### Opsi 1: Menggunakan restart.bat (Recommended)
```bash
# Double-click file atau jalankan dari terminal
.\restart.bat
```

### Opsi 2: Manual
```bash
# Hentikan proses Node.js yang sedang berjalan (jika ada)
taskkill /F /IM node.exe

# Jalankan aplikasi
npm start
```

### Opsi 3: Development Mode (Auto-reload)
```bash
npm run dev
```

## 🌐 Akses Aplikasi

Setelah aplikasi berjalan, buka browser dan akses:
```
http://localhost:3000
```

**Tidak perlu login!** Dashboard akan langsung tampil.

## ✨ Fitur yang Tersedia

Semua fitur dapat diakses tanpa autentikasi:

1. **Dashboard** - Halaman utama dengan statistik
2. **Data Kelas** - http://localhost:3000/kelas
3. **Mata Pelajaran** - http://localhost:3000/mapel
4. **Data Guru** - http://localhost:3000/guru
5. **Data Siswa** - http://localhost:3000/siswa
6. **Jurnal Guru** - http://localhost:3000/jurnal
7. **Input Nilai** - http://localhost:3000/nilai

## 🔧 Troubleshooting

### Port 3000 sudah digunakan?
```bash
# Cari proses yang menggunakan port 3000
netstat -ano | findstr :3000

# Hentikan proses tersebut (ganti PID dengan angka yang muncul)
taskkill /PID <PID> /F

# Atau hentikan semua proses Node.js
taskkill /F /IM node.exe
```

### Error "MODULE_NOT_FOUND"?
Pastikan semua dependencies terinstall:
```bash
npm install
```

### Aplikasi tidak merespons?
1. Cek terminal untuk error messages
2. Restart aplikasi menggunakan `restart.bat`
3. Clear browser cache (Ctrl+Shift+Delete)

## 📝 Perubahan yang Dilakukan

File yang dimodifikasi:
- ✅ [`app.js`](file://d:\SISTEMINFORMASI\app.js) - Dihapus import `penggunaRoutes`
- ✅ [`config/dbConfig.js`](file://d:\SISTEMINFORMASI\config\dbConfig.js) - Dihapus tabel users
- ✅ [`routes/nilai.js`](file://d:\SISTEMINFORMASI\routes\nilai.js) - Dihapus auth middleware
- ✅ [`views/layout.ejs`](file://d:\SISTEMINFORMASI\views\layout.ejs) - Dihapus tombol logout
- ✅ [`views/index.ejs`](file://d:\SISTEMINFORMASI\views\index.ejs) - Dihapus role-based menu

File yang dihapus:
- ❌ `models/User.js`
- ❌ `routes/auth.js`
- ❌ `routes/pengguna.js`
- ❌ `views/auth/` (seluruh direktori)
- ❌ `views/pengguna/` (seluruh direktori)
- ❌ Semua script admin initialization

## ⚠️ Penting

**Aplikasi sekarang TIDAK memiliki sistem login.** Semua orang yang mengakses URL dapat:
- Melihat semua data
- Menambah, mengubah, dan menghapus data

Untuk production, pertimbangkan menambahkan kembali sistem autentikasi atau menggunakan security network-level.

---

**Last Updated:** 2026-04-07
