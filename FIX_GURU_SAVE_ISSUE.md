# Perbaikan Masalah Penyimpanan Data Guru

## Tanggal Perbaikan
**2026-04-07**

## Masalah yang Dilaporkan
User melaporkan **"tidak bisa menyimpan data guru"** - form submit tidak memberikan feedback apapun kepada user apakah data berhasil disimpan atau gagal.

## Analisis Masalah

### Penyebab Utama:
1. **Tidak ada validasi input** di route handler
2. **Tidak ada flash messages** untuk memberikan feedback ke user
3. **Error handling minimal** - hanya console.error tanpa penjelasan detail
4. **Tidak ada logging** untuk debugging

### Gejala:
- User mengisi form dan klik "Simpan"
- Tidak ada pesan sukses atau error yang muncul
- User tidak tahu apakah data tersimpan atau tidak
- Jika ada error, hanya terlihat di console server, tidak di UI

## Solusi yang Diterapkan

### 1. Update Route Handler (`routes/guru.js`)

#### A. Route POST `/guru/tambah`
**Perubahan:**
```javascript
// ✅ Tambahan Validasi Input
if (!nip || !nama_guru || !jenis_kelamin) {
  req.flash('error', 'NIP, Nama Guru, dan Jenis Kelamin wajib diisi!');
  return res.redirect('/guru/tambah');
}

// ✅ Logging untuk debugging
console.log('📝 Menerima data guru baru:', { nip, nama_guru, jenis_kelamin });

// ✅ Error handling spesifik
if (err.message.includes('UNIQUE constraint failed')) {
  if (err.message.includes('nip')) {
    req.flash('error', 'NIP sudah terdaftar! Gunakan NIP yang berbeda.');
  } else if (err.message.includes('email')) {
    req.flash('error', 'Email sudah terdaftar! Gunakan email yang berbeda.');
  }
}

// ✅ Flash message sukses
req.flash('success', `Data guru "${nama_guru}" berhasil ditambahkan!`);
```

#### B. Route POST `/guru/edit/:id`
**Perubahan serupa dengan tambah:**
- Validasi input wajib
- Logging proses update
- Error handling untuk UNIQUE constraint
- Flash messages untuk feedback user

### 2. Update Views

#### A. `views/guru/tambah.ejs`
**Penambahan:**
```html
<!-- Flash Messages Display -->
<% if (typeof success !== 'undefined' && success.length > 0) { %>
  <div class="alert alert-success alert-dismissible fade show">
    <%= success %>
    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
  </div>
<% } %>

<% if (typeof error !== 'undefined' && error.length > 0) { %>
  <div class="alert alert-danger alert-dismissible fade show">
    <%= error %>
    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
  </div>
<% } %>
```

**Peningkatan UI:**
- Menambahkan indikator field wajib (*)
- Placeholder text untuk guidance
- Helper text di bawah field
- Icons pada tombol

#### B. `views/guru/edit.ejs`
**Penambahan yang sama dengan tambah.ejs**

#### C. `views/guru/index.ejs`
**Penambahan:**
- Flash messages display
- Icons pada tombol aksi
- Improved empty state message

### 3. Null Value Handling
Mengubah field opsional menjadi `null` jika kosong:
```javascript
tanggal_lahir: tanggal_lahir || null,
alamat: alamat || null,
nomor_telepon: nomor_telepon || null,
email: email || null
```

Ini mencegah error database ketika field kosong dikirim sebagai string kosong.

## File yang Dimodifikasi

1. ✅ [`routes/guru.js`](file://d:\SISTEMINFORMASI\routes\guru.js)
   - Enhanced error handling
   - Input validation
   - Detailed logging
   - Specific error messages

2. ✅ [`views/guru/tambah.ejs`](file://d:\SISTEMINFORMASI\views\guru\tambah.ejs)
   - Flash messages display
   - Better form labels
   - Helper text
   - Icons

3. ✅ [`views/guru/edit.ejs`](file://d:\SISTEMINFORMASI\views\guru\edit.ejs)
   - Flash messages display
   - Consistent UI with tambah.ejs

4. ✅ [`views/guru/index.ejs`](file://d:\SISTEMINFORMASI\views\guru\index.ejs)
   - Flash messages display
   - Icons on action buttons

## Testing

### Skenario Test 1: Simpan Data Baru (Sukses)
1. Buka `http://localhost:3000/guru/tambah`
2. Isi semua field wajib (NIP, Nama, Jenis Kelamin)
3. Klik "Simpan Guru"
4. **Expected Result:** 
   - Redirect ke `/guru`
   - Muncul alert hijau: "Data guru [Nama] berhasil ditambahkan!"
   - Data muncul di tabel

### Skenario Test 2: Field Wajib Kosong
1. Buka `http://localhost:3000/guru/tambah`
2. Biarkan field NIP kosong
3. Klik "Simpan Guru"
4. **Expected Result:**
   - Tetap di halaman tambah
   - Muncul alert merah: "NIP, Nama Guru, dan Jenis Kelamin wajib diisi!"

### Skenario Test 3: NIP Duplikat
1. Coba simpan guru dengan NIP yang sudah ada
2. **Expected Result:**
   - Muncul alert merah: "NIP sudah terdaftar! Gunakan NIP yang berbeda."

### Skenario Test 4: Email Duplikat
1. Coba simpan guru dengan email yang sudah ada
2. **Expected Result:**
   - Muncul alert merah: "Email sudah terdaftar! Gunakan email yang berbeda."

### Skenario Test 5: Edit Data (Sukses)
1. Klik "Edit" pada salah satu guru
2. Ubah beberapa field
3. Klik "Update Guru"
4. **Expected Result:**
   - Redirect ke `/guru`
   - Muncul alert hijau: "Data guru [Nama] berhasil diperbarui!"

## Console Logging

Sekarang aplikasi akan menampilkan log berikut untuk debugging:

**Saat menambah guru:**
```
📝 Menerima data guru baru: { nip: '12345', nama_guru: 'Budi', ... }
✅ Data guru berhasil disimpan dengan ID: 5
```

**Saat error:**
```
❌ Validasi gagal: Field wajib kosong
❌ Error saat menyimpan data guru: UNIQUE constraint failed: guru.nip
```

## Manfaat Perbaikan

✅ **User Experience Lebih Baik:**
- User langsung tahu apakah operasinya sukses atau gagal
- Pesan error yang jelas dan actionable
- Visual feedback dengan warna (hijau=sukses, merah=error)

✅ **Debugging Lebih Mudah:**
- Logging detail di console server
- Error messages yang spesifik
- Mudah trace masalah

✅ **Data Integrity:**
- Validasi sebelum insert ke database
- Mencegah duplikasi NIP/email
- Handle null values dengan benar

✅ **Consistency:**
- Pattern yang sama diterapkan di semua CRUD operations
- Dapat direplikasi ke modul lain (siswa, kelas, dll)

## Rekomendasi Selanjutnya

Untuk konsistensi, terapkan pattern yang sama ke modul lain:
- [ ] Data Siswa (`routes/siswa.js`)
- [ ] Data Kelas (`routes/kelas.js`)
- [ ] Mata Pelajaran (`routes/mapel.js`)
- [ ] Jurnal Guru (`routes/jurnal.js`)
- [ ] Input Nilai (`routes/nilai.js`)

## Rollback (Jika Diperlukan)

Jika ingin mengembalikan ke versi sebelumnya, restore dari git history atau backup file-file berikut:
- `routes/guru.js`
- `views/guru/tambah.ejs`
- `views/guru/edit.ejs`
- `views/guru/index.ejs`

---

**Status:** ✅ Completed  
**Impact:** Medium (Improved UX & Error Handling)  
**Breaking Changes:** None
