# Sistem Informasi Akademik - SMA Negeri 12 Pontianak

Sistem Informasi Akademik adalah aplikasi berbasis web yang dibuat untuk membantu pengelolaan data akademik di SMA Negeri 12 Pontianak. Aplikasi ini menyediakan fitur-fitur penting seperti manajemen data siswa, guru, kelas, mata pelajaran, jurnal guru, nilai, dan absensi siswa.

## Fitur Utama

- **Manajemen Pengguna**: Sistem otentikasi berbasis peran (super_admin, admin, guru, siswa)
- **Manajemen Siswa**: CRUD data siswa, termasuk impor dari Excel
- **Manajemen Guru**: CRUD data guru
- **Manajemen Kelas**: Pembuatan dan pengelolaan kelas
- **Manajemen Mata Pelajaran**: Penambahan dan pengelolaan mata pelajaran
- **Manajemen Jurnal Guru**: Pencatatan aktivitas pembelajaran harian
- **Manajemen Nilai**: Input dan monitoring nilai siswa
- **Manajemen Absensi**: Pencatatan kehadiran siswa
- **Dashboard**: Statistik dan informasi penting dalam satu tampilan

## Teknologi yang Digunakan

- **Backend**: Node.js dengan framework Express.js
- **Database**: SQLite3
- **ORM**: Sequelize
- **Template Engine**: EJS
- **Frontend**: HTML, CSS, JavaScript vanilla
- **File Processing**: XLSX untuk impor ekspor Excel
- **Autentikasi**: BcryptJS untuk hashing password

## Prasyarat

Pastikan sistem Anda telah terinstall:

- [Node.js](https://nodejs.org/) (versi 18 atau lebih baru)
- [npm](https://www.npmjs.com/) atau [yarn](https://yarnpkg.com/)

## Instalasi

1. Clone repositori ini:
   ```bash
   git clone https://github.com/cepoyanoh/sisteminformasisma.git
   cd sisteminformasisma
   ```

2. Install dependensi:
   ```bash
   npm install
   ```

3. Buat file konfigurasi environment:
   ```bash
   cp .env.example .env
   ```
   
   Lalu sesuaikan variabel lingkungan di file [.env](file:///d%3A/SISTEMINFORMASIoke/.env) sesuai kebutuhan.

4. Jalankan aplikasi:
   ```bash
   npm start
   ```
   
   Atau untuk mode development (dengan nodemon):
   ```bash
   npm run dev
   ```

Aplikasi akan berjalan di `http://localhost:3000`.

## Struktur Proyek

```
sisteminformasisma/
├── app.js                    # File utama aplikasi
├── config/
│   └── dbConfig.js         # Konfigurasi database
├── models/                 # Model-model data
│   ├── Absensi.js
│   ├── Guru.js
│   ├── JurnalGuru.js
│   ├── Kelas.js
│   ├── MataPelajaran.js
│   ├── Nilai.js
│   ├── Siswa.js
│   └── User.js
├── routes/                 # File-file routing
│   ├── absensi.js
│   ├── auth.js
│   ├── guru.js
│   ├── jurnal.js
│   ├── kelas.js
│   ├── mapel.js
│   ├── nilai.js
│   └── siswa.js
├── public/                 # File statis (CSS, JS client, gambar)
├── views/                  # Template EJS (tidak ditampilkan dalam struktur ini)
├── package.json
└── README.md
```

## Kontribusi

Kontribusi sangat diterima! Silakan ikuti langkah-langkah berikut:

1. Fork repositori
2. Buat branch fitur Anda (`git checkout -b feature/NamaFitur`)
3. Commit perubahan Anda (`git commit -m 'Add some NameFeature'`)
4. Push ke branch (`git push origin feature/NamaFitur`)
5. Buat Pull Request

## Lisensi

Proyek ini dilisensikan di bawah lisensi MIT - lihat file [LICENSE](file:///d%3A/SISTEMINFORMASIoke/LICENSE) untuk detailnya.

## Dukungan

Jika Anda mengalami masalah atau memiliki pertanyaan, silakan buka issue di repositori ini.