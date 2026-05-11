# Troubleshooting: Data Siswa Import Excel Tidak Masuk Database

## Tanggal Update
**2026-04-07** - Added detailed logging for debugging

## Masalah
Setelah import file Excel, data siswa tidak muncul di database atau halaman /siswa.

## Kemungkinan Penyebab & Solusi

### 1. ✅ Validasi Duplikasi Memblokir Import

**Gejala:**
- Muncul pesan error merah: "Import dibatalkan! Ditemukan duplikasi..."
- Tidak ada data yang tersimpan

**Penyebab:**
- Nama siswa dalam file Excel sama persis (case-insensitive) dengan yang sudah ada di database
- Ada nama yang muncul lebih dari 1x dalam file yang sama

**Solusi:**
```
1. Buka file Excel
2. Cek kolom "Nama" untuk duplikasi
3. Hapus atau ubah nama yang duplikat
4. Upload ulang
```

**Contoh Duplikasi:**
```
❌ SALAH (Duplikasi):
Baris 2: Ahmad Fauzi
Baris 5: ahmad fauzi  ← Sama (case-insensitive)

✅ BENAR:
Baris 2: Ahmad Fauzi
Baris 5: Ahmad Faisal  ← Berbeda
```

---

### 2. ✅ Format Kolom Excel Tidak Sesuai

**Gejala:**
- Semua baris gagal dengan pesan "Nama siswa tidak boleh kosong"
- Atau data masuk tapi field-field kosong

**Penyebab:**
- Header kolom di Excel tidak sesuai template
- Sistem tidak bisa mapping kolom ke field database

**Solusi:**
```
1. Download template dari /siswa/template
2. Pastikan header kolom EXACT match:
   - NIS (atau nis, Nis)
   - NISN (atau nisn, Nisn)
   - Nama (atau nama, Nama Siswa, NAMA SISWA)
   - Jenis Kelamin (atau jenis kelamin, JK, jk)
   - Tempat Lahir
   - Tanggal Lahir
   - Alamat
   - No Telepon (atau no telepon, Telepon, telepon)
   - Kelas
   - Tahun Ajaran
   - Status
```

**Template Header yang Benar:**
```
| NIS | NISN | Nama | Jenis Kelamin | Tempat Lahir | Tanggal Lahir | Alamat | No Telepon | Kelas | Tahun Ajaran | Status |
```

---

### 3. ✅ Nama Kelas Tidak Match dengan Database

**Gejala:**
- Data masuk tapi `kelas_id` NULL
- Pesan warning: "Kelas 'X' tidak ditemukan di database"

**Penyebab:**
- Nama kelas di Excel berbeda dengan yang ada di database
- Case-sensitive mismatch

**Solusi:**
```
1. Cek nama kelas yang ada di database:
   - Buka /kelas
   - Lihat daftar nama kelas yang valid

2. Pastikan nama di Excel SAMA PERSIS:
   ❌ "11A", "11 a", "XI-A"
   ✅ "11 A" (sesuai database)

3. Update file Excel dan upload ulang
```

**Mapping Kelas:**
```javascript
// Sistem melakukan uppercase + trim
"11 a" → "11 A"
"11A"  → "11A"  ← Mungkin tidak match!
"XI-A" → "XI-A" ← Tidak match jika database "11 A"
```

---

### 4. ✅ File Excel Kosong atau Rusak

**Gejala:**
- Pesan error: "File Excel kosong atau format tidak sesuai"

**Penyebab:**
- Sheet Excel tidak ada data
- Format file bukan .xlsx atau .xls
- File corrupt

**Solusi:**
```
1. Buka file Excel
2. Pastikan ada data di sheet pertama
3. Save As → Excel Workbook (.xlsx)
4. Upload ulang
```

---

### 5. ✅ Error Saat Insert ke Database

**Gejala:**
- Beberapa baris berhasil, beberapa gagal
- Pesan: "Gagal menyimpan data - [error message]"

**Kemungkinan Error:**

**A. UNIQUE Constraint (NIS/NISN duplikat):**
```
Error: UNIQUE constraint failed: siswa.nis
Solusi: Pastikan NIS unik untuk setiap siswa
```

**B. Foreign Key Constraint:**
```
Error: FOREIGN KEY constraint failed
Solusi: Pastikan kelas_id valid atau NULL
```

**C. NOT NULL Constraint:**
```
Error: NOT NULL constraint failed: siswa.nama_siswa
Solusi: Pastikan field wajib terisi
```

---

### 6. ✅ Callback Tidak Dipanggil (Bug Code)

**Gejala:**
- Tidak ada pesan sukses/error
- Halaman tidak redirect
- Console log tidak muncul

**Penyebab:**
- Bug dalam kode route (sudah diperbaiki dengan logging)

**Solusi:**
```bash
1. Restart server: .\restart.bat
2. Coba import lagi
3. Cek console log untuk detail
```

---

## 🔍 Cara Debugging dengan Logging Baru

### Langkah-langkah:

**1. Buka Terminal/Console Server**
```bash
# Jalankan server
npm start

# Atau restart
.\restart.bat
```

**2. Lakukan Import**
```
1. Buka http://localhost:3000/siswa/import
2. Pilih file Excel
3. Klik "Import Data"
```

**3. Perhatikan Console Log**

**Log Normal (Berhasil):**
```
📥 Mulai proses import Excel...
📄 File: data_siswa.xlsx
📍 Path: C:\...\uploads\xxx.xlsx
📊 Total baris data: 25
✅ Data existing loaded: 100 siswa
✅ Tidak ada duplikasi dalam file
✅ Tidak ada duplikasi dengan database
🚀 Memulai proses insert ke database...
✅ Data kelas loaded: 10 kelas
🗺️ Kelas map: 10 entries
💾 Menyimpan baris 2: Ahmad Fauzi (Kelas: 11 A)
✅ Baris 2 BERHASIL (ID: 101)
💾 Menyimpan baris 3: Siti Nurhaliza (Kelas: 11 B)
✅ Baris 3 BERHASIL (ID: 102)
...
📊 ===== IMPORT SELESAI =====
✅ Berhasil: 25
❌ Gagal: 0
📝 Total: 25
```

**Log dengan Error:**
```
📥 Mulai proses import Excel...
📄 File: data_siswa.xlsx
📍 Path: C:\...\uploads\xxx.xlsx
📊 Total baris data: 25
✅ Data existing loaded: 100 siswa
❌ Ditemukan duplikasi dalam file: 2
[Redirect ke /siswa/import dengan error]
```

**Log dengan Warning:**
```
💾 Menyimpan baris 5: Budi Santoso (Kelas: 11 X)
⚠️ Baris 5: Kelas "11 X" tidak ditemukan di database
✅ Baris 5 BERHASIL (ID: 105)
[Tapi kelas_id = NULL]
```

**Log dengan Fatal Error:**
```
📥 Mulai proses import Excel...
❌ FATAL ERROR saat import: Error: ENOENT: no such file...
[Redirect ke /siswa/import dengan error]
```

---

## 🧪 Testing Checklist

### Test 1: Import Bersih (No Errors)
```
✅ File Excel valid dengan 5 siswa baru
✅ Tidak ada duplikasi
✅ Semua kelas match dengan database
Expected:
  - Console: 5x "BERHASIL"
  - Flash: "Berhasil mengimport 5 data siswa"
  - Database: 5 record baru
```

### Test 2: Duplikasi dalam File
```
✅ File dengan nama sama muncul 2x
Expected:
  - Console: "Ditemukan duplikasi dalam file: 1"
  - Flash: "Import dibatalkan! Ditemukan duplikasi..."
  - Database: 0 record baru
```

### Test 3: Duplikasi dengan Database
```
✅ File dengan nama yang sudah ada di DB
Expected:
  - Console: "Ditemukan duplikasi dengan database: 1"
  - Flash: "Import dibatalkan! Ditemukan nama siswa yang sudah ada"
  - Database: 0 record baru
```

### Test 4: Kelas Tidak Match
```
✅ File dengan nama kelas yang tidak ada
Expected:
  - Console: "Kelas 'X' tidak ditemukan di database"
  - Data masuk tapi kelas_id = NULL
  - Flash: "Import selesai: 5 berhasil, 0 gagal" (warning)
```

### Test 5: Field Kosong
```
✅ File dengan kolom Nama kosong
Expected:
  - Console: "Baris X: Nama kosong"
  - Flash: "Import selesai: 4 berhasil, 1 gagal"
  - Database: 4 record baru (yang kosong skip)
```

---

## 🛠️ Quick Fixes

### Fix 1: Hapus Duplikasi Manual
```sql
-- Cek duplikasi di database
SELECT nama_siswa, COUNT(*) as count
FROM siswa
GROUP BY nama_siswa
HAVING count > 1;

-- Hapus duplikat (hati-hati!)
DELETE FROM siswa WHERE id = [id_duplikat];
```

### Fix 2: Tambah Kelas yang Hilang
```
1. Buka /kelas/tambah
2. Tambah kelas yang diperlukan (misal: "11 X")
3. Upload ulang file Excel
```

### Fix 3: Bersihkan Data Lama
```sql
-- Backup dulu!
-- Hapus semua siswa (jika mau fresh start)
DELETE FROM siswa;

-- Reset autoincrement
DELETE FROM sqlite_sequence WHERE name='siswa';
```

### Fix 4: Perbaiki Format Excel
```
1. Download template terbaru: /siswa/template
2. Copy-paste data ke template
3. Pastikan header match
4. Save dan upload ulang
```

---

## 📊 Monitoring Import

### Check Database Setelah Import:
```sql
-- Cek total siswa
SELECT COUNT(*) as total FROM siswa;

-- Cek per kelas
SELECT k.nama_kelas, COUNT(s.id) as jumlah
FROM kelas k
LEFT JOIN siswa s ON k.id = s.kelas_id
GROUP BY k.id, k.nama_kelas
ORDER BY k.nama_kelas;

-- Cek siswa tanpa kelas
SELECT * FROM siswa WHERE kelas_id IS NULL;

-- Cek duplikasi nama
SELECT nama_siswa, COUNT(*) as count
FROM siswa
GROUP BY nama_siswa
HAVING count > 1;
```

---

## 🚨 Common Pitfalls

### 1. Spasi Tersembunyi
```
❌ "Ahmad Fauzi " (spasi di akhir)
✅ "Ahmad Fauzi"

Sistem otomatis trim, tapi lebih baik bersih dari awal
```

### 2. Format Tanggal
```
❌ "15/01/2005" (DD/MM/YYYY)
❌ "January 15, 2005" (text)
✅ "2005-01-15" (YYYY-MM-DD)
✅ Excel date format (otomatis convert)
```

### 3. Jenis Kelamin
```
❌ "Male", "Female"
❌ "Cowok", "Cewek"
✅ "L" atau "Laki-laki" atau "LAKI-LAKI"
✅ "P" atau "Perempuan" atau "PEREMPUAN"

Sistem otomatis normalisasi, tapi gunakan format standar
```

### 4. Status
```
❌ "Active", "Inactive"
✅ "aktif"
✅ "non-aktif" atau "non aktif"
✅ "lulus"
```

---

## 💡 Best Practices

### 1. Selalu Gunakan Template
```
✅ Download template dari /siswa/template
✅ Jangan buat file dari nol
✅ Copy-paste data ke template
```

### 2. Validasi Sebelum Upload
```
✅ Cek duplikasi manual di Excel (Conditional Formatting)
✅ Cek nama kelas match dengan database
✅ Cek format tanggal YYYY-MM-DD
✅ Cek NIS unik
```

### 3. Import Bertahap
```
✅ Untuk data banyak (>100), pecah jadi beberapa file
✅ Import batch kecil dulu untuk test
✅ Verifikasi hasil sebelum lanjut
```

### 4. Backup Database
```
✅ Backup sebelum import besar
✅ Simpan file Excel sebagai backup
✅ Catat jumlah record sebelum/sesudah
```

---

## 📞 Support

Jika masih mengalami masalah setelah mengikuti troubleshooting ini:

**1. Cek Console Log Lengkap**
```bash
# Copy semua log dari:
📥 Mulai proses import Excel...
sampai:
📊 ===== IMPORT SELESAI =====
```

**2. Screenshot Error**
- Screenshot flash message di browser
- Screenshot console log di terminal

**3. Share File Excel**
- Sample file yang digunakan (bisa anonymize data sensitif)
- Pastikan format header terlihat

**4. Informasi Tambahan**
- Jumlah baris data
- Versi Excel yang digunakan
- OS (Windows/Mac/Linux)

---

## 📝 Changelog

**2026-04-07:**
- ✅ Added detailed console logging untuk debugging
- ✅ Track setiap tahap import (validation, mapping, insert)
- ✅ Log success/failure per baris
- ✅ Summary statistics di akhir import
- ✅ Warning untuk kelas yang tidak match

**Previous:**
- Basic validation (duplicate check)
- Simple success/failure messages
- No detailed logging

---

**Status:** ✅ Enhanced with comprehensive logging  
**Debug Level:** Detailed (every step logged)  
**User Impact:** Easier troubleshooting and faster issue resolution
