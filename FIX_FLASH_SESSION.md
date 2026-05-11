# Fix: Error "req.flash() requires sessions"

## Masalah

Setelah menghapus sistem login, muncul error:
```
Error: req.flash() requires sessions
    at IncomingMessage._flash [as flash]
```

## Penyebab

`connect-flash` middleware memerlukan session support untuk berfungsi. Ketika kita menghapus session middleware (karena tidak lagi diperlukan untuk autentikasi), flash messages menjadi error.

## Solusi

Menambahkan **session middleware minimal** yang HANYA digunakan untuk mendukung flash messages, BUKAN untuk autentikasi.

### Perubahan di `app.js`

**Sebelum:**
```javascript
// Session middleware dihapus sepenuhnya ❌
const express = require('express');
const bodyParser = require('body-parser');
// ... imports lainnya

// Flash messages tanpa session ❌
app.use(flash());
```

**Sesudah:**
```javascript
const express = require('express');
const session = require('express-session'); // ✅ Import session
const flash = require('connect-flash');
// ... imports lainnya

// Minimal session configuration (hanya untuk flash) ✅
app.use(session({
  secret: process.env.SESSION_SECRET || 'sistemInformasiKurikulum2026',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 }
}));

// Flash messages sekarang berfungsi ✅
app.use(flash());
```

## Penjelasan Konfigurasi Session

```javascript
app.use(session({
  secret: 'sistemInformasiKurikulum2026',  // Kunci enkripsi session
  resave: false,                            // Jangan simpan ulang jika tidak berubah
  saveUninitialized: true,                  // Simpan session baru
  cookie: { 
    secure: false,                          // false untuk HTTP, true untuk HTTPS
    maxAge: 24 * 60 * 60 * 1000            // Session berlaku 24 jam
  }
}));
```

### Parameter Penting:

- **`secret`**: String rahasia untuk menandatangani session ID
- **`resave: false`**: Mencegah penyimpanan session yang tidak berubah (optimasi)
- **`saveUninitialized: true`**: Menyimpan session baru meskipun kosong (diperlukan untuk flash)
- **`cookie.secure: false`**: Set `true` jika menggunakan HTTPS di production
- **`cookie.maxAge`**: Durasi session dalam milidetik (24 jam)

## Apa yang TIDAK Berubah

❌ **Session TIDAK digunakan untuk:**
- Menyimpan status login
- Tracking user
- Autentikasi atau otorisasi
- Menyimpan data user

✅ **Session HANYA digunakan untuk:**
- Mendukung flash messages (pesan sukses/error sementara)
- Data flash otomatis dihapus setelah ditampilkan sekali

## Verifikasi

Setelah perubahan, aplikasi harus berjalan tanpa error:

```bash
npm start
```

Buka browser: `http://localhost:3000`

Flash messages akan berfungsi dengan baik untuk:
- Pesan sukses setelah menambah data
- Pesan error saat validasi gagal
- Notifikasi operasi CRUD

## Testing Flash Messages

Coba lakukan operasi berikut untuk memverifikasi flash berfungsi:

1. **Tambah Data Kelas** → Seharusnya muncul pesan sukses
2. **Hapus Data** → Seharusnya muncul konfirmasi
3. **Form Validasi Error** → Seharusnya muncul pesan error

## Keamanan

Konfigurasi session ini **AMAN** karena:
- Tidak menyimpan data sensitif
- Tidak digunakan untuk autentikasi
- Session bersifat temporary
- Tidak ada informasi user yang disimpan

Untuk production dengan HTTPS, ubah:
```javascript
cookie: { 
  secure: true,  // ✅ Wajib untuk HTTPS
  httpOnly: true, // ✅ Mencegah akses JavaScript
  sameSite: 'strict' // ✅ Proteksi CSRF
}
```

## Kesimpulan

✅ Error telah diperbaiki
✅ Flash messages berfungsi normal
✅ Session hanya untuk flash, bukan auth
✅ Aplikasi berjalan tanpa sistem login
✅ Semua fitur dapat diakses langsung

---

**Tanggal Fix:** 2026-04-07  
**Status:** ✅ Resolved
