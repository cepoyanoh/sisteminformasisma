# Fitur Input Nilai - Sistem Informasi Akademik

## Ringkasan
Fitur Input Nilai telah berhasil ditambahkan ke dalam sistem informasi akademik SMA Negeri 12 Pontianak. Fitur ini memungkinkan pengguna (Tata Usaha dan Guru) untuk mengelola nilai siswa dengan dua jenis penilaian: **Formatif** dan **Sumatif**.

## Struktur Database

### Tabel: `nilai`
```sql
CREATE TABLE nilai (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  siswa_id INTEGER NOT NULL,
  mapel_id INTEGER NOT NULL,
  guru_id INTEGER NOT NULL,
  kelas_id INTEGER NOT NULL,
  jenis_nilai VARCHAR(20) NOT NULL CHECK(jenis_nilai IN ('formatif', 'sumatif')),
  kategori VARCHAR(50) NOT NULL,
  nilai DECIMAL(5,2) NOT NULL CHECK(nilai >= 0 AND nilai <= 100),
  keterangan TEXT,
  tanggal_penilaian DATE NOT NULL,
  tahun_ajaran VARCHAR(20) NOT NULL,
  semester VARCHAR(10) NOT NULL CHECK(semester IN ('ganjil', 'genap')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (siswa_id) REFERENCES siswas(id) ON DELETE CASCADE,
  FOREIGN KEY (mapel_id) REFERENCES mata_pelajaran(id) ON DELETE CASCADE,
  FOREIGN KEY (guru_id) REFERENCES guru(id) ON DELETE CASCADE,
  FOREIGN KEY (kelas_id) REFERENCES kelas(id) ON DELETE CASCADE
);
```

## File yang Dibuat/Dimodifikasi

### 1. Model
- **File Baru**: `models/Nilai.js`
  - Method: `getAll()`, `getById()`, `create()`, `update()`, `delete()`
  - Method khusus: `getRataRata()`, `getByKelasAndMapel()`
  - Mendukung filter berdasarkan berbagai parameter

### 2. Routes
- **File Baru**: `routes/nilai.js`
  - `GET /nilai` - Menampilkan daftar nilai dengan filter
  - `GET /nilai/create` - Form tambah nilai baru
  - `POST /nilai` - Menyimpan nilai baru
  - `GET /nilai/:id/edit` - Form edit nilai
  - `PUT /nilai/:id` - Update nilai
  - `DELETE /nilai/:id` - Hapus nilai
  
### 3. Views
- **Direktori Baru**: `views/nilai/`
  - `index.ejs` - Halaman daftar nilai dengan filter
  - `create.ejs` - Form tambah nilai
  - `edit.ejs` - Form edit nilai

### 4. Aplikasi Utama
- **File Dimodifikasi**: `app.js`
  - Import model Nilai
  - Import routes nilai
  - Menambahkan akses `/nilai` untuk role guru
  - Menambahkan statistik totalNilai di middleware
  - Mendaftarkan routes `/nilai`

### 5. Dashboard
- **File Dimodifikasi**: `views/index.ejs`
  - Menambahkan card statistik Nilai
  - Menambahkan menu card Input Nilai
  - Menambahkan link di list fitur utama

### 6. Inisialisasi Database
- **File Baru**: `init_nilai_table.js`
  - Script untuk membuat tabel nilai jika belum ada

## Fitur Utama

### 1. Jenis Penilaian
- **Formatif**: Penilaian selama proses pembelajaran (untuk memantau perkembangan siswa)
- **Sumatif**: Penilaian hasil belajar di akhir periode (UH, UTS, UAS, dll)

### 2. Kategori Nilai
Pengguna dapat menentukan kategori nilai seperti:
- UH1, UH2, UH3 (Ulangan Harian)
- UTS (Ujian Tengah Semester)
- UAS (Ujian Akhir Semester)
- Tugas
- Dan kategori lainnya sesuai kebutuhan

### 3. Filter Data
Halaman daftar nilai dilengkapi dengan filter:
- Kelas
- Mata Pelajaran
- Jenis Nilai (Formatif/Sumatif)
- Tahun Ajaran
- Semester

### 4. Validasi Input
- Semua field wajib diisi kecuali keterangan
- Nilai harus berupa angka antara 0-100
- Jenis nilai harus formatif atau sumatif
- Semester harus ganjil atau genap
- Tanggal penilaian wajib diisi

### 5. Hak Akses
- **Tata Usaha**: Dapat mengelola semua nilai (create, read, update, delete)
- **Guru**: Hanya dapat mengelola nilai yang diinput oleh guru tersebut

### 6. Indikator Visual
- Badge warna berbeda untuk jenis nilai:
  - Formatif: Biru (info)
  - Sumatif: Hijau (success)
- Badge warna untuk rentang nilai:
  - ≥75: Hijau (baik)
  - 60-74: Kuning (cukup)
  - <60: Merah (kurang)

## Cara Penggunaan

### Untuk Tata Usaha:
1. Login dengan akun tata usaha
2. Klik menu "Input Nilai" di dashboard
3. Klik tombol "Tambah Nilai"
4. Isi form dengan data yang lengkap:
   - Pilih Siswa
   - Pilih Kelas
   - Pilih Mata Pelajaran
   - Pilih Guru (atau otomatis jika login sebagai guru)
   - Pilih Jenis Nilai (Formatif/Sumatif)
   - Isi Kategori (contoh: UH1, UTS, Tugas)
   - Masukkan Nilai (0-100)
   - Isi Tanggal Penilaian
   - Isi Tahun Ajaran (contoh: 2025/2026)
   - Pilih Semester (Ganjil/Genap)
   - Tambahkan Keterangan (opsional)
5. Klik "Simpan Nilai"

### Untuk Guru:
1. Login dengan akun guru
2. Klik menu "Input Nilai" di dashboard
3. Ikuti langkah yang sama seperti tata usaha
4. Field Guru akan otomatis terisi dan tidak dapat diubah
5. Guru hanya dapat mengedit/menghapus nilai yang diinput sendiri

### Filter Data:
1. Di halaman daftar nilai, gunakan form filter di bagian atas
2. Pilih kriteria filter yang diinginkan
3. Klik tombol "Filter"
4. Untuk reset filter, klik tombol "Reset"

### Edit Nilai:
1. Di daftar nilai, klik ikon pensil pada baris yang ingin diedit
2. Ubah data yang diperlukan
3. Klik "Update Nilai"

### Hapus Nilai:
1. Di daftar nilai, klik ikon trash pada baris yang ingin dihapus
2. Konfirmasi penghapusan
3. Data akan dihapus dari sistem

## Integrasi dengan Fitur Lain

### Relasi Database:
- **Siswa**: Setiap nilai terhubung ke satu siswa
- **Mata Pelajaran**: Nilai terkait dengan mata pelajaran tertentu
- **Guru**: Mencatat siapa guru yang memberikan nilai
- **Kelas**: Mengelompokkan nilai berdasarkan kelas

### Konsistensi Data:
- Foreign key constraints memastikan integritas data
- Cascade delete: Jika siswa/mapel/guru/kelas dihapus, nilai terkait juga akan dihapus

## Testing

Untuk menguji fitur ini:
1. Pastikan server berjalan: `npm run dev`
2. Buka browser: `http://localhost:3000`
3. Login dengan akun tata usaha atau guru
4. Navigasi ke menu "Input Nilai"
5. Coba tambah, edit, dan hapus nilai

## Catatan Penting

1. **Inisialisasi Database**: Jalankan `node init_nilai_table.js` sebelum menggunakan fitur ini untuk pertama kalinya
2. **Data Master**: Pastikan data Siswa, Mata Pelajaran, Guru, dan Kelas sudah ada sebelum input nilai
3. **Backup**: Selalu backup database sebelum melakukan operasi massal
4. **Validasi**: Sistem akan menolak input nilai di luar rentang 0-100

## Pengembangan Selanjutnya

Fitur yang dapat ditambahkan di masa depan:
- Export nilai ke Excel/PDF
- Perhitungan rata-rata otomatis per siswa
- Rekap nilai per semester
- Grafik perkembangan nilai
- Import nilai dari Excel
- Predikat otomatis (A, B, C, D, E)
- Remedial tracking
