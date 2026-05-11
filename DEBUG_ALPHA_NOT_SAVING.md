# Debug Guide: Status Alpha Tidak Tersimpan

## Masalah
Anda sudah mengklik tombol Alpha dan submit form, tetapi status alpha tidak tersimpan di database.

## Solusi: Langkah Debugging Bertahap

### Step 1: Cek Browser Console (Client-Side)

1. Buka halaman **Input Absensi**
2. Tekan **F12** untuk membuka DevTools
3. Pilih tab **Console**
4. Klik tombol **Alpha** untuk beberapa siswa

**Yang Harus Muncul di Console:**
```
📝 Hidden input updated for student 123: alpha
✅ Student 123 status changed to: alpha
```

**Jika Tidak Muncul:**
- ❌ Fungsi `setStatus()` tidak terpanggil
- ️ Tombol Alpha mungkin tidak memiliki `onclick="setStatus(this)"`
-  Refresh halaman (Ctrl+F5)

5. Klik **Simpan Absensi**

**Yang Harus Muncul:**
```
🚀 ===== FORM SUBMIT START =====
📋 Processing 62 rows...
   🔴 Row 5: Student 123 (NAMA SISWA) - Status: alpha

📤 Data yang akan dikirim:
[
  {
    "siswa_id": "123",
    "status_kehadiran": "alpha",
    "keterangan": ""
  },
  ...
]

 Status Breakdown:
   ✅ Hadir:  57
    Sakit:  3
   📧 Izin:   2
   ❌ Alpha:  5
    Total:  67

✅ User confirmed alpha submission
✅ Form data set, submitting...

🚀 ===== FORM SUBMIT END =====
```

**Jika Alpha: 0 di console:**
- ❌ Hidden input tidak terupdate
- ⚠️ Mungkin ada error JavaScript sebelumnya
- 🔧 Cek console untuk error merah

### Step 2: Cek Server Console (Server-Side)

Buka terminal/command prompt yang menjalankan server (npm start / npm run dev)

**Yang Harus Muncul Saat Submit:**
```
 POST /absensi - Saving attendance
   Request body: {
     tanggal: '2026-05-08',
     kelas_id: 'X',
     mapel_id: 'Y',
     guru_id: 'Z',
     absensi_data_type: 'string'
   }

📥 Parsed 67 attendance records
   Raw data sample (first 3):
     1. siswa_id: 123, status: alpha
     2. siswa_id: 124, status: hadir
     3. siswa_id: 125, status: sakit

📊 Status Breakdown (from received data):
   ✅ Hadir:  57
    Sakit:  3
    Izin:   2
    Alpha:  5
   📌 Total:  67

   🔴 Alpha records: 5
      - siswa_id: 123, status: alpha
      - siswa_id: 124, status: alpha
      - siswa_id: 125, status: alpha
      - siswa_id: 126, status: alpha
      - siswa_id: 127, status: alpha

    Processing ALPHA for siswa 123: status=alpha
   ➕ Inserting new record for siswa 123 (mapel: Y, guru: Z)
   ✅ Alpha record inserted for siswa 123

 Save complete:
   ✅ Success: 67 records
    Failed: 0 records

   🔴 ALPHA SUMMARY:
      ✅ Saved: 5
       Failed: 0
```

**Jika Server Menerima Alpha: 0:**
- ❌ Data dari frontend tidak ada alpha
- ️ Masalah ada di browser client
- 🔧 Lihat Step 1

**Jika Server Menerima Alpha > 0 tapi Saved: 0:**
- ❌ INSERT/UPDATE gagal di database
- ⚠️ Cek error log di console
- 🔧 Lihat Step 3

### Step 3: Cek Database

Jalankan script untuk memeriksa data di database:

```bash
node check_today_absensi.js
```

**Output yang Diharapkan:**
```
 Date: 2026-05-08
📊 Total Records Found: 67

📈 STATUS BREAKDOWN:
─────────────────────────────────────────
   ✅ Hadir:  57 students
    Sakit:  3 students
   📧 Izin:   2 students
   ❌ Alpha:  5 students
   ⚠️  Alpa:   0 students (TYPO - needs fix)
─────────────────────────────────────────

✅ FOUND 5 ALPHA STUDENT(S):

   ALPHA RECORDS:
   ────────────────────────────────────────
   1. NAMA SISWA 1
      NIS: 25-12-XXX
      Kelas: XA
      Mapel: BAHASA INGGRIS TK. LANJUT
      Guru: Heni Maryani, M.Pd
      Status: "alpha" ✅
   ...
```

**Jika Alpha: 0 di database:**
- ❌ Data tidak tersimpan ke database
- ⚠️ Mungkin ada error database
- 🔧 Cek error log di server console

### Step 4: Verifikasi di Halaman Absensi

1. Refresh halaman **Index Absensi** (Ctrl+F5)
2. Lihat **summary cards** di atas tabel

**Yang Harus Muncul:**
```
┌────────  ┌────────┐  ┌────────┐  ┌────────┐
│   57   │  │   3    │  │   2    │  │   5    │
│ Hadir  │  │ Sakit  │  │  Izin  │  │ Alpha  │
────────┘  └────────┘  ────────┘  └────────┘
```

**Jika Alpha masih 0:**
-  Data memang tidak ada di database
- ⚠️ Kembali ke Step 1-3
- 🔧 Pastikan semua logging menampilkan alpha > 0

## Masalah Umum dan Solusi

### Masalah 1: Tombol Alpha Tidak Berubah Warna
**Gejala**: Klik tombol alpha tapi tidak ada perubahan visual

**Solusi:**
```javascript
// Cek apakah CSS sudah terload
// Pastikan ada style untuk .btn-alpha.active
// Lihat di input.ejs bagian <style>
```

### Masalah 2: Hidden Input Tidak Terupdate
**Gejala**: Console log `📝 Hidden input updated` tidak muncul

**Solusi:**
1. Cek struktur HTML - hidden input harus ada di dalam `.status-buttons`
2. Cek selector `.status-value` benar
3. Refresh halaman (Ctrl+F5)

### Masalah 3: Data Alpha Tidak Dikirim
**Gejala**: Server console menunjukkan `Alpha: 0`

**Solusi:**
1. Pastikan `setStatus()` function terpanggil saat klik
2. Cek `hiddenInput.value` berubah menjadi "alpha"
3. Cek submit handler membaca dari hidden input

### Masalah 4: Data Tidak Tersimpan ke Database
**Gejala**: Server menerima alpha tapi `Alpha Saved: 0`

**Solusi:**
1. Cek error message di server console
2. Cek apakah ada constraint violation
3. Cek apakah tabel absensi sudah ada
4. Jalankan: `node init_absensi.js` (jika perlu)

## Checklist Debugging

- [ ] Browser console menampilkan `✅ Student X status changed to: alpha`
- [ ] Browser console menampilkan `📊 Status Breakdown: Alpha > 0`
- [ ] Alert konfirmasi muncul: "Anda akan menyimpan absensi dengan X siswa status ALPHA"
- [ ] Server console menampilkan `📊 Status Breakdown (from received data): Alpha > 0`
- [ ] Server console menampilkan `✅ Alpha record inserted/updated for siswa X`
- [ ] Server console menampilkan ` ALPHA SUMMARY: Saved > 0`
- [ ] Database script `check_today_absensi.js` menampilkan alpha records
- [ ] Halaman absensi menampilkan Alpha > 0 di summary cards

## Script Diagnostik

### 1. Check Data di Database
```bash
node check_today_absensi.js
```
Menampilkan semua record absensi untuk tanggal 2026-05-08

### 2. Fix Typo Alpa → Alpha
```bash
node fix_alpha_display.js
```
Mengubah semua typo "alpa" menjadi "alpha"

### 3. Check Alpha Records (Legacy)
```bash
node check_alpha_records.js
```
Script lama untuk checking alpha records

## Kontak Support

Jika semua langkah sudah dilakukan tapi masih bermasalah:

1. **Screenshot browser console** (lengkap dari klik Alpha sampai submit)
2. **Screenshot server console** (lengkap dari POST request sampai redirect)
3. **Output dari `node check_today_absensi.js`**
4. **Screenshot halaman input absensi** (tombol alpha yang dipilih)
5. **Screenshot halaman index absensi** (summary cards)

Kirim semua informasi di atas ke administrator sistem untuk analisis lebih lanjut.
