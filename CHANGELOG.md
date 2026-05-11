# Changelog

Semua perubahan penting pada proyek Sistem Informasi Akademik ini akan didokumentasikan di file ini.

## [Versi 1.0.0] - 2024

### Ditambahkan
- Sistem login berbasis peran (super_admin, admin, guru, siswa)
- Manajemen data siswa termasuk impor dari Excel
- Manajemen data guru
- Manajemen kelas
- Manajemen mata pelajaran
- Manajemen jurnal guru
- Manajemen nilai siswa
- Manajemen absensi siswa
- Dashboard dengan statistik data
- Sistem pencarian dan filter data
- Sistem impor data Excel untuk guru dan siswa
- Sistem sinkronisasi jumlah siswa per kelas
- Fitur rekap absensi harian dan bulanan
- Fitur tombol kembali ke dashboard
- Sistem validasi duplikasi data siswa
- Perbaikan tampilan data alpha (α) menjadi "Tidak Hadir"

### Diperbaiki
- Permasalahan penyimpanan data guru
- Permasalahan penyimpanan mata pelajaran
- Tampilan data alpha (α) yang tidak sesuai
- Masalah tabel nilai
- Peringatan saat impor data tidak muncul
- Masalah port sudah digunakan
- Tampilan statistik siswa

### Diubah
- Struktur database untuk menyederhanakan relasi
- Mengganti semua kemunculan kata "alpa" menjadi "alpha"
- Menyesuaikan struktur tabel untuk menyimpan data guru_pengampu di mata pelajaran
- Memperbaiki tampilan tombol status absensi
- Mengizinkan satu mata pelajaran untuk diajarkan di banyak kelas
- Menyesuaikan urutan menu di dashboard