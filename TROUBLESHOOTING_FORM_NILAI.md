# Troubleshooting - Form Input Nilai Tidak Muncul

## Masalah
Ketika menekan menu "Input Nilai", halaman menampilkan daftar nilai tetapi tombol "Tambah Nilai" tidak membuka form input.

## Solusi yang Sudah Diterapkan

### 1. ✅ Menambahkan Console Logging untuk Debugging
File `routes/nilai.js` telah ditambahkan logging untuk membantu melacak masalah:
- Logging saat mengakses route `/nilai`
- Logging saat mengakses route `/nilai/create`
- Logging untuk setiap data yang dimuat (siswa, mapel, guru, kelas)
- Logging error detail jika terjadi masalah

### 2. ✅ Memastikan Routes Terdaftar dengan Benar
- Route `GET /nilai` → Menampilkan daftar nilai
- Route `GET /nilai/create` → Menampilkan form tambah nilai
- Route `POST /nilai` → Menyimpan nilai baru

## Langkah Diagnosa

### Langkah 1: Buka Browser Console
1. Buka browser (Chrome/Firefox/Edge)
2. Tekan **F12** untuk membuka Developer Tools
3. Pilih tab **Console**
4. Klik menu "Input Nilai" di dashboard
5. Klik tombol "Tambah Nilai"
6. Perhatikan apakah ada error merah di console

### Langkah 2: Periksa Server Log
1. Lihat terminal/command prompt tempat server berjalan
2. Setelah klik "Tambah Nilai", harus muncul log:
   ```
   Accessing /nilai/create route
   Siswa loaded: X records
   Mapel loaded: X records
   Guru loaded: X records
   Kelas loaded: X records
   All data loaded successfully, rendering view
   View rendered successfully
   ```

3. Jika ada error, akan muncul pesan error detail

### Langkah 3: Cek URL
Pastikan URL di browser berubah menjadi:
```
http://localhost:3000/nilai/create
```

Jika URL tetap di `/nilai`, berarti link tidak berfungsi.

## Kemungkinan Penyebab & Solusi

### A. Data Master Belum Ada ⚠️ PALING SERING
**Gejala:** 
- Form tidak muncul atau error "Cannot read property of undefined"
- Dropdown kosong

**Solusi:**
Pastikan data berikut sudah ada:
```bash
# Akses masing-masing menu dan tambahkan minimal 1 data
1. Data Kelas (/kelas)
2. Data Mata Pelajaran (/mapel)
3. Data Guru (/guru)
4. Data Siswa (/siswa)
```

### B. Tabel Nilai Belum Dibuat
**Gejala:**
- Error SQL "table nilai does not exist"
- Halaman error 500

**Solusi:**
```bash
node init_nilai_table.js
```

Harus muncul: "Tabel nilai berhasil dibuat atau sudah ada"

### C. Session Expired
**Gejala:**
- Redirect ke halaman login
- Error 401 atau 403

**Solusi:**
1. Logout
2. Login kembali
3. Coba akses menu Input Nilai lagi

### D. Browser Cache
**Gejala:**
- Halaman tidak update setelah perubahan code
- Masih menggunakan versi lama

**Solusi:**
1. Hard refresh: **Ctrl + Shift + R** (Windows) atau **Cmd + Shift + R** (Mac)
2. Atau clear cache browser
3. Restart browser

### E. Port Conflict
**Gejala:**
- Server tidak bisa start
- Error "Port 3000 already in use"

**Solusi:**
```bash
# Windows - cari process di port 3000
netstat -ano | findstr :3000

# Kill process (ganti PID dengan nomor yang muncul)
taskkill /PID <PID> /F

# Restart server
npm run dev
```

### F. Dependencies Missing
**Gejala:**
- Error "Cannot find module"
- Module not found

**Solusi:**
```bash
npm install
```

## Verifikasi Step-by-Step

### 1. Test Akses Langsung
Buka browser dan ketik langsung:
```
http://localhost:3000/nilai/create
```

**Expected:** Form tambah nilai muncul  
**Jika Error:** Catat pesan errornya

### 2. Test via Menu
1. Login ke sistem
2. Klik menu "Input Nilai" di dashboard
3. Halaman daftar nilai harus muncul
4. Klik tombol "Tambah Nilai" (biru, pojok kanan atas)
5. Form harus muncul

### 3. Test Submit Form
Jika form muncul, coba isi:
- Pilih Siswa
- Pilih Kelas
- Pilih Mata Pelajaran
- Pilih Guru (atau otomatis jika login sebagai guru)
- Pilih Jenis Nilai (Formatif/Sumatif)
- Isi Kategori (contoh: UH1)
- Isi Nilai (contoh: 85)
- Pilih Tanggal
- Isi Tahun Ajaran (contoh: 2025/2026)
- Pilih Semester
- Klik "Simpan Nilai"

**Expected:** Redirect ke halaman daftar nilai dengan pesan sukses

## Error Umum & Solusi

### Error: "Cannot GET /nilai/create"
**Penyebab:** Routes tidak terdaftar  
**Solusi:** 
1. Pastikan file `routes/nilai.js` ada
2. Pastikan di `app.js` ada: `app.use('/nilai', nilaiRoutes);`
3. Restart server

### Error: "Table nilai does not exist"
**Penyebab:** Tabel belum dibuat  
**Solusi:**
```bash
node init_nilai_table.js
```

### Error: "Cannot read property 'length' of undefined"
**Penyebab:** Data master (siswa/mapel/guru/kelas) belum ada  
**Solusi:** Tambahkan data master terlebih dahulu

### Error: "Access Denied" atau "Forbidden"
**Penyebab:** User tidak memiliki akses  
**Solusi:** 
- Pastikan login sebagai 'tata_usaha' atau 'guru'
- Cek middleware otorisasi di `app.js`

### Blank Page / White Screen
**Penyebab:** View file error atau missing  
**Solusi:**
1. Pastikan file `views/nilai/create.ejs` ada
2. Pastikan syntax EJS benar
3. Cek console browser untuk error JavaScript

## Checklist Lengkap

Gunakan checklist ini untuk memastikan semua sudah benar:

- [ ] Server berjalan tanpa error (`npm run dev`)
- [ ] Tabel `nilai` sudah dibuat (`node init_nilai_table.js`)
- [ ] Data Kelas sudah ada (minimal 1)
- [ ] Data Mata Pelajaran sudah ada (minimal 1)
- [ ] Data Guru sudah ada (minimal 1)
- [ ] Data Siswa sudah ada (minimal 1)
- [ ] Bisa login ke sistem
- [ ] Menu "Input Nilai" muncul di dashboard
- [ ] Klik menu membuka halaman `/nilai`
- [ ] Tombol "Tambah Nilai" ada dan bisa diklik
- [ ] Klik tombol membuka halaman `/nilai/create`
- [ ] Form tampil dengan semua dropdown terisi
- [ ] Bisa memilih siswa dari dropdown
- [ ] Bisa memilih kelas dari dropdown
- [ ] Bisa memilih mata pelajaran dari dropdown
- [ ] Bisa memilih guru dari dropdown
- [ ] Form bisa disubmit
- [ ] Data tersimpan ke database
- [ ] Redirect ke halaman daftar nilai setelah submit
- [ ] Pesan sukses muncul

## Debug Mode Aktif

Server sekarang dalam mode debug dengan logging aktif. Setiap kali Anda mengakses route nilai, akan muncul log di terminal. 

**Cara membaca log:**
```
✅ Normal flow:
Accessing /nilai route
Filters applied: {}
Siswa loaded: 10 records
...
View rendered successfully

❌ Error flow:
Accessing /nilai/create route
Error getting siswa: [error message]
Error loading form: [error details]
```

## Jika Masih Bermasalah

Silakan kirimkan informasi berikut:

1. **Screenshot error** di browser console (F12 → Console)
2. **Output terminal** saat klik "Tambah Nilai"
3. **URL** yang muncul di browser
4. **Browser** yang digunakan (Chrome/Firefox/Edge, versi berapa)
5. **Role user** yang login (tata_usaha atau guru)
6. **Apakah data master sudah ada?** (siswa, mapel, guru, kelas)

Dengan informasi ini, masalah bisa didiagnosa lebih akurat.
