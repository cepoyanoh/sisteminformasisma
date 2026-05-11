# Troubleshooting - Menu Input Nilai Tidak Muncul

## Masalah yang Diperbaiki

### 1. ✅ Nama Tabel Salah di Model Nilai
**Masalah:** Model Nilai menggunakan nama tabel `siswas` (plural), padahal tabel yang benar adalah `siswa` (singular).

**Solusi:** Telah diperbaiki di semua query SQL dalam file `models/Nilai.js`:
- Method `getAll()`
- Method `getById()`
- Method `getByKelasAndMapel()`

### 2. ✅ Middleware Otorisasi Guru
**Masalah:** Role guru memiliki akses ke `/users` yang seharusnya hanya untuk tata usaha.

**Solusi:** Dihapus akses `/users` dari role guru di `app.js`.

### 3. ✅ Redirect Dashboard Guru
**Masalah:** Guru langsung di-redirect ke `/jurnal` sehingga tidak bisa melihat dashboard dan menu Input Nilai.

**Solusi:** Guru sekarang diarahkan ke dashboard (`/`) yang menampilkan semua menu termasuk Input Nilai.

## Langkah Verifikasi

### 1. Pastikan Server Berjalan
```bash
npm run dev
```

Server harus berjalan di `http://localhost:3000`

### 2. Cek Tabel Nilai di Database
Pastikan tabel `nilai` sudah ada dengan menjalankan:
```bash
node init_nilai_table.js
```

Harus muncul pesan: "Tabel nilai berhasil dibuat atau sudah ada"

### 3. Login dan Akses Dashboard

#### Untuk Tata Usaha:
1. Buka `http://localhost:3000`
2. Login dengan akun tata usaha
3. Di dashboard, harus muncul:
   - **Card Statistik** "Nilai" dengan jumlah total nilai
   - **Menu Card** "Input Nilai" (ikon clipboard merah)
   - **Link di List Fitur** "Input Nilai"

#### Untuk Guru:
1. Buka `http://localhost:3000`
2. Login dengan akun guru
3. Sekarang guru akan melihat dashboard (tidak langsung redirect ke jurnal)
4. Di dashboard, harus muncul menu "Input Nilai"

### 4. Akses Langsung URL
Coba akses langsung: `http://localhost:3000/nilai`

Jika berhasil, akan muncul halaman daftar nilai dengan filter.

## Kemungkinan Masalah Lain

### A. Tabel Nilai Belum Ada
**Gejala:** Error saat mengakses /nilai atau statistik totalNilai error

**Solusi:**
```bash
node init_nilai_table.js
```

### B. Data Master Belum Ada
**Gejala:** Form input nilai tidak bisa submit karena dropdown kosong

**Solusi:** Pastikan data berikut sudah ada:
- Data Siswa (`/siswa`)
- Data Mata Pelajaran (`/mapel`)
- Data Guru (`/guru`)
- Data Kelas (`/kelas`)

### C. Session/Cookie Issue
**Gejala:** Terus-menerus redirect ke login

**Solusi:**
1. Clear browser cache dan cookies
2. Restart server
3. Login ulang

### D. Port Sudah Digunakan
**Gejala:** Error "Port 3000 already in use"

**Solusi:**
```bash
# Windows - cari process yang menggunakan port 3000
netstat -ano | findstr :3000

# Kill process tersebut (ganti PID dengan nomor yang muncul)
taskkill /PID <PID> /F

# Atau gunakan port lain dengan set environment variable
$env:PORT=3001
npm run dev
```

## Struktur File yang Benar

Pastikan file-file berikut ada:

```
d:\SISTEMINFORMASI\
├── models\
│   └── Nilai.js              ✅ Model nilai (sudah diperbaiki)
├── routes\
│   └── nilai.js              ✅ Routes CRUD nilai
├── views\
│   ├── index.ejs             ✅ Dashboard (sudah ditambahkan menu)
│   └── nilai\
│       ├── index.ejs         ✅ Halaman daftar nilai
│       ├── create.ejs        ✅ Form tambah nilai
│       └── edit.ejs          ✅ Form edit nilai
├── app.js                    ✅ Sudah update middleware & routes
└── init_nilai_table.js       ✅ Script inisialisasi tabel
```

## Checklist Verifikasi

- [ ] Server berjalan tanpa error
- [ ] Tabel `nilai` ada di database
- [ ] Bisa login sebagai tata usaha
- [ ] Dashboard menampilkan card statistik "Nilai"
- [ ] Dashboard menampilkan menu card "Input Nilai"
- [ ] Dashboard menampilkan link "Input Nilai" di list fitur
- [ ] Klik menu "Input Nilai" membuka halaman `/nilai`
- [ ] Halaman daftar nilai muncul dengan filter
- [ ] Tombol "Tambah Nilai" berfungsi
- [ ] Form tambah nilai muncul dengan dropdown terisi
- [ ] Bisa menyimpan nilai baru
- [ ] Bisa mengedit nilai
- [ ] Bisa menghapus nilai
- [ ] Login sebagai guru juga bisa akses menu Input Nilai

## Debugging Console

Jika masih bermasalah, periksa console browser (F12 → Console):

1. **Error 404**: Routes tidak terdaftar → restart server
2. **Error 500**: Query SQL error → cek nama tabel di model
3. **Blank page**: View file hilang → cek folder `views/nilai/`
4. **Redirect loop**: Session issue → clear cookies

## Log Server

Periksa output terminal saat menjalankan `npm run dev`:

```
✅ Seharusnya muncul:
- "Server berjalan di http://localhost:3000"
- "Tabel nilai berhasil dibuat atau sudah ada"

❌ Jika ada error:
- Catat pesan error lengkapnya
- Periksa stack trace untuk lokasi error
```

## Kontak Support

Jika masalah masih berlanjut setelah mengikuti langkah-langkah di atas, silakan catat:
1. Pesan error lengkap dari console
2. Screenshot halaman yang bermasalah
3. Output dari terminal/server log
4. Browser yang digunakan
