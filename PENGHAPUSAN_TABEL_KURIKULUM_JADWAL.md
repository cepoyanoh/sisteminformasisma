# Penghapusan Tabel Kurikulum dan Jadwal Mengajar

**Tanggal:** 2026-05-08  
**Status:** ✅ Selesai

## Ringkasan

Tabel `kurikulum` dan `jadwal_mengajar` telah berhasil dihapus dari database sistem informasi akademik SMA Negeri 12 Pontianak.

## Perubahan yang Dilakukan

### 1. Database
- ✅ Tabel `kurikulum` dihapus menggunakan script `drop_kurikulum_jadwal.js`
- ✅ Tabel `jadwal_mengajar` dihapus menggunakan script yang sama
- ✅ Verifikasi penghapusan dengan script `verify_drop_tables.js`

### 2. Model Files (Dihapus)
- ❌ `models/Kurikulum.js` - Dihapus

### 3. Route Files (Dihapus)
- ❌ `routes/kurikulum.js` - Dihapus

### 4. View Files (Dihapus)
- ❌ `views/kurikulum/` - Seluruh folder dihapus

### 5. Konfigurasi Database (Dibersihkan)
- ✅ `config/dbConfig.js`:
  - Dihapus definisi CREATE TABLE untuk `kurikulum`
  - Dihapus definisi CREATE TABLE untuk `jadwal_mengajar`
  - Dihapus foreign key `kurikulum_id` dari tabel `mata_pelajaran`

### 6. Initialization Scripts (Dibersihkan)
- ✅ `init_all_tables.js`:
  - Dihapus blok CREATE TABLE untuk `kurikulum`
  - Dihapus blok CREATE TABLE untuk `jadwal_mengajar`
  - Dihapus foreign key `kurikulum_id` dari tabel `mata_pelajaran`

### 7. Model MataPelajaran (Diperbaiki)
- ✅ `models/MataPelajaran.js`:
  - Dihapus JOIN ke tabel `kurikulum` dari semua query (getAll, getMapelPilihan, getMapelWajib, getById)
  - Dihapus parameter `kurikulum_id` dari fungsi create()
  - Dihapus parameter `kurikulum_id` dari fungsi update()
  - Dihapus variabel `kurikulumId` dari kedua fungsi tersebut

### 8. Routes MataPelajaran (Diperbaiki)
- ✅ `routes/mapel.js`:
  - Dihapus parameter `kurikulum_id: 1` dari MataPelajaran.create()
  - Dihapus parameter `kurikulum_id` dari MataPelajaran.update() pada route edit
  - Dihapus parameter `kurikulum_id` dari MataPelajaran.update() pada route toggle status

### 9. Dokumentasi (Diperbarui)
- ✅ `PENGHAPUSAN_SISTEM_LOGIN.md`:
  - Dihapus referensi tabel `kurikulum` dari daftar tabel database
  - Dihapus referensi tabel `jadwal_mengajar` dari daftar tabel database
- ✅ `FITUR_TOMBOL_KEMBALI_DASHBOARD.md`:
  - Dihapus baris tabel untuk `routes/kurikulum.js`
- ✅ `FIX_MAPEL_MULTI_KELAS.md`:
  - Dihapus parameter `kurikulum_id: 1` dari contoh kode

## Script yang Dibuat

1. **`drop_kurikulum_jadwal.js`** - Script untuk menghapus tabel dari database
2. **`verify_drop_tables.js`** - Script untuk memverifikasi penghapusan tabel

## Struktur Database Saat Ini

Database sekarang berisi tabel-tabel berikut:
- `guru` - Data guru
- `mata_pelajaran` - Data mata pelajaran (tanpa foreign key ke kurikulum)
- `kelas` - Data kelas
- `jurnal_guru` - Jurnal kegiatan guru
- `siswa` - Data siswa
- `nilai` - Data nilai siswa
- `absensi` - Data absensi

## Catatan Penting

⚠️ **Foreign Key Dependencies:**
- Tabel `mata_pelajaran` sebelumnya memiliki foreign key `kurikulum_id` yang merujuk ke tabel `kurikulum`. Foreign key ini telah dihapus.
- Tidak ada tabel lain yang memiliki dependency ke `jadwal_mengajar`.

✅ **Aplikasi Tetap Berfungsi:**
- Semua route dan fitur utama tetap berfungsi normal
- Tidak ada error yang muncul setelah penghapusan
- Dashboard dapat diakses tanpa masalah

## Cara Verifikasi

Untuk memverifikasi bahwa tabel telah dihapus:

```bash
node verify_drop_tables.js
```

Script ini akan menampilkan:
- Status penghapusan masing-masing tabel
- Daftar semua tabel yang tersisa dalam database

## Testing

Setelah penghapusan, pastikan untuk:
1. Restart server aplikasi
2. Akses dashboard untuk memastikan tidak ada error
3. Test fitur mata pelajaran (CRUD) untuk memastikan berfungsi tanpa kurikulum_id
4. Jalankan `node verify_drop_tables.js` untuk konfirmasi penghapusan
