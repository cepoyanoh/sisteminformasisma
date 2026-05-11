# Solusi Error: SQLITE_ERROR: no such table: nilai

## ❌ Masalah
```
Error fetching nilai: Error: SQLITE_ERROR: no such table: nilai
```

Error ini terjadi karena **tabel `nilai` belum ada di database SQLite**.

## ✅ Solusi yang Sudah Diterapkan

### 1. Memperbaiki Foreign Key di Script Inisialisasi
**File:** [`init_nilai_table.js`](d:\SISTEMINFORMASI\init_nilai_table.js)

**Perubahan:**
- ✅ Mengubah `REFERENCES siswas(id)` menjadi `REFERENCES siswa(id)` 
- ✅ Menambahkan logging yang lebih informatif dengan emoji
- ✅ Menambahkan verifikasi otomatis setelah tabel dibuat
- ✅ Menambahkan timeout untuk memastikan proses selesai

### 2. Menambahkan Script Verifikasi Database
**File Baru:** [`check_nilai_table.js`](d:\SISTEMINFORMASI\check_nilai_table.js)

**Fungsi:**
- Memeriksa semua tabel yang ada di database
- Memverifikasi apakah tabel `nilai` sudah ada
- Menampilkan struktur lengkap tabel (kolom, tipe data, constraints)
- Memberikan instruksi jika tabel belum ada

### 3. Error Handling di Routes
**File:** [`routes/nilai.js`](d:\SISTEMINFORMASI\routes\nilai.js)

**Perbaikan:**
- Menangkap error "no such table" secara spesifik
- Jika tabel belum ada, tetap tampilkan halaman dengan array kosong
- Tidak crash aplikasi, tapi memberikan pesan warning di console
- User masih bisa mengakses halaman lain

## 🚀 Langkah Perbaikan

### Langkah 1: Jalankan Script Inisialisasi

Buka terminal/command prompt dan jalankan:

```bash
cd d:\SISTEMINFORMASI
node init_nilai_table.js
```

**Output yang diharapkan:**
```
🔄 Membuat tabel nilai...
✅ Tabel nilai berhasil dibuat atau sudah ada
✅ Verifikasi berhasil: Tabel nilai ada di database
✅ Proses inisialisasi selesai
```

### Langkah 2: Verifikasi Tabel Sudah Ada

Jalankan script verifikasi:

```bash
node check_nilai_table.js
```

**Output yang diharapkan:**
```
🔍 Memeriksa database...

📋 Tabel yang ada di database:
   1. guru
   2. jurnal_guru
   3. kelas
   4. mata_pelajaran
   5. nilai          ← Harus ada!
   6. siswa
   7. users

✅ Tabel nilai DITEMUKAN

📊 Struktur tabel nilai:
   - id: INTEGER 🔑 PRIMARY KEY
   - siswa_id: INTEGER NOT NULL
   - mapel_id: INTEGER NOT NULL
   - guru_id: INTEGER NOT NULL
   - kelas_id: INTEGER NOT NULL
   - jenis_nilai: VARCHAR(20) NOT NULL
   - kategori: VARCHAR(50) NOT NULL
   - nilai: DECIMAL(5,2) NOT NULL
   - keterangan: TEXT
   - tanggal_penilaian: DATE NOT NULL
   - tahun_ajaran: VARCHAR(20) NOT NULL
   - semester: VARCHAR(10) NOT NULL
   - created_at: DATETIME
   - updated_at: DATETIME

✅ Database siap digunakan!
```

### Langkah 3: Restart Server

Setelah tabel terbuat, restart server:

```bash
npm run dev
```

### Langkah 4: Test Akses Menu

1. Buka browser: `http://localhost:3000`
2. Login dengan akun tata usaha atau guru
3. Klik menu **"Input Nilai"**
4. Halaman daftar nilai harus muncul tanpa error
5. Klik tombol **"Tambah Nilai"**
6. Form input nilai harus muncul

## 🔍 Penjelasan Teknis

### Mengapa Error Terjadi?

1. **Tabel Belum Dibuat**: Saat fitur Input Nilai ditambahkan, tabel `nilai` perlu dibuat secara manual
2. **Script Belum Dijalankan**: File `init_nilai_table.js` harus dijalankan sekali untuk membuat tabel
3. **Foreign Key Salah**: Awalnya menggunakan `siswas` (plural), padahal tabel sebenarnya bernama `siswa` (singular)

### Struktur Tabel Nilai

```sql
CREATE TABLE nilai (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  siswa_id INTEGER NOT NULL,              -- FK ke tabel siswa
  mapel_id INTEGER NOT NULL,              -- FK ke tabel mata_pelajaran
  guru_id INTEGER NOT NULL,               -- FK ke tabel guru
  kelas_id INTEGER NOT NULL,              -- FK ke tabel kelas
  jenis_nilai VARCHAR(20) NOT NULL,       -- 'formatif' atau 'sumatif'
  kategori VARCHAR(50) NOT NULL,          -- UH1, UH2, UTS, UAS, Tugas, dll
  nilai DECIMAL(5,2) NOT NULL,            -- Nilai 0-100
  keterangan TEXT,                        -- Catatan tambahan
  tanggal_penilaian DATE NOT NULL,        -- Tanggal penilaian
  tahun_ajaran VARCHAR(20) NOT NULL,      -- Contoh: 2025/2026
  semester VARCHAR(10) NOT NULL,          -- 'ganjil' atau 'genap'
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (siswa_id) REFERENCES siswa(id) ON DELETE CASCADE,
  FOREIGN KEY (mapel_id) REFERENCES mata_pelajaran(id) ON DELETE CASCADE,
  FOREIGN KEY (guru_id) REFERENCES guru(id) ON DELETE CASCADE,
  FOREIGN KEY (kelas_id) REFERENCES kelas(id) ON DELETE CASCADE
);
```

### Constraints & Validasi

- **CHECK Constraints**:
  - `jenis_nilai`: Hanya boleh 'formatif' atau 'sumatif'
  - `nilai`: Harus antara 0-100
  - `semester`: Hanya boleh 'ganjil' atau 'genap'

- **Foreign Keys**:
  - CASCADE DELETE: Jika data master dihapus, nilai terkait juga terhapus
  - Memastikan integritas data

## ⚠️ Kemungkinan Masalah Lain

### A. Error Masih Muncul Setelah Init

**Penyebab:** Server belum restart atau cache database

**Solusi:**
1. Stop server (Ctrl+C)
2. Jalankan ulang: `npm run dev`
3. Hard refresh browser: Ctrl+Shift+R

### B. Foreign Key Constraint Failed

**Gejala:** Error saat insert/update data nilai

**Penyebab:** Data referensi (siswa/mapel/guru/kelas) tidak ada

**Solusi:** Pastikan data master sudah ada sebelum input nilai

### C. Tabel Ada Tapi Kolom Berbeda

**Gejala:** Error "no such column"

**Penyebab:** Versi lama tabel masih ada

**Solusi:**
```bash
# Hapus database lama (BACKUP dulu!)
# Kemudian jalankan ulang init
node init_nilai_table.js
```

## 📝 Checklist Verifikasi

Gunakan checklist ini untuk memastikan masalah sudah teratasi:

- [ ] Script `init_nilai_table.js` sudah dijalankan
- [ ] Output menunjukkan "Tabel nilai berhasil dibuat"
- [ ] Script `check_nilai_table.js` menunjukkan tabel nilai ada
- [ ] Struktur tabel sesuai (14 kolom)
- [ ] Server sudah di-restart
- [ ] Tidak ada error di console terminal
- [ ] Bisa akses `/nilai` tanpa error
- [ ] Halaman daftar nilai muncul
- [ ] Tombol "Tambah Nilai" bisa diklik
- [ ] Form input nilai muncul
- [ ] Dropdown terisi dengan data

## 🛡️ Pencegahan di Masa Depan

### 1. Auto-Init di app.js

Untuk mencegah masalah ini terulang, tambahkan auto-inisialisasi di [`app.js`](d:\SISTEMINFORMASI\app.js):

```javascript
// Di bagian atas app.js, setelah import models
const initNilaiTable = require('./init_nilai_table');
```

### 2. Migration System

Pertimbangkan untuk menggunakan sistem migration seperti:
- Buat folder `migrations/`
- Setiap perubahan schema buat file baru
- Track versi migration yang sudah dijalankan

### 3. Database Seeder

Buat script seeder untuk data awal:
```javascript
// seed_data.js
const Siswa = require('./models/Siswa');
const Kelas = require('./models/Kelas');
// ... dst

// Insert data dummy untuk testing
```

## 📞 Jika Masih Bermasalah

Jika setelah mengikuti semua langkah di atas error masih muncul, silakan kirimkan:

1. **Output lengkap** dari `node init_nilai_table.js`
2. **Output lengkap** dari `node check_nilai_table.js`
3. **Screenshot** error di browser
4. **Log terminal** saat akses menu Input Nilai
5. **Daftar tabel** yang ada (dari check_nilai_table.js)

Dengan informasi ini, masalah bisa didiagnosa lebih akurat.

## ✨ Summary

**Masalah:** Tabel `nilai` belum ada di database  
**Penyebab:** Script inisialisasi belum dijalankan + foreign key salah  
**Solusi:** 
1. ✅ Perbaiki foreign key di `init_nilai_table.js`
2. ✅ Jalankan `node init_nilai_table.js`
3. ✅ Verifikasi dengan `node check_nilai_table.js`
4. ✅ Restart server
5. ✅ Tambahkan error handling di routes

**Status:** ✅ **SELESAI** - Tabel sudah bisa dibuat dengan benar

# Solusi: Tidak Bisa Menyimpan Inputan Nilai

## Masalah
Setelah menghapus field **Tahun Ajaran** dan **Semester** dari form input nilai, sistem tidak bisa menyimpan data nilai baru.

## Penyebab
Database masih memiliki kolom `tahun_ajaran` dan `semester` dengan constraint `NOT NULL`, tetapi kode aplikasi sudah tidak lagi mengirim nilai untuk kolom-kolom tersebut saat INSERT.

## Solusi yang Diterapkan

### 1. Migrasi Database
File `init_nilai_table.js` telah diupdate untuk melakukan migrasi database:
- ✅ Membuat tabel baru tanpa kolom `tahun_ajaran` dan `semester`
- ✅ Memindahkan data existing ke tabel baru
- ✅ Menghapus tabel lama dan mengganti dengan tabel baru
- ✅ Mempertahankan semua foreign key constraints

### 2. Update Model (models/Nilai.js)
- ✅ Method `create()`: Hapus `tahun_ajaran` dan `semester` dari INSERT query
- ✅ Method `update()`: Hapus `tahun_ajaran` dan `semester` dari UPDATE query
- ✅ Method `getAll()`: Hapus filter untuk `tahun_ajaran` dan `semester`
- ✅ Method `getRataRata()`: Hapus filter untuk `tahun_ajaran` dan `semester`
- ✅ Method `getByKelasAndMapel()`: Hapus filter untuk `tahun_ajaran` dan `semester`

### 3. Update Routes (routes/nilai.js)
- ✅ POST `/nilai`: Hapus validasi dan handling untuk `tahun_ajaran` dan `semester`
- ✅ PUT `/nilai/:id`: Hapus validasi dan handling untuk `tahun_ajaran` dan `semester`
- ✅ GET `/nilai`: Hapus filter query parameters untuk `tahun_ajaran` dan `semester`

### 4. Update Views
- ✅ `views/nilai/create.ejs`: Hapus input fields untuk `tahun_ajaran` dan `semester`
- ✅ `views/nilai/edit.ejs`: Hapus input fields untuk `tahun_ajaran` dan `semester`
- ✅ `views/nilai/index.ejs`: Hapus filter dropdown untuk `tahun_ajaran` dan `semester`

## Cara Menjalankan Migrasi

Jika belum menjalankan migrasi, jalankan perintah berikut:

```bash
node init_nilai_table.js
```

Script ini akan:
1. Cek struktur tabel saat ini
2. Buat tabel baru tanpa kolom `tahun_ajaran` dan `semester`
3. Pindahkan semua data existing
4. Hapus tabel lama
5. Verifikasi migrasi berhasil

## Testing

Untuk memverifikasi bahwa fitur input nilai sudah berfungsi:

```bash
node check_nilai_table.js
```

Script ini akan:
1. Cek struktur tabel nilai
2. Coba insert data test
3. Verifikasi data berhasil disimpan
4. Clean up data test
5. Laporkan hasil test

## Struktur Tabel Nilai (Setelah Migrasi)

```
CREATE TABLE nilai (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  siswa_id INTEGER NOT NULL,
  mapel_id INTEGER NOT NULL,
  guru_id INTEGER NOT NULL,
  kelas_id INTEGER NOT NULL,
  jenis_nilai VARCHAR(20) NOT NULL CHECK(jenis_nilai IN ('formatif', 'sumatif')),
  kategori VARCHAR(50) NOT NULL,
  nilai DECIMAL(5,2) NOT NULL CHECK(nilai >= 0 AND nilai <= 100),
  keterangan TEXT,
  tanggal_penilaian DATE NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (siswa_id) REFERENCES siswa(id) ON DELETE CASCADE,
  FOREIGN KEY (mapel_id) REFERENCES mata_pelajaran(id) ON DELETE CASCADE,
  FOREIGN KEY (guru_id) REFERENCES guru(id) ON DELETE CASCADE,
  FOREIGN KEY (kelas_id) REFERENCES kelas(id) ON DELETE CASCADE
)
```

## Field yang Tersisa di Form Input Nilai

1. **Siswa** - Dropdown pilihan siswa
2. **Kelas** - Dropdown pilihan kelas
3. **Mata Pelajaran** - Dropdown pilihan mapel
4. **Guru** - Dropdown pilihan guru (otomatis jika login sebagai guru)
5. **Jenis Nilai** - Formatif / Sumatif
6. **Kategori** - UH1, UH2, UTS, UAS, Tugas, dll
7. **Nilai** - Angka 0-100
8. **Tanggal Penilaian** - Date picker
9. **Keterangan** - Text area opsional

## Troubleshooting

### Jika masih error saat menyimpan:

1. **Cek apakah migrasi sudah dijalankan:**
   ```bash
   node init_nilai_table.js
   ```

2. **Cek console log untuk error message:**
   - Buka browser developer tools (F12)
   - Lihat tab Console dan Network
   - Cek error message yang muncul

3. **Pastikan data referensi ada:**
   - Minimal harus ada 1 siswa
   - Minimal harus ada 1 mata pelajaran
   - Minimal harus ada 1 guru
   - Minimal harus ada 1 kelas

4. **Cek file log server:**
   - Lihat output di terminal tempat server berjalan
   - Cari error message terkait database

### Jika form tidak muncul:

1. Restart server:
   ```bash
   npm run dev
   ```

2. Clear browser cache (Ctrl+Shift+Delete)

3. Akses langsung URL: `http://localhost:3000/nilai/create`

## Catatan Penting

⚠️ **Backup Database**: Sebelum melakukan migrasi, backup file `database.db` untuk mencegah kehilangan data.

✅ **Data Aman**: Script migrasi dirancang untuk mempertahankan semua data existing, hanya menghapus kolom yang tidak diperlukan.

🔄 **Idempotent**: Script migrasi bisa dijalankan berkali-kali tanpa merusak data. Script akan mendeteksi apakah migrasi sudah dilakukan sebelumnya.

## Verifikasi Berhasil

Setelah migrasi, Anda seharusnya bisa:
- ✅ Membuka halaman input nilai tanpa error
- ✅ Mengisi form tanpa field tahun ajaran dan semester
- ✅ Menyimpan data nilai baru dengan sukses
- ✅ Melihat data nilai di halaman daftar nilai
- ✅ Mengedit dan menghapus data nilai

---

**Terakhir diupdate**: 2026-04-06
**Status**: ✅ Selesai dan siap digunakan
