# Fitur Generate Akun Otomatis

## 📋 Overview
Sistem sekarang memiliki fitur untuk **membuat username dan password secara otomatis** untuk semua guru dan siswa:

- **Guru**: Username dan Password menggunakan **NIP** (Nomor Induk Pegawai)
- **Siswa**: Username dan Password menggunakan **NISN** (Nomor Induk Siswa Nasional)

## 🚀 Cara Menggunakan

### Metode 1: Melalui Web Interface (Recommended)

1. **Login** sebagai **Super Admin**
2. Buka menu **"Manajemen User"**
3. Klik tombol **"Generate Akun"** (dropdown hijau)
4. Pilih salah satu opsi:
   - **Generate Akun Guru** - Buat akun untuk semua guru
   - **Generate Akun Siswa** - Buat akun untuk semua siswa
   - **Generate Semua Akun** - Buat akun untuk semua guru dan siswa sekaligus

### Metode 2: Melalui Command Line

#### Generate semua akun sekaligus:
```bash
node generate_all_users.js
```

#### Generate akun untuk satu guru:
```bash
node generate_guru_user.js <guru_id>
```
Contoh:
```bash
node generate_guru_user.js 1
```

#### Generate akun untuk satu siswa:
```bash
node generate_siswa_user.js <siswa_id>
```
Contoh:
```bash
node generate_siswa_user.js 1
```

##  Format Username & Password

### Guru
| Field | Value |
|-------|-------|
| **Username** | NIP (contoh: `198701012010011001`) |
| **Password** | NIP (contoh: `198701012010011001`) |
| **Role** | Guru |

### Siswa
| Field | Value |
|-------|-------|
| **Username** | NISN (contoh: `0012345678`) |
| **Password** | NISN (contoh: `0012345678`) |
| **Role** | Siswa |

## ✅ Fitur Keamanan

1. **Idempotent**: Script hanya membuat akun untuk guru/siswa yang belum memiliki akun
   - Jika akun sudah ada, akan di-skip dan tidak membuat duplikat
   
2. **Validasi Data**:
   - Guru harus memiliki NIP
   - Siswa harus memiliki NISN
   - Jika tidak ada, akan muncul error message
   
3. **Password Hashing**: Semua password tetap di-hash menggunakan bcrypt

4. **Confirmation**: Semua operasi generate memerlukan konfirmasi sebelum dijalankan

## 📊 Contoh Output

### Via Command Line:
```
🚀 Generating user accounts for all Guru and Siswa...

📋 Credentials:
   Guru: Username & Password = NIP
   Siswa: Username & Password = NISN

📝 Generating Guru accounts...

✅ Guru accounts:
   Total: 25
   Created: 20
   Skipped: 5

   Details:
   ✅ Ana Sri Sayekti Matofani - Username: 197208162005012000
   ✅ Anggit Hernowo - Username: 199608062024211000
   ⏭️  Arief Rachmat Pratama - User sudah ada untuk guru ini
   ✅ Bernadus Beltsazar - Username: 198810262024211000
   ...

============================================================

📝 Generating Siswa accounts...

✅ Siswa accounts:
   Total: 150
   Created: 145
   Skipped: 5
   ...

 GENERATION COMPLETE!

📊 Summary:
   Total accounts created: 165
   - Guru: 20
   - Siswa: 145
   Already exist: 10
   Errors: 0

🔐 Login Instructions:
   Guru: Use NIP as username and password
   Siswa: Use NISN as username and password

⚠️  IMPORTANT:
   Advise all teachers and students to change their passwords after first login!
```

### Via Web Interface:
Setelah klik "Generate Semua Akun", akan muncul flash message:
```
✅ Berhasil membuat 165 akun baru (20 guru, 145 siswa). 10 sudah memiliki akun
```

##  Rekomendasi Keamanan

### ️ PENTING: Setelah Generate Akun

1. **Informasikan ke Guru dan Siswa**:
   - Berikan username dan password mereka
   - Username = NIP (untuk guru) atau NISN (untuk siswa)
   - Password sama dengan username

2. **Wajib Ganti Password**:
   - Sarankan semua user untuk **segera mengganti password** setelah login pertama
   - Guru/Siswa dapat mengganti password melalui menu Edit Profile (jika tersedia)
   - Atau Super Admin dapat membantu reset password melalui Manajemen User

3. **Backup Database**:
   - Backup database sebelum dan sesudah generate akun
   - Simpan backup di tempat yang aman

4. **Monitoring**:
   - Pantau login attempts
   - Cek apakah ada user yang tidak bisa login (kemungkinan NIP/NISN salah)

##  Troubleshooting

### Error: "Guru tidak memiliki NIP"
**Solusi**: 
- Update data guru dengan menambahkan NIP
- Atau buat user manual melalui form "Tambah User"

### Error: "Siswa tidak memiliki NISN"
**Solusi**:
- Update data siswa dengan menambahkan NISN
- Atau buat user manual melalui form "Tambah User"

### Akun tidak bisa login
**Kemungkinan**:
- NIP/NISN salah atau tidak sesuai dengan yang terdaftar
- User sudah di-suspend (nonaktif)
- Password sudah diganti oleh user lain

**Solusi**:
- Cek data di tabel `guru` atau `siswa`
- Cek status user di tabel `users` (is_active harus = 1)
- Reset password melalui form Edit User

## 📝 Catatan Penting

1. **Data Guru dan Siswa harus lengkap**:
   - Guru harus memiliki NIP
   - Siswa harus memiliki NISN
   - Jika tidak ada, akun tidak bisa dibuat otomatis

2. **Script bersifat Idempotent**:
   - Aman untuk dijalankan berulang kali
   - Tidak akan membuat akun duplikat
   - Hanya membuat akun untuk yang belum ada

3. **Password Default**:
   - Password sama dengan username (NIP/NISN)
   - Sangat direkomendasikan untuk diganti setelah login pertama

4. **Role Assignment**:
   - Guru otomatis mendapatkan role "guru"
   - Siswa otomatis mendapatkan role "siswa"
   - Link ke data guru/siswa sudah otomatis dibuat

##  Workflow Lengkap

```
1. Pastikan data Guru dan Siswa lengkap
   ↓
2. Jalankan generate_all_users.js ATAU klik "Generate Semua Akun"
   ↓
3. Sistem membuat akun dengan NIP/NISN sebagai username & password
   ↓
4. Berikan credentials ke masing-masing guru/siswa
   ↓
5. User login dengan NIP/NISN
   ↓
6. User mengganti password (recommended)
   ↓
7. User mulai menggunakan sistem sesuai role
```