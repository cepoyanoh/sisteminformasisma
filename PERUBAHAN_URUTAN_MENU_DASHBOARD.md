# Perubahan Urutan Menu Dashboard

## Tanggal Perubahan
**2026-04-07**

## Ringkasan

Urutan menu di dashboard telah diubah sesuai permintaan untuk meningkatkan alur navigasi yang lebih logis.

## Urutan Menu Baru

### Sebelum (Old Order):
1. Data Kelas
2. Mata Pelajaran
3. Data Guru
4. Data Siswa
5. Jurnal Guru
6. Input Nilai

### Sesudah (New Order):
1. **Data Guru** 👨‍🏫
2. **Mata Pelajaran** 📚
3. **Data Kelas** 🏫
4. **Data Siswa** 👨‍🎓
5. **Jurnal Guru** 📝
6. **Input Nilai** 📊

## Logika Pengurutan Baru

Urutan baru mengikuti alur logis manajemen sekolah:

1. **Guru** → Tenaga pengajar sebagai fondasi
2. **Mapel** → Mata pelajaran yang akan diajarkan
3. **Kelas** → Tempat pembelajaran berlangsung
4. **Siswa** → Peserta didik yang belajar
5. **Jurnal** → Catatan kegiatan pembelajaran
6. **Nilai** → Hasil evaluasi pembelajaran

Alur ini mencerminkan proses:
```
Guru mengajar → Mapel diajarkan → Di kelas tertentu → Kepada siswa → Dicatat di jurnal → Dinilai hasilnya
```

## File yang Dimodifikasi

### 1. [`views/index.ejs`](file://d:\SISTEMINFORMASI\views\index.ejs)

#### A. Statistics Cards (Bagian Atas)
Urutan kartu statistik diubah menjadi:
- Guru (biru muda/info)
- Mapel (hijau/success)
- Kelas (biru/primary)
- Siswa (merah/danger)
- Jurnal (kuning/warning)
- Nilai (merah tua/danger)

#### B. Menu Navigation Cards (Bagian Tengah)
Urutan menu cards diubah dengan struktur yang sama:
- Setiap card tetap memiliki icon, judul, dan deskripsi yang sama
- Hanya urutan penempatan yang diubah
- Link href tetap sama (/guru, /mapel, /kelas, dll)

## Visualisasi Layout

```
┌─────────────────────────────────────────────┐
│         STATISTICS CARDS (Baris 1)          │
├──────────┬──────────┬──────────┬───────────┤
│  Guru    │  Mapel   │  Kelas   │  Siswa    │
│  👨‍🏫     │  📚      │  🏫      │  👨‍🎓      │
└──────────┴──────────┴──────────┴───────────┘

┌─────────────────────────────────────────────┐
│         STATISTICS CARDS (Baris 2)          │
├──────────┬──────────┬──────────┬───────────┤
│  Jurnal  │  Nilai   │ [Coming] │ [Coming]  │
│  📝      │  📊      │          │           │
└──────────┴──────────┴──────────┴───────────┘

┌─────────────────────────────────────────────┐
│         MENU NAVIGATION CARDS               │
├──────────┬──────────┬──────────┬───────────┤
│  Guru    │  Mapel   │  Kelas   │  Siswa    │
├──────────┼──────────┼──────────┼───────────┤
│  Jurnal  │  Nilai   │ [Coming] │ [Coming]  │
└──────────┴──────────┴──────────┴───────────┘
```

## Testing

Untuk memverifikasi perubahan:

1. **Restart aplikasi:**
   ```bash
   .\restart.bat
   # atau
   npm start
   ```

2. **Buka browser:** `http://localhost:3000`

3. **Verifikasi:**
   - ✅ Statistik cards muncul dalam urutan baru
   - ✅ Menu navigation cards muncul dalam urutan baru
   - ✅ Semua link berfungsi dengan benar
   - ✅ Icon dan warna tetap konsisten

## Konsistensi Data

Pastikan semua statistik terisi dengan benar:
- `stats.totalGuru` - Jumlah guru dari tabel `guru`
- `stats.totalMapel` - Jumlah mapel dari tabel `mata_pelajaran`
- `stats.totalKelas` - Jumlah kelas dari tabel `kelas`
- `stats.totalSiswa` - Jumlah siswa dari tabel `siswa`
- `stats.totalJurnal` - Jumlah jurnal dari tabel `jurnal_guru`
- `stats.totalNilai` - Jumlah nilai dari tabel `nilai`

Semua data ini sudah dikumpulkan di middleware stats pada [`app.js`](file://d:\SISTEMINFORMASI\app.js).

## Manfaat Perubahan

✅ **Alur Lebih Logis**: Mengikuti proses pendidikan dari guru ke penilaian
✅ **Navigasi Intuitif**: Pengguna dapat menemukan menu dengan lebih mudah
✅ **Konsistensi Visual**: Statistics dan menu cards memiliki urutan yang sama
✅ **User Experience**: Alur kerja yang lebih natural untuk administrator sekolah

## Rollback (Jika Diperlukan)

Jika ingin mengembalikan ke urutan lama, cukup tukar kembali posisi div elements di [`views/index.ejs`](file://d:\SISTEMINFORMASI\views\index.ejs) sesuai urutan sebelumnya.

---

**Status:** ✅ Completed  
**Impact:** Low (UI change only, no functional changes)
