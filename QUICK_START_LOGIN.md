#  Quick Start - Sistem Login

## Langkah-langkah untuk memulai:

### 1. ✅ Inisialisasi Sistem Login (Sudah Selesai)
Tabel users dan super admin default sudah dibuat.

### 2. 🎯 Login Pertama Kali
1. Jalankan server:
   ```bash
   npm start
   ```
   atau
   ```bash
   npm run dev
   ```

2. Buka browser dan akses: **http://localhost:3000**

3. Anda akan diarahkan ke halaman login

4. Gunakan credentials default:
   - **Username**: `tatausaha`
   - **Password**: `admin123`

5. Klik **Login**

### 3.  Dashboard Super Admin
Setelah login, Anda akan melihat dashboard dengan akses penuh ke semua fitur:
- Data Guru
- Data Siswa
- Data Kelas
- Mata Pelajaran
- Absensi
- Jurnal
- Nilai
- **Manajemen User** ← Fitur baru untuk membuat user lain

### 4. 👥 Membuat User Lain

#### Membuat Akun Guru:
1. Klik menu **"Manajemen User"**
2. Klik tombol **"Tambah User"**
3. Isi form:
   - Username: (contoh: `guru1`)
   - Password: (contoh: `guru123`)
   - Role: Pilih **Guru**
   - Pilih Guru: Pilih nama guru dari dropdown
4. Klik **"Simpan User"**

#### Membuat Akun Siswa:
1. Klik menu **"Manajemen User"**
2. Klik tombol **"Tambah User"**
3. Isi form:
   - Username: (contoh: `siswa1`)
   - Password: (contoh: `siswa123`)
   - Role: Pilih **Siswa**
   - Pilih Siswa: Pilih nama siswa dari dropdown
4. Klik **"Simpan User"**

### 5. 🎨 Role-Based Dashboard

#### Dashboard Super Admin & Admin:
- Menampilkan semua statistik
- Akses ke semua fitur
- Menu Manajemen User

#### Dashboard Guru:
- Menampilkan 3 menu: Absensi, Jurnal, Nilai
- Hanya dapat mengelola data terkait dirinya

#### Dashboard Siswa:
- Menampilkan 1 menu: Lihat Nilai
- Hanya dapat melihat nilai sendiri

### 6. 🔐 Keamanan

**PENTING**: Segera ganti password default setelah login pertama kali!

Cara ganti password:
1. Login sebagai super admin
2. Klik **Manajemen User**
3. Edit user `tatausaha`
4. Masukkan password baru
5. Klik **Update User**

## 📊 Ringkasan Role

| Role | Buat User | Akses Menu |
|------|-----------|------------|
| **Super Admin (Tata Usaha)** | Semua role | Semua fitur |
| **Admin** | Hanya guru | Semua fitur |
| **Guru** | Tidak ada | Absensi, Jurnal, Nilai |
| **Siswa** | Tidak ada | Hanya lihat nilai sendiri |

## ️ Troubleshooting

### Tidak bisa login?
- Pastikan username dan password benar
- Cek apakah user masih aktif
- Restart server jika diperlukan

### Halaman kosong setelah login?
- Clear browser cache
- Cek console browser untuk error
- Pastikan database tidak corrupt

### Session expired?
- Login kembali
- Session timeout setelah 24 jam

## 🎉 Selamat Menggunakan!

Sistem login dengan role-based access control sudah siap digunakan. 
Setiap role hanya dapat mengakses fitur sesuai dengan hak aksesnya.