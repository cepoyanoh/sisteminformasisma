# Fitur Filter dan Batch Delete di Manajemen User

## 📋 Overview
Halaman Manajemen User kini dilengkapi dengan dua fitur baru untuk mempermudah pengelolaan user:

1. **Filter berdasarkan Role** - Filter user berdasarkan role mereka
2. **Checkbox Batch Delete** - Hapus multiple user sekaligus dengan checkbox

## 🎯 Fitur 1: Filter berdasarkan Role

### Cara Menggunakan:
1. Buka menu **"Manajemen User"**
2. Di bagian atas tabel, terdapat dropdown **"Filter berdasarkan Role"**
3. Pilih role yang ingin difilter:
   - **Semua Role** - Tampilkan semua user
   - **Tata Usaha (Super Admin)** - Hanya tampilkan super admin
   - **Admin** - Hanya tampilkan admin
   - **Guru** - Hanya tampilkan guru
   - **Siswa** - Hanya tampilkan siswa

4. Untuk menghapus filter, klik tombol **X** atau pilih "Semua Role"

### Visual:
```
─────────────────────────────────────────────────────┐
│ Filter berdasarkan Role:                            │
│                                                     │
│ [Semua Role ▼]  [X]                                │
│                                                     │
│ └─ Semua Role (default)                            │
│ └─ Tata Usaha (Super Admin)                        │
│ └─ Admin                                           │
│ └─ Guru                                            │
│ ─ Siswa                                           │
└─────────────────────────────────────────────────────┘
```

### Kapan Menggunakan Filter:
- Saat ingin melihat semua guru yang memiliki akun
- Saat ingin mencari siswa tertentu
- Saat ingin mengelola user berdasarkan role tertentu
- Saat data user sudah banyak dan perlu difilter

## 🎯 Fitur 2: Checkbox Batch Delete

### Cara Menggunakan:

#### Hapus Multiple User:
1. Buka menu **"Manajemen User"**
2. Centang checkbox di kolom pertama untuk memilih user:
   - Centang satu per satu
   - Atau klik **"Pilih Semua"** untuk memilih semua user di halaman
3. Klik tombol **"Hapus Terpilih"** (merah) di bagian atas tabel
4. Konfirmasi penghapusan
5. User terpilih akan dihapus permanen dari database

#### Visual:
```
┌─────────────────────────────────────────────────────────────────┐
│ ☑ Pilih Semua                                    [Hapus Terpilih (3)] │
├─────┬──────────────┬──────┬────────────┬────────┬──────────────
│  ☑  │ No │ Username │ Role │ Nama       │ Status │ Aksi         │
├─────┼────┼──────────┼──────┼────────────┼────────┼──────────────┤
│  ☑  │ 1  │ 1972...  │ Guru │ Ana Sri... │ Aktif  │ Edit | Hapus│
│  ☑  │ 2  │ 0012...  │ Siswa│ Budi...    │ Aktif  │ Edit | Hapus│
│     │ 3  │ 1988...  │ Guru │ Dini...    │ Aktif  │ Edit | Hapus│
│  ☑  │ 4  │ 0015...  │ Siswa│ Eka...     │ Aktif  │ Edit | Hapus│
─────┴────┴──────────┴──────┴────────────┴────────┴──────────────┘
```

### Tombol "Hapus Terpilih":
- **Disabled** (abu-abu) jika tidak ada user yang dipilih
- **Enabled** (merah) jika ada minimal 1 user yang dipilih
- Menampilkan jumlah user yang dipilih: `Hapus Terpilih (3)`

### Konfirmasi Penghapusan:
Sebelum menghapus, sistem akan menampilkan konfirmasi:
```
⚠️ PERINGATAN: 3 user akan DIHAPUS PERMANEN dari database!

Tindakan ini tidak dapat dibatalkan.

Yakin ingin menghapus 3 user terpilih?

[ Batal ]  [ OK ]
```

### After Delete:
Setelah penghapusan berhasil:
```
✅ Berhasil menghapus 3 user
```

## 🔐 Keamanan & Pembatasan

### Untuk Super Admin:
- ✅ Bisa menghapus semua role (admin, guru, siswa)
- ✅ Tidak bisa menghapus akun dirinya sendiri
- ✅ Bisa menggunakan filter dan batch delete tanpa batasan

### Untuk Admin:
- ✅ Bisa menghapus hanya user dengan role **Guru**
- ❌ Tidak bisa menghapus user dengan role Super Admin, Admin, atau Siswa
- ✅ Bisa menggunakan filter dan batch delete (hanya untuk guru)

### Validasi Penghapusan:
1. **Super Admin tidak bisa hapus diri sendiri**
   - Error: "Anda tidak dapat menghapus akun Anda sendiri"

2. **Admin hanya bisa hapus guru**
   - Error: "Admin hanya dapat menghapus akun guru. Hapus hanya user dengan role Guru."

3. **Tidak bisa hapus protected roles (oleh admin)**
   - Error: "Tidak dapat menghapus user dengan role Super Admin atau Admin"

4. **Minimal 1 user harus dipilih**
   - Alert: "Pilih minimal satu user untuk dihapus"

## 📊 Fitur Interaktif

### Checkbox "Pilih Semua":
- Klik checkbox di header tabel untuk memilih/lepas semua checkbox
- Semua checkbox di tabel akan tercentang/terlepas sesuai status

### Counter Dinamis:
- Jumlah user terpilih ditampilkan real-time
- Tombol "Hapus Terpilih" aktif/nonaktif otomatis
- Warna tombol berubah sesuai status (abu-abu → merah)

### JavaScript Functions:
```javascript
toggleSelectAll(source)    // Centang/lepas semua checkbox
updateSelectedCount()      // Update counter dan tombol
confirmBatchDelete()       // Tampilkan konfirmasi sebelum hapus
```

##  Contoh Penggunaan

### Scenario 1: Hapus Semua Akun Siswa yang Lulus
```
1. Filter: Pilih "Siswa"
2. Centang semua checkbox siswa yang lulus
3. Klik "Hapus Terpilih (25)"
4. Konfirmasi
5. ✅ Berhasil menghapus 25 user
```

### Scenario 2: Hapus Akun Guru yang Pindah
```
1. Filter: Pilih "Guru"
2. Cari guru yang pindah
3. Centang checkbox guru yang bersangkutan
4. Klik "Hapus Terpilih (3)"
5. Konfirmasi
6. ✅ Berhasil menghapus 3 user
```

### Scenario 3: Filter untuk Melihat Semua Admin
```
1. Filter: Pilih "Admin"
2. Lihat daftar semua admin
3. Evaluasi siapa saja yang memiliki akses admin
4. (Opsional) Hapus admin yang tidak diperlukan
```

## 🎨 UI/UX Improvements

### Filter Section:
- Card terpisah untuk filter
- Auto-submit saat memilih role
- Tombol X untuk reset filter
- Label yang jelas dengan icon

### Batch Delete Section:
- Checkbox di setiap baris
- "Pilih Semua" di header
- Counter dinamis di tombol
- Warna berubah sesuai status
- Konfirmasi yang jelas

### Responsive Design:
- Tabel responsive untuk mobile
- Checkbox tetap mudah diklik
- Tombol tetap accessible

##  Best Practices

1. **Gunakan Filter** saat data sudah banyak
   - Mempermudah mencari user tertentu
   - Menghindari kesalahan hapus

2. **Review Sebelum Hapus**
   - Pastikan user yang dipilih benar
   - Cek role user sebelum hapus

3. **Backup Database**
   - Backup sebelum batch delete
   - Data yang dihapus tidak bisa dikembalikan

4. **Informasi ke User**
   - Beritahu user yang akan dihapus
   - Pastikan tidak ada data penting yang terkait

##  Troubleshooting

### Checkbox tidak muncul?
- Refresh halaman
- Clear browser cache
- Cek console untuk error

### Tombol "Hapus Terpilih" disabled?
- Pastikan minimal 1 user tercentang
- Cek apakah checkbox berfungsi

### Filter tidak bekerja?
- Pastikan URL parameter `?role=` ada
- Cek console untuk error
- Refresh halaman

### Error saat hapus?
- Cek apakah Anda memiliki permission
- Cek apakah user yang dihapus valid
- Lihat error message untuk detail

##  Integration with Existing Features

Fitur ini bekerja seamless dengan fitur existing:

1. **Generate Akun**: Tetap bisa generate akun dengan filter aktif
2. **Edit User**: Edit tetap berfungsi normal
3. **Delete Single**: Delete individual tetap tersedia
4. **Create User**: Form create user tidak terpengaruh

##  Code Changes

### Files Modified:
1. **routes/auth.js**
   - Added filter parameter to GET /users route
   - Added POST /users/delete-batch route
   - Added db import for SQL queries

2. **views/auth/users/index.ejs**
   - Added filter dropdown section
   - Added checkbox column to table
   - Added "Pilih Semua" checkbox
   - Added "Hapus Terpilih" button
   - Added JavaScript functions for interactivity

### New Features:
- Filter by role (dropdown)
- Select all checkbox
- Individual checkboxes per row
- Dynamic counter
- Batch delete with confirmation
- Role-based restrictions