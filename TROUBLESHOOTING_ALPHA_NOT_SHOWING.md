# Troubleshooting: Siswa Alpha Tidak Muncul di Tampilan Absensi

## Masalah
Anda sudah menginput siswa dengan status Alpha, tetapi di tampilan absensi menunjukkan **Alpha: 0**.

## Kemungkinan Penyebab

### 1. ✅ Data Tersimpan dengan Typo "alpa" bukan "alpha"
**Gejala**: Alpha tetap 0 meskipun sudah input alpha

**Solusi**: Jalankan script fix
```bash
node fix_alpha_display.js
```

Script ini akan:
- Mengecek semua data alpha/alpa di database
- Mengubah typo "alpa" menjadi "alpha"
- Menampilkan daftar siswa dengan status alpha

### 2. ✅ Tanggal Filter Tidak Sesuai
**Gejala**: Data tersimpan di tanggal berbeda dengan yang ditampilkan

**Cara Cek**:
1. Lihat di terminal/console log server
2. Cari log: ` Accessing /absensi route`
3. Lihat parameter `tanggal` yang digunakan

**Solusi**:
- Pastikan filter tanggal di halaman absensi sama dengan tanggal saat input
- Di halaman Input Absensi, tanggal default adalah hari ini
- Di halaman Index Absensi, pastikan tanggal filter sesuai

### 3. ✅ Data Belum Tersimpan ke Database
**Gejala**: Tidak ada log "POST /absensi - Saving attendance"

**Cara Cek**:
1. Buka browser DevTools (F12)
2. Pergi ke tab Console
3. Input absensi dan klik Simpan
4. Lihat apakah ada log:
   ```
    Data yang akan dikirim: [...]
    Status breakdown: { hadir: X, sakit: X, izin: X, alpha: X }
   ```

**Jika Tidak Ada Log**:
- Form tidak submit dengan benar
- Ada JavaScript error
- Validasi form gagal

**Solusi**:
1. Cek browser console untuk error
2. Pastikan memilih **Mapel** dan **Guru** sebelum submit
3. Klik tombol Alpha yang benar (merah)

### 4. ✅ Data Tersimpan tapi dengan Tanggal Berbeda
**Gejala**: Ada log POST berhasil, tapi data tidak muncul di filter tanggal yang dipilih

**Cara Cek di Database**:
```bash
node check_today_absensi.js
```

Script akan menampilkan:
- Semua record absensi untuk tanggal 2026-05-08
- Status breakdown (Hadir, Sakit, Izin, Alpha)
- Daftar siswa alpha jika ada

## Langkah-Langkah Diagnosa

### Step 1: Cek Console Log Server
Buka terminal/command prompt yang menjalankan server. Cari log berikut:

```
📋 Accessing /absensi route
    Query parameters: { tanggal: '2026-05-08', kelas_id: 'X', ... }
    🔍 SQL Query: SELECT ...
    ✅ Absensi loaded: X records
    📊 Status breakdown: { hadir: X, sakit: X, izin: X, alpha: X }
```

**Jika `alpha: 0`**:
- Data alpha memang tidak ada di database untuk tanggal tersebut
- Lanjut ke Step 2

**Jika `alpha > 0`**:
- Data ada, masalah di frontend
- Lanjut ke Step 3

### Step 2: Cek Data di Database
Jalankan script diagnostik:
```bash
node check_today_absensi.js
```

Script akan:
1. Menampilkan semua record absensi untuk 2026-05-08
2. Group by status
3. Menampilkan daftar siswa alpha
4. Auto-fix typo "alpa" -> "alpha"

**Jika Output**:
```
❌ NO ALPHA STUDENTS in database!
```

Berarti:
- Anda tidak mengklik tombol Alpha saat input
- Atau form submit gagal
- Atau data tersimpan di tanggal lain

**Jika Output**:
```
✅ FOUND X ALPHA STUDENT(S):
```

Berarti data ada, lanjut ke Step 3.

### Step 3: Cek Browser Console
1. Buka halaman absensi
2. Tekan **F12** untuk DevTools
3. Pergi ke tab **Console**
4. Refresh halaman (Ctrl+F5)
5. Lihat apakah ada error JavaScript

**Error Umum**:
- `ReferenceError`: Variable tidak terdefinisi
- `TypeError`: Cannot read property of undefined
- Network error: Request failed

### Step 4: Cek Filter di Halaman
Pastikan:
1. **Tanggal** filter sama dengan tanggal input
2. **Kelas** filter sesuai (atau pilih "Semua Kelas")
3. **Status** filter: Pilih "Semua Status" atau "Alpha"
4. **Guru** dan **Mapel** tidak membatasi hasil (atau pilih yang sesuai)

## Solusi Cepat

### Solusi 1: Jalankan Script Fix
```bash
node fix_alpha_display.js
```

### Solusi 2: Cek Console Log Input
Saat input absensi, browser console harus menampilkan:
```
📤 Data yang akan dikirim: [
  { siswa_id: '1', status_kehadiran: 'hadir', keterangan: '' },
  { siswa_id: '2', status_kehadiran: 'alpha', keterangan: '' },
  ...
]
📊 Status breakdown: { hadir: 57, sakit: 3, izin: 2, alpha: X }
```

Jika `alpha: 0` di console, berarti tombol Alpha belum diklik.

### Solusi 3: Re-input dengan Logging
1. Buka halaman Input Absensi
2. Buka Browser DevTools (F12) → Console
3. Pilih Mapel dan Guru
4. Klik tombol **Alpha** untuk siswa yang ingin ditandai alpha
5. Lihat console - harus ada log: `✅ Student X status changed to: alpha`
6. Klik **Simpan Absensi**
7. Di konfirmasi alert, harus ada pesan: "Anda akan menyimpan absensi dengan X siswa status ALPHA"
8. Klik OK
9. Cek console untuk log submit
10. Refresh halaman Index Absensi

### Solusi 4: Cek Database Langsung
```bash
node check_today_absensi.js
```

Jika tidak ada data sama sekali:
- Form submit tidak berhasil
- Cek network tab di DevTools saat submit
- Cek apakah ada redirect error

## Cara Verifikasi Fix

Setelah menjalankan solusi:

1. **Refresh browser** (Ctrl+F5)
2. **Lihat summary cards**: Alpha harus > 0
3. **Lihat tabel**: Siswa alpha harus muncul dengan badge merah
4. **Cek console log server**: Harus ada log `✅ Found X alpha record(s)!`

## Checklist Troubleshooting

- [ ] Jalankan `node fix_alpha_display.js` untuk fix typo
- [ ] Jalankan `node check_today_absensi.js` untuk cek database
- [ ] Cek console log server saat load halaman absensi
- [ ] Cek browser console saat input absensi
- [ ] Pastikan tanggal filter sesuai dengan tanggal input
- [ ] Pastikan tombol Alpha diklik (berubah merah)
- [ ] Pastikan konfirmasi alert muncul saat submit
- [ ] Cek network tab untuk melihat request POST berhasil
- [ ] Refresh browser setelah fix

## Kontak Support

Jika masih bermasalah setelah semua langkah di atas:
1. Screenshot halaman Input Absensi (tunjukkan tombol Alpha yang dipilih)
2. Screenshot halaman Index Absensi (tunjukkan summary cards)
3. Copy-paste console log dari browser
4. Copy-paste output dari `node check_today_absensi.js`
5. Kirim ke administrator sistem

## Catatan Penting

- ✅ **Data alpha TERSIMPAN** dengan status "alpha" (bukan "alpa")
- ✅ **Normalisasi otomatis** di backend: "alpa" → "alpha"
- ✅ **Logging detail** di console untuk debugging
- ✅ **Konfirmasi alert** sebelum submit jika ada alpha
- ✅ **Script diagnostik** tersedia untuk cek database
