# Dokumentasi Sistem Informasi Akademik

## Gambaran Umum

Sistem Informasi Akademik adalah aplikasi berbasis web yang dirancang untuk membantu pengelolaan data akademik di SMA Negeri 12 Pontianak. Aplikasi ini mencakup berbagai aspek administrasi pendidikan seperti manajemen siswa, guru, kelas, mata pelajaran, penilaian, dan absensi.

## Arsitektur Aplikasi

Aplikasi ini menggunakan arsitektur berbasis Node.js dengan pola MVC (Model-View-Controller) yang dimodifikasi:

- **Model** (di direktori [models/](file:///d%3A/SISTEMINFORMASIoke/models)): Menyediakan lapisan abstraksi untuk berinteraksi dengan database SQLite
- **Controller** (di direktori [routes/](file:///d%3A/SISTEMINFORMASIoke/routes)): Menangani logika bisnis dan permintaan dari pengguna
- **View** (template EJS): Menyajikan antarmuka pengguna yang dihasilkan secara dinamis

## Struktur Direktori

```
sisteminformasisma/
├── app.js                    # File utama aplikasi
├── config/
│   └── dbConfig.js         # Konfigurasi dan inisialisasi database
├── models/                 # Definisi model data
│   ├── Absensi.js          # Model data absensi siswa
│   ├── Guru.js             # Model data guru
│   ├── JurnalGuru.js       # Model data jurnal harian guru
│   ├── Kelas.js            # Model data kelas
│   ├── MataPelajaran.js    # Model data mata pelajaran
│   ├── Nilai.js            # Model data nilai siswa
│   ├── Siswa.js            # Model data siswa
│   └── User.js             # Model data pengguna
├── routes/                 # File routing untuk endpoint API
│   ├── absensi.js          # Endpoint untuk manajemen absensi
│   ├── auth.js             # Endpoint untuk autentikasi
│   ├── guru.js             # Endpoint untuk manajemen guru
│   ├── jurnal.js           # Endpoint untuk manajemen jurnal guru
│   ├── kelas.js            # Endpoint untuk manajemen kelas
│   ├── mapel.js            # Endpoint untuk manajemen mata pelajaran
│   ├── nilai.js            # Endpoint untuk manajemen nilai
│   └── siswa.js            # Endpoint untuk manajemen siswa
├── public/                 # File statis (CSS, JS klien, gambar)
├── uploads/                # Tempat menyimpan file yang diunggah
├── views/                  # Template EJS (tidak disertakan dalam repositori ini)
├── check_*.js              # Skrip diagnosa untuk berbagai aspek aplikasi
├── init_*.js               # Skrip inisialisasi tabel dan data awal
├── fix_*.js                # Skrip perbaikan masalah umum
├── migrate_*.js            # Skrip migrasi data
├── package*.json           # Konfigurasi dependensi proyek
├── .env.example            # Contoh file konfigurasi environment
├── .gitignore              # File yang diabaikan oleh Git
├── README.md               # Dokumentasi utama proyek
└── DOCUMENTASI.md          # Dokumentasi arsitektur dan implementasi
```

## Konfigurasi Environment

File [.env](file:///d%3A/SISTEMINFORMASIoke/.env) digunakan untuk menyimpan variabel konfigurasi sensitif:

```
PORT=3000
SESSION_SECRET=sistemInformasiKurikulum2026
```

## Database

Aplikasi ini menggunakan SQLite sebagai basis datanya. Struktur tabel dibuat secara otomatis saat pertama kali aplikasi dijalankan melalui file [config/dbConfig.js](file:///d%3A/SISTEMINFORMASIoke/config/dbConfig.js).

## Skrip Utilitas

Aplikasi ini dilengkapi dengan berbagai skrip utilitas untuk membantu proses pengembangan dan pemeliharaan:

- [check_*.js](file:///d%3A/SISTEMINFORMASIoke/check_absensi_table.js): Skrip diagnosa untuk memeriksa berbagai aspek aplikasi
- [init_*.js](file:///d%3A/SISTEMINFORMASIoke/init_absensi_table.js): Skrip inisialisasi tabel dan data awal
- [fix_*.js](file:///d%3A/SISTEMINFORMASIoke/fix_alpa_simple.js): Skrip perbaikan masalah umum
- [migrate_*.js](file:///d%3A/SISTEMINFORMASIoke/migrate_absensi_add_mapel_guru.js): Skrip migrasi data

## Otentikasi dan Otorisasi

Aplikasi ini menerapkan sistem otentikasi berbasis sesi dengan peran pengguna berbeda:

- `super_admin`: Akses penuh ke semua fitur
- `admin`: Akses ke manajemen data utama (siswa, guru, kelas, dll.)
- `guru`: Akses ke fitur terkait pengajaran (jurnal, nilai)
- `siswa`: Akses ke data nilai miliknya sendiri

## Deployment

Untuk melakukan deployment aplikasi:

1. Clone repositori
2. Jalankan `npm install` untuk menginstal dependensi
3. Siapkan file [.env](file:///d%3A/SISTEMINFORMASIoke/.env) dengan konfigurasi yang sesuai
4. Jalankan `npm start` untuk memulai aplikasi