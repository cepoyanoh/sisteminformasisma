# Perbaikan Tampilan Siswa dengan Status Alpha

## Masalah
Siswa dengan status "alpha" (atau "alpa") tidak muncul di tampilan absensi siswa.

## Penyebab
1. **Typo "alpa" vs "alpha"**: Beberapa record di database menggunakan "alpa" (typo) bukan "alpha" (format standar)
2. **Filter tidak konsisten**: Tidak ada filter berdasarkan status kehadiran di halaman index absensi
3. **Normalisasi tidak lengkap**: Normalisasi dari "alpa" ke "alpha" tidak diterapkan di semua route

## Perbaikan yang Dilakukan

### 1. Route `/absensi` (index.ejs)
**File**: `routes/absensi.js`

- ✅ Menambahkan parameter filter `status` untuk memfilter berdasarkan status kehadiran
- ✅ Menambahkan normalisasi otomatis: semua status "alpa" dikonversi ke "alpha" sebelum ditampilkan
- ✅ Logging detail untuk debugging status alpha

```javascript
// Filter by status (normalize 'alpa' to 'alpha')
if (status) {
  const normalizedStatus = status === 'alpa' ? 'alpha' : status;
  sql += ' AND a.status_kehadiran = ?';
  params.push(normalizedStatus);
}

// CRITICAL FIX: Normalize all 'alpa' to 'alpha' in the result
absensiList.forEach(record => {
  if (record.status_kehadiran === 'alpa') {
    record.status_kehadiran = 'alpha';
  }
});
```

### 2. View Index Absensi
**File**: `views/absensi/index.ejs`

- ✅ Menambahkan dropdown filter "Status" dengan opsi: Semua Status, Hadir, Sakit, Izin, Alpha
- ✅ Filter status terintegrasi dengan form filter existing (tanggal, kelas, guru, mapel)

### 3. Route `/absensi/rekap-harian`
**File**: `routes/absensi.js`

- ✅ Menambahkan logging detail untuk siswa dengan status alpha
- ✅ Normalisasi "alpa" ke "alpha" sudah ada dan diperkuat dengan logging tambahan
- ✅ Summary cards menampilkan total alpha dengan benar

```javascript
// Log summary of students with alpha
const studentsWithAlpha = Object.values(rekapBySiswa).filter(s => s.alpha > 0);
if (studentsWithAlpha.length > 0) {
  console.log(`   🔴 Students with Alpha status: ${studentsWithAlpha.length}`);
  studentsWithAlpha.forEach(s => {
    console.log(`      - ${s.nama_siswa}: ${s.alpha} alpha record(s)`);
  });
}
```

### 4. Script Diagnostik
**File**: `check_alpha_records.js`

- ✅ Script baru untuk memeriksa data alpha/alpa di database
- ✅ Menampilkan jumlah record dengan status "alpha" vs "alpa" (typo)
- ✅ Menampilkan daftar siswa dengan status alpha

## Cara Menggunakan Fitur Baru

### 1. Filter Siswa Alpha di Halaman Index
1. Buka halaman **Absensi Siswa** (`/absensi`)
2. Di bagian filter, pilih dropdown **Status**
3. Pilih **"Alpha"**
4. Klik tombol **Filter**
5. Sistem akan menampilkan hanya siswa dengan status Alpha

### 2. Melihat Rekap Harian dengan Alpha
1. Buka halaman **Rekap Harian** (`/absensi/rekap-harian`)
2. Pilih tanggal dan kelas
3. Klik **Tampilkan**
4. Semua siswa akan ditampilkan termasuk yang memiliki status Alpha
5. Kartu summary di atas tabel menunjukkan total Alpha

### 3. Diagnosa Data Alpha
Jalankan script diagnostik:
```bash
node check_alpha_records.js
```

Script akan menampilkan:
- Jumlah record dengan status "alpha"
- Jumlah record dengan typo "alpa"
- Daftar siswa dengan status alpha

## Normalisasi Data Existing

Jika ada data dengan typo "alpa" di database, sistem akan otomatis menormalisasinya saat ditampilkan. Namun untuk konsistensi jangka panjang, disarankan untuk mengupdate data di database:

```sql
UPDATE absensi SET status_kehadiran = 'alpha' WHERE status_kehadiran = 'alpa';
```

## Testing

Setelah menerapkan perubahan:

1. **Restart server** jika sedang berjalan
2. **Buka halaman Absensi** dan test filter status Alpha
3. **Buka halaman Rekap Harian** dan pastikan siswa alpha muncul
4. **Cek console log** untuk melihat logging detail tentang status alpha

## Catatan Penting

✅ **Semua siswa dengan status alpha sekarang akan muncul** di:
- Halaman index absensi (dengan filter atau tanpa filter)
- Halaman rekap harian (semua siswa ditampilkan)
- Summary cards (menampilkan total alpha)

✅ **Normalisasi konsisten**: Status "alpa" otomatis dikonversi ke "alpha" di semua tempat

✅ **Logging detail**: Console log membantu debugging jika masih ada masalah

## Troubleshooting

Jika siswa alpha masih tidak muncul:

1. **Cek database**: Jalankan `node check_alpha_records.js`
2. **Cek console log**: Lihat apakah ada error atau warning
3. **Cek filter**: Pastikan tidak ada filter lain yang membatasi hasil
4. **Restart server**: Pastikan perubahan kode sudah diload
