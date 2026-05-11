# Sistem Login dengan Role-Based Access Control

## 📋 Overview
Sistem login telah ditambahkan dengan 4 role berbeda:
1. **Super Admin (Tata Usaha)** - Akses penuh ke semua fitur
2. **Admin** - Dapat mengelola data master dan membuat akun guru
3. **Guru** - Dapat mengelola absensi, jurnal, dan nilai, serta membuat akun siswa
4. **Siswa** - Hanya dapat melihat nilai sendiri

## 🚀 Cara Setup

### 1. Inisialisasi Database
Jalankan script untuk membuat tabel users dan super admin default:
```bash
node init_users_table.js
```

Script ini akan:
- Membuat tabel `users` di database
- Membuat user super admin default dengan credentials:
  - **Username**: `tatausaha`
  - **Password**: `admin123`
  - **Role**: Super Admin (Tata Usaha)

### 2. Jalankan Server
```bash
npm start
```
atau
```bash
npm run dev
```

### 3. Login
Buka browser dan akses: `http://localhost:3000`

Anda akan diarahkan ke halaman login. Gunakan credentials super admin default untuk login pertama kali.

## 👥 Role dan Hak Akses

### Super Admin (Tata Usaha)
**Akses:**
- ✅ Data Guru (CRUD)
- ✅ Data Siswa (CRUD)
- ✅ Data Kelas (CRUD)
- ✅ Mata Pelajaran (CRUD)
- ✅ Absensi Siswa (CRUD)
- ✅ Jurnal Guru (CRUD)
- ✅ Input Nilai (CRUD)
- ✅ Manajemen User (Create/Edit/Delete semua role)

**Khusus:**
- Dapat membuat akun untuk semua role (super_admin, admin, guru, siswa)

### Admin
**Akses:**
- ✅ Data Guru (CRUD)
- ✅ Data Siswa (CRUD)
- ✅ Data Kelas (CRUD)
- ✅ Mata Pelajaran (CRUD)
- ✅ Absensi Siswa (CRUD)
- ✅ Jurnal Guru (CRUD)
- ✅ Input Nilai (CRUD)
- ✅ Manajemen User (hanya untuk role guru)

**Khusus:**
- Hanya dapat membuat akun untuk role **guru** saja

### Guru
**Akses:**
- ✅ Absensi Siswa (CRUD)
- ✅ Jurnal Guru (CRUD)
- ✅ Input Nilai (CRUD) - untuk kelas yang diajarnya
- ✅ Lihat Nilai Siswa

**Khusus:**
- Hanya dapat melihat dan mengelola data yang terkait dengan dirinya
- Dashboard menampilkan 3 menu utama: Absensi, Jurnal, Nilai

### Siswa
**Akses:**
- ✅ Lihat Nilai - hanya nilai siswa yang sedang login

**Khusus:**
- Tidak dapat mengedit atau menambah data
- Dashboard hanya menampilkan menu "Lihat Nilai Anda"
- Nilai yang ditampilkan hanya milik siswa tersebut

##  Keamanan

### Password
- Semua password di-hash menggunakan bcrypt dengan salt 10 rounds
- Password tidak pernah disimpan dalam plain text

### Session
- Session management menggunakan express-session
- Session timeout: 24 jam
- Auto redirect ke login jika session expired

### Authorization
- Middleware `requireAuth` memastikan user sudah login
- Middleware `requireRole` membatasi akses berdasarkan role
- Setiap route dilindungi dengan role-based access control

## 📝 Manajemen User

### Super Admin dapat:
1. Membuat user untuk semua role
2. Edit semua user
3. Delete semua user
4. Aktifkan/nonaktifkan user

### Admin dapat:
1. Membuat user hanya untuk role guru
2. Edit user guru
3. Delete user guru

### Cara Membuat User:
1. Login sebagai Super Admin atau Admin
2. Klik menu "Manajemen User"
3. Klik tombol "Tambah User"
4. Isi form:
   - **Username**: Username untuk login
   - **Password**: Password untuk login (minimal 6 karakter)
   - **Role**: Pilih role (super_admin, admin, guru, siswa)
   - **Pilih Guru**: Untuk role guru, pilih guru yang terkait
   - **Pilih Siswa**: Untuk role siswa, pilih siswa yang terkait
5. Klik "Simpan User"

## 🔄 Mengaktifkan Kembali User yang Di-Suspend

Jika user telah di-suspend (dinonaktifkan) dan ingin diaktifkan kembali:

1. Login sebagai Super Admin atau Admin
2. Klik menu **"Manajemen User"**
3. Cari user yang statusnya **"Nonaktif"** (badge abu-abu)
4. Klik tombol **"Edit"** pada user tersebut
5. Pada form edit, ubah **Status Akun** dari "Nonaktif (Suspend)" menjadi **"Aktif"**
6. Klik **"Update User"**
7. User sekarang dapat login kembali

## ⚠️ Important Notes

1. **Ganti Password Default**: Segera ganti password super admin setelah login pertama kali
2. **Backup Database**: Backup database secara berkala untuk menghindari kehilangan data
3. **Session Security**: Pastikan SESSION_SECRET diubah di production environment
4. **User Association**: 
   - User role guru harus di-associated dengan data guru yang sudah ada
   - User role siswa harus di-associated dengan data siswa yang sudah ada
5. **Hard Delete**: Tombol "Hapus" pada manajemen user akan **benar-benar menghapus akun dari database** secara permanen. Tindakan ini tidak dapat dibatalkan!
6. **Suspend Account**: Gunakan fitur "Nonaktif (Suspend)" pada form edit untuk menonaktifkan user sementara tanpa menghapus data

## 🔧 Troubleshooting

### Lupa Password?
Jika lupa password, Anda perlu:
1. Akses database SQLite langsung
2. Atau hubungi developer untuk reset password

### Session Expired?
- Session timeout setelah 24 jam tidak aktif
- Login kembali untuk mendapatkan session baru

### Error "Tabel users tidak ada"?
Jalankan: `node init_users_table.js`

## 📊 Flow Login

1. User mengakses aplikasi → Redirect ke `/login`
2. User input username dan password
3. Sistem verifikasi credentials
4. Jika valid → Set session dan redirect ke dashboard
5. Dashboard menampilkan menu berdasarkan role user
6. User logout → Session destroyed → Redirect ke `/login`

##  Role Hierarchy

```
Super Admin (Tata Usaha)
├── Dapat membuat: Admin, Guru, Siswa
└── Akses penuh semua fitur

Admin
├── Dapat membuat: Guru
└── Akses penuh semua fitur (kecuali manajemen super admin)

Guru
├── Dapat membuat: (tidak ada)
└── Akses: Absensi, Jurnal, Nilai

Siswa
├── Dapat membuat: (tidak ada)
└── Akses: Lihat Nilai sendiri
```