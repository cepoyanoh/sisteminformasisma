# Cara Memastikan Status Alpha Muncul di Tampilan Absensi Siswa

**Tanggal:** 2026-05-08  
**Status:** ✅ Sudah Diimplementasikan

## 📋 Ringkasan

Sistem absensi **sudah mendukung status Alpha** dengan fitur-fitur berikut:
- ✅ Input status Alpha melalui tombol merah "Alpha"
- ✅ Konversi otomatis "alpa" → "alpha" 
- ✅ Filter berdasarkan status Alpha
- ✅ Summary card menampilkan jumlah Alpha
- ✅ Highlight baris merah untuk siswa Alpha
- ✅ Sorting: Alpha ditampilkan paling atas

## 🔍 Cara Melihat Data Alpha

### Metode 1: Menggunakan Filter Status (Recommended)

1. **Buka halaman Absensi**: `http://localhost:3000/absensi`
2. **Pilih filter**:
   - Tanggal: Pilih tanggal yang sesuai
   - Kelas: Pilih kelas (opsional)
   - **Status: Alpha** ← **PENTING!**
3. **Klik tombol "Filter"**
4. **Hasil**: Tabel akan menampilkan hanya siswa dengan status Alpha

### Metode 2: Lihat Semua Data

1. Buka halaman `/absensi` tanpa filter status
2. Di bagian atas tabel, lihat **Summary Cards**:
   - 🟢 Hadir: X siswa
   - 🟡 Sakit: X siswa
   - 🔵 Izin: X siswa
   - 🔴 **Alpha: X siswa** ← **Angka ini menunjukkan jumlah Alpha**
3. Scroll ke tabel - siswa Alpha akan:
   - Memiliki badge merah bertuliskan "Alpha"
   - Baris dengan background merah muda
   - Ditampilkan di urutan paling atas

### Metode 3: Diagnostic Tool

1. Klik tombol **"Check Alpha"** di header halaman absensi
2. Atau akses langsung: `/absensi/check-alpha`
3. Halaman ini menampilkan semua record Alpha secara detail

## 🛠️ Troubleshooting

### Masalah 1: Alpha Tidak Muncul Setelah Input

**Penyebab:**
- Data belum tersimpan ke database
- Error saat proses save

**Solusi:**
1. Cek terminal/log server saat menyimpan absensi
2. Cari log seperti:
   ```
   🔴 Alpha records: X
   ✅ Alpha record inserted for siswa Y
   ```
3. Jika tidak ada log tersebut, berarti data tidak tersimpan
4. Coba input ulang dan pastikan klik tombol "Simpan Absensi"

### Masalah 2: Alpha Tersimpan Tapi Tidak Terlihat

**Penyebab:**
- Filter tanggal tidak sesuai
- Filter kelas tidak sesuai

**Solusi:**
1. Pastikan tanggal filter sama dengan tanggal input
2. Hapus semua filter atau pilih "Semua Kelas"
3. Gunakan filter Status: Alpha untuk melihat semua Alpha

### Masalah 3: Typo "alpa" vs "alpha"

**Status:** ✅ **SUDAH DIPERBAIKI OTOMATIS**

Sistem sekarang otomatis mengkonversi "alpa" menjadi "alpha":
- Saat input (POST route)
- Saat query (GET route)
- Saat display (view template)

Tidak perlu khawatir tentang typo lagi!

## 🧪 Verifikasi Data

### Script 1: Check Alpha Records

Jalankan script untuk memeriksa data Alpha di database:

```bash
node check_alpha_records.js
```

Script ini akan menampilkan:
- Total record Alpha
- 10 record Alpha terbaru dengan detail
- Jumlah typo "alpa" (jika ada)
- Statistik absensi hari ini

### Script 2: Check Today's Absensi

Untuk memeriksa absensi hari ini:

```bash
node check_today_absensi.js
```

## 📝 Cara Input Status Alpha

1. **Buka halaman Input Absensi**: `/absensi/input`
2. **Pilih Kelas**
3. **Pilih Tanggal**
4. **Pilih Mata Pelajaran** (wajib)
5. **Pilih Guru** (wajib)
6. **Untuk setiap siswa**, klik salah satu tombol status:
   - 🟢 **Hadir** (hijau)
   - 🟡 **Sakit** (kuning)
   - 🔵 **Izin** (biru)
   - 🔴 **Alpha** (merah) ← **Klik ini untuk menandai Alpha**
7. **Klik "Simpan Absensi"**
8. **Tunggu konfirmasi sukses**

## 🎨 Tampilan Alpha di UI

### Badge Status
- Warna: Merah (`bg-danger`)
- Label: "Alpha"
- Icon: ❌

### Baris Tabel
- Background: Merah muda (`table-danger`)
- Posisi: Paling atas (sorted by priority)

### Summary Card
- Warna: Merah (`bg-danger`)
- Angka: Menunjukkan jumlah siswa Alpha
- Label: "Alpha"

## ⚙️ Implementasi Teknis

### Backend (routes/absensi.js)

```javascript
// Normalisasi "alpa" → "alpha" saat input
if (item.status_kehadiran === 'alpa') {
  item.status_kehadiran = 'alpha';
}

// Filter by status (dengan normalisasi)
if (status) {
  const normalizedStatus = status === 'alpa' ? 'alpha' : status;
  sql += ' AND a.status_kehadiran = ?';
  params.push(normalizedStatus);
}
```

### Frontend (views/absensi/index.ejs)

```javascript
// Normalize status untuk display
const status = absensi.status_kehadiran === 'alpa' ? 'alpha' : absensi.status_kehadiran;

// Badge colors
const statusBadge = {
  'hadir': 'bg-success',
  'sakit': 'bg-warning',
  'izin': 'bg-info',
  'alpha': 'bg-danger'  // ← Alpha menggunakan merah
};

// Row highlighting
const rowClass = status === 'alpha' ? 'table-danger' : '';

// Sorting: Alpha first
const statusOrder = { 'alpha': 0, 'sakit': 1, 'izin': 2, 'hadir': 3 };
```

## 📊 Statistik dan Monitoring

### Dashboard Stats
Total absensi ditampilkan di dashboard utama:
```javascript
stats.totalAbsensi = await Absensi.count();
```

### Rekap Harian
Halaman `/absensi/rekap-harian` menampilkan rekap per kelas per tanggal dengan breakdown:
- Hadir
- Sakit
- Izin
- Alpha

### Rekap Bulanan
Halaman `/absensi/rekap` menampilkan rekap bulanan dengan statistik lengkap.

## ✅ Checklist Verifikasi

Setelah input absensi dengan status Alpha, pastikan:

- [ ] Terminal menampilkan log "Alpha record inserted/updated"
- [ ] Summary card "Alpha" menunjukkan angka > 0
- [ ] Tabel menampilkan siswa Alpha dengan badge merah
- [ ] Baris Alpha memiliki background merah muda
- [ ] Siswa Alpha muncul di urutan paling atas
- [ ] Filter Status: Alpha menampilkan data yang benar
- [ ] Script `check_alpha_records.js` menemukan record Alpha

## 🆘 Bantuan Lebih Lanjut

Jika masih mengalami masalah:

1. **Cek Database Langsung**:
   ```bash
   node check_alpha_records.js
   ```

2. **Lihat Log Server**:
   - Buka terminal tempat server berjalan
   - Cari error messages atau warning

3. **Periksa Browser Console**:
   - Tekan F12
   - Lihat tab "Console" untuk JavaScript errors

4. **Restart Server**:
   ```bash
   npm start
   ```

## 📚 Dokumentasi Terkait

- [`PENGHAPUSAN_TABEL_KURIKULUM_JADWAL.md`](d:\SISTEMINFORMASI\PENGHAPUSAN_TABEL_KURIKULUM_JADWAL.md) - Perubahan struktur database
- [`TROUBLESHOOTING_ALPHA_NOT_SHOWING.md`](d:\SISTEMINFORMASI\TROUBLESHOOTING_ALPHA_NOT_SHOWING.md) - Troubleshooting lengkap
- [`FEATURE_ABSENSI_BUTTON_STATUS.md`](d:\SISTEMINFORMASI\FEATURE_ABSENSI_BUTTON_STATUS.md) - Fitur tombol status absensi

# Cara Mengecek Data Alpha di Database

**Tanggal:** 2026-05-08  
**Status:** ✅ Fitur Diagnostic Sudah Ditambahkan

## 🎯 Cara Cepat Mengecek Data Alpha

### Metode 1: Halaman Diagnostic (RECOMMENDED)

1. **Buka halaman Absensi**: `http://localhost:3000/absensi`
2. **Klik tombol "Diagnostic Alpha"** (merah, ada icon bug)
3. Atau langsung akses: `http://localhost:3000/absensi/diagnostic`

Halaman ini akan menampilkan:
- ✅ **Total Record Alpha** - Jumlah semua data Alpha di database
- ✅ **Total Semua Absensi** - Jumlah total record absensi
- ✅ **Typo Check** - Jumlah typo "alpa" yang seharusnya "alpha"
- ✅ **Distribusi Status** - Breakdown Hadir/Sakit/Izin/Alpha dengan persentase
- ✅ **Absensi Hari Ini** - Statistik untuk tanggal hari ini
- ✅ **10 Record Alpha Terbaru** - Detail lengkap dengan nama siswa, kelas, mapel, guru

### Metode 2: Filter Status Alpha

1. Buka `/absensi`
2. Pilih filter **Status: Alpha**
3. Klik **Filter**
4. Lihat hasilnya di tabel

### Metode 3: Summary Cards

Di halaman `/absensi`, lihat kartu merah bertuliskan **"Alpha"** di bagian atas tabel. Angka tersebut menunjukkan jumlah siswa Alpha.

---

## 🔍 Interpretasi Hasil

### Jika Total Alpha = 0

**Kemungkinan:**
- Belum ada absensi yang diinput
- Semua siswa ditandai Hadir/Sakit/Izin (tidak ada yang Alpha)
- Data belum tersimpan ke database

**Solusi:**
1. Input absensi baru dengan menandai beberapa siswa sebagai Alpha
2. Pastikan klik tombol "Simpan Absensi"
3. Tunggu konfirmasi sukses

### Jika Ada Typo "alpa" > 0

**Artinya:** Ada data yang tersimpan dengan typo "alpa" bukan "alpha"

**Solusi:** Sistem sudah otomatis mengkonversi, jadi tidak perlu khawatir. Tapi jika ingin membersihkan, bisa update manual via SQL.

### Jika Total Absensi = 0

**Artinya:** Belum ada data absensi sama sekali di database

**Solusi:** Mulai input absensi dari menu "Input Absensi"

---

## 🛠️ Fitur Tambahan di Halaman Diagnostic

### Insert Test Alpha

Tombol **"Insert Test Alpha"** akan otomatis membuat data Alpha dummy untuk testing:
- Memilih kelas pertama yang tersedia
- Memilih mapel dan guru pertama
- Menandai SEMUA siswa di kelas tersebut sebagai Alpha
- Tanggal: hari ini

**Cara menggunakan:**
1. Klik tombol "Insert Test Alpha"
2. Refresh halaman diagnostic
3. Lihat apakah data Alpha muncul

**Catatan:** Ini hanya untuk testing! Hapus data test setelah selesai.

### Refresh Data

Tombol **"Refresh Data"** akan reload halaman dan mengambil data terbaru dari database.

---

## 📊 Contoh Output Diagnostic

```
========================================
  CHECK DATA ALPHA DI DATABASE
========================================

📊 Total Record Alpha: 5

📋 Detail Record Alpha:

1. Budi Santoso
   Kelas: X IPA 1
   Mapel: Matematika
   Guru: Pak Ahmad
   Tanggal: 2026-05-08
   Status: alpha

2. Siti Nurhaliza
   Kelas: X IPA 1
   Mapel: Matematika
   Guru: Pak Ahmad
   Tanggal: 2026-05-08
   Status: alpha

... dst
```

---

## ✅ Checklist Verifikasi Alpha Berfungsi

Setelah setup, pastikan:

- [ ] Halaman `/absensi/diagnostic` dapat diakses
- [ ] Total Record Alpha menunjukkan angka yang benar
- [ ] Typo count = 0 (atau sistem auto-fix)
- [ ] Distribusi status menampilkan semua kategori
- [ ] 10 record terbaru ditampilkan dengan benar
- [ ] Badge Alpha berwarna merah
- [ ] Baris Alpha memiliki background merah muda
- [ ] Filter Status: Alpha berfungsi

---

## 🆘 Troubleshooting

### Halaman Diagnostic Tidak Bisa Diakses

**Penyebab:** Server belum restart setelah penambahan route

**Solusi:**
```bash
# Stop server (Ctrl+C)
npm start
```

### Data Alpha Tidak Muncul Meski Sudah Diinput

**Cek:**
1. Terminal log saat save - harus ada "Alpha record inserted"
2. Tanggal filter sesuai dengan tanggal input
3. Kelas filter sesuai (atau pilih "Semua Kelas")

### Error di Halaman Diagnostic

**Solusi:**
1. Cek terminal untuk error message
2. Pastikan database file ada (`database.db`)
3. Pastikan tabel `absensi` sudah dibuat

---

## 📚 File Terkait

- **Route:** [`routes/absensi.js`](d:\SISTEMINFORMASI\routes\absensi.js) - Route `/absensi/diagnostic`
- **View:** [`views/absensi/diagnostic.ejs`](d:\SISTEMINFORMASI\views\absensi\diagnostic.ejs) - Template halaman
- **Index:** [`views/absensi/index.ejs`](d:\SISTEMINFORMASI\views\absensi\index.ejs) - Tombol link ke diagnostic
- **Script:** [`check_alpha_records.js`](d:\SISTEMINFORMASI\check_alpha_records.js) - Script CLI diagnostic

---

## 💡 Tips

1. **Selalu cek halaman diagnostic** setelah input absensi untuk memastikan data tersimpan
2. **Gunakan filter Status: Alpha** untuk melihat hanya siswa Alpha
3. **Perhatikan summary card** Alpha di halaman index - harus menunjukkan angka > 0 jika ada data
4. **Insert Test Alpha** berguna untuk testing UI tanpa harus input manual satu per satu
