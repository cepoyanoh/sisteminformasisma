# Perbaikan Masalah Penyimpanan Data Mata Pelajaran

## Tanggal Perbaikan
**2026-04-07**

## Masalah yang Dilaporkan
User melaporkan **"tidak dapat menyimpan data di mapel"** - form submit tidak memberikan feedback apapun kepada user apakah data berhasil disimpan atau gagal.

## Analisis Masalah

### Penyebab Utama:
1. **Tidak ada validasi input** di route handler
2. **Tidak ada flash messages** untuk memberikan feedback ke user
3. **Error handling minimal** - hanya console.error tanpa penjelasan detail
4. **Tidak ada logging** untuk debugging
5. **Tipe data tidak dikonversi** - kelas dan jam_pembelajaran dikirim sebagai string, bukan integer

### Gejala:
- User mengisi form dan klik "Simpan"
- Tidak ada pesan sukses atau error yang muncul
- User tidak tahu apakah data tersimpan atau tidak
- Jika ada error, hanya terlihat di console server, tidak di UI

## Solusi yang Diterapkan

### 1. Update Route Handler (`routes/mapel.js`)

#### A. Route POST `/mapel/tambah`
**Perubahan:**
```javascript
// ✅ Tambahan Validasi Input
if (!nama_mapel || !kategori || !kelas || !jam_pembelajaran) {
  req.flash('error', 'Nama Mata Pelajaran, Kategori, Kelas, dan Jam Pembelajaran wajib diisi!');
  return res.redirect('/mapel/tambah');
}

// ✅ Validasi jam_pembelajaran harus angka positif
if (parseInt(jam_pembelajaran) <= 0) {
  req.flash('error', 'Jam Pembelajaran harus lebih dari 0!');
  return res.redirect('/mapel/tambah');
}

// ✅ Logging untuk debugging
console.log('📝 Menerima data mata pelajaran baru:', { nama_mapel, kategori, kelas });

// ✅ Konversi tipe data yang benar
kelas: parseInt(kelas),
jam_pembelajaran: parseInt(jam_pembelajaran)

// ✅ Error handling spesifik
if (err.message.includes('UNIQUE constraint failed')) {
  if (err.message.includes('kode_mapel')) {
    req.flash('error', 'Kode mata pelajaran sudah terdaftar! Coba gunakan nama yang berbeda.');
  }
}

// ✅ Flash message sukses
req.flash('success', `Mata pelajaran "${nama_mapel}" berhasil ditambahkan!`);
```

#### B. Route POST `/mapel/edit/:id`
**Perubahan serupa dengan tambah:**
- Validasi input wajib
- Validasi jam pembelajaran > 0
- Logging proses update
- Konversi tipe data integer
- Error handling untuk UNIQUE constraint
- Flash messages untuk feedback user

#### C. Route GET `/mapel/hapus/:id`
**Peningkatan:**
```javascript
// ✅ Ambil nama mapel sebelum hapus untuk pesan konfirmasi
MataPelajaran.getById(id, (err, row) => {
  // ... delete logic
  
  req.flash('success', `Mata pelajaran "${row.nama_mapel}" berhasil dihapus!`);
});
```

### 2. Update Views

#### A. `views/mapel/tambah.ejs`
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
- Handle empty guru list dengan graceful fallback

#### B. `views/mapel/edit.ejs`
**Penambahan yang sama dengan tambah.ejs**

#### C. `views/mapel/index.ejs`
**Penambahan:**
- Flash messages display
- Badge untuk kode mapel
- Badge berwarna untuk kategori (Wajib=Pri, Pilihan=Success, Muatan Lokal=Warning)
- Icons pada tombol aksi
- Improved empty state message
- Better formatting for guru pengampu

### 3. Type Conversion
Memastikan field numerik dikonversi dengan benar:
```javascript
kelas: parseInt(kelas),
jam_pembelajaran: parseInt(jam_pembelajaran)
```

Ini mencegah error database karena tipe data yang tidak sesuai.

## File yang Dimodifikasi

1. ✅ [`routes/mapel.js`](file://d:\SISTEMINFORMASI\routes\mapel.js)
   - Enhanced error handling
   - Input validation (required fields & positive numbers)
   - Detailed logging
   - Specific error messages
   - Type conversion for numeric fields
   - Improved delete with confirmation message

2. ✅ [`views/mapel/tambah.ejs`](file://d:\SISTEMINFORMASI\views\mapel\tambah.ejs)
   - Flash messages display
   - Better form labels with required indicators
   - Helper text for guidance
   - Icons on buttons
   - Empty guru list handling

3. ✅ [`views/mapel/edit.ejs`](file://d:\SISTEMINFORMASI\views\mapel\edit.ejs)
   - Flash messages display
   - Consistent UI with tambah.ejs
   - Better validation feedback

4. ✅ [`views/mapel/index.ejs`](file://d:\SISTEMINFORMASI\views\mapel\index.ejs)
   - Flash messages display
   - Color-coded badges for categories
   - Code badge display
   - Icons on action buttons
   - Improved table readability

## Testing

### Skenario Test 1: Simpan Data Baru (Sukses)
1. Buka `http://localhost:3000/mapel/tambah`
2. Isi semua field wajib:
   - Nama Mata Pelajaran: "Matematika"
   - Kategori: "Wajib"
   - Kelas: "10"
   - Jam Pembelajaran: "4"
3. Klik "Simpan Mata Pelajaran"
4. **Expected Result:** 
   - Redirect ke `/mapel`
   - Muncul alert hijau: "Mata pelajaran Matematika berhasil ditambahkan!"
   - Data muncul di tabel dengan badge yang sesuai

### Skenario Test 2: Field Wajib Kosong
1. Buka `http://localhost:3000/mapel/tambah`
2. Biarkan field Kategori kosong
3. Klik "Simpan Mata Pelajaran"
4. **Expected Result:**
   - Tetap di halaman tambah
   - Muncul alert merah: "Nama Mata Pelajaran, Kategori, Kelas, dan Jam Pembelajaran wajib diisi!"

### Skenario Test 3: Jam Pembelajaran Invalid
1. Isi form dengan Jam Pembelajaran = "0" atau "-1"
2. Klik "Simpan"
3. **Expected Result:**
   - Muncul alert merah: "Jam Pembelajaran harus lebih dari 0!"

### Skenario Test 4: Kode Mapel Duplikat
1. Coba simpan mapel dengan nama yang menghasilkan kode sama (3 huruf pertama)
2. **Expected Result:**
   - Muncul alert merah: "Kode mata pelajaran sudah terdaftar! Coba gunakan nama yang berbeda."

### Skenario Test 5: Edit Data (Sukses)
1. Klik "Edit" pada salah satu mapel
2. Ubah beberapa field
3. Klik "Update Mata Pelajaran"
4. **Expected Result:**
   - Redirect ke `/mapel`
   - Muncul alert hijau: "Mata pelajaran [Nama] berhasil diperbarui!"

### Skenario Test 6: Hapus Data
1. Klik "Hapus" pada salah satu mapel
2. Konfirmasi di dialog
3. **Expected Result:**
   - Redirect ke `/mapel`
   - Muncul alert hijau: "Mata pelajaran [Nama] berhasil dihapus!"

## Console Logging

Sekarang aplikasi akan menampilkan log berikut untuk debugging:

**Saat menambah mapel:**
```
📝 Menerima data mata pelajaran baru: { nama_mapel: 'Matematika', kategori: 'Wajib', kelas: '10' }
✅ Data mata pelajaran berhasil disimpan dengan ID: 3
```

**Saat edit mapel:**
```
✏️ Mengupdate data mata pelajaran ID: 3
✅ Data mata pelajaran berhasil diupdate
```

**Saat hapus mapel:**
```
✅ Data mata pelajaran berhasil dihapus
```

**Saat error:**
```
❌ Validasi gagal: Field wajib kosong
❌ Error saat menyimpan data mata pelajaran: UNIQUE constraint failed: mata_pelajaran.kode_mapel
```

## Manfaat Perbaikan

✅ **User Experience Lebih Baik:**
- User langsung tahu apakah operasinya sukses atau gagal
- Pesan error yang jelas dan actionable
- Visual feedback dengan warna (hijau=sukses, merah=error)
- Badge berwarna memudahkan identifikasi kategori

✅ **Data Integrity:**
- Validasi sebelum insert ke database
- Mencegah duplikasi kode mapel
- Memastikan tipe data yang benar (integer untuk kelas & jam)
- Handle null values dengan benar

✅ **Debugging Lebih Mudah:**
- Logging detail di console server
- Error messages yang spesifik
- Mudah trace masalah

✅ **Visual Improvements:**
- Badge untuk kode mapel
- Color-coded category badges
- Icons pada tombol
- Better table formatting

✅ **Consistency:**
- Pattern yang sama dengan modul guru
- Dapat direplikasi ke modul lain (siswa, kelas, dll)

## Fitur Visual Baru

### Badges di Tabel Index:
- **Kode Mapel**: Badge abu-abu sekunder
- **Kategori Wajib**: Badge biru primary
- **Kategori Pilihan**: Badge hijau success
- **Kategori Muatan Lokal**: Badge kuning warning

### Form Improvements:
- Required field indicators (*)
- Helper text untuk guidance
- Placeholder examples
- Icons pada buttons (save, cancel, edit, delete)

## Rekomendasi Selanjutnya

Untuk konsistensi, terapkan pattern yang sama ke modul lain:
- [ ] Data Siswa (`routes/siswa.js`)
- [x] Data Guru (`routes/guru.js`) ✅
- [ ] Data Kelas (`routes/kelas.js`)
- [ ] Jurnal Guru (`routes/jurnal.js`)
- [ ] Input Nilai (`routes/nilai.js`)

## Rollback (Jika Diperlukan)

Jika ingin mengembalikan ke versi sebelumnya, restore dari git history atau backup file-file berikut:
- `routes/mapel.js`
- `views/mapel/tambah.ejs`
- `views/mapel/edit.ejs`
- `views/mapel/index.ejs`

---

**Status:** ✅ Completed  
**Impact:** Medium (Improved UX, Error Handling & Visual Design)  
**Breaking Changes:** None  
**Related Fix:** Similar to guru save issue fix
