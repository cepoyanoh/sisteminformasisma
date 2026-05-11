# Fitur Import Data Guru dari Excel

## Tanggal Penambahan
**2026-04-07**

## Deskripsi Fitur
Menambahkan kemampuan untuk mengimport data guru secara massal menggunakan file Excel (.xlsx atau .xls). Fitur ini memungkinkan administrator untuk mengupload banyak data guru sekaligus tanpa harus mengisi form satu per satu.

## Teknologi yang Digunakan

### Dependencies:
1. **multer** - Library untuk handling file upload
2. **xlsx** - Library untuk membaca dan menulis file Excel
3. **fs** (built-in) - File system module untuk menghapus file setelah diproses
4. **path** (built-in) - Path manipulation

### Konfigurasi Upload:
```javascript
const storage = multer.diskStorage({
  destination: 'uploads/',  // Folder penyimpanan file
  filename: Date.now() + '-' + file.originalname  // Unique filename
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    // Hanya terima file Excel
    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel'
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Hanya file Excel yang diperbolehkan!'), false);
    }
  }
});
```

## Routes yang Ditambahkan

### 1. GET `/guru/import`
Menampilkan halaman form upload Excel dengan instruksi lengkap.

**Response:** Render view `guru/import.ejs`

### 2. POST `/guru/import`
Memproses file Excel yang diupload dan mengimport data ke database.

**Request:**
- Content-Type: `multipart/form-data`
- Field: `file_excel` (file)

**Proses:**
1. Validasi file existence
2. Baca file Excel menggunakan xlsx
3. Konversi sheet pertama ke JSON
4. Loop setiap baris data
5. Validasi field wajib (NIP, Nama, Jenis Kelamin)
6. Normalisasi data (jenis kelamin L/P)
7. Insert ke database
8. Track success/error count
9. Hapus file setelah diproses
10. Redirect dengan flash message

**Flash Messages:**
- Success: "Berhasil mengimport X data guru!"
- Warning: "Import selesai: X berhasil, Y gagal."
- Error: Detail error per baris disimpan di session

### 3. GET `/guru/download-template`
Menggenerate dan mendownload template Excel dengan data contoh.

**Response:**
- Content-Type: `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
- File: Template_Import_Guru_YYYY-MM-DD.xlsx
- Isi: 2 baris data contoh dengan format yang benar

## Format File Excel

### Struktur Kolom (Header):

| Kolom | Wajib | Tipe | Keterangan |
|-------|-------|------|------------|
| NIP | ✅ Ya | Text/String | Harus unik, tidak boleh duplikat |
| Nama Guru | ✅ Ya | Text/String | Nama lengkap guru |
| Jenis Kelamin | ✅ Ya | Text/String | "L" atau "P" |
| Tanggal Lahir | ❌ Tidak | Date | Format: YYYY-MM-DD |
| Alamat | ❌ Tidak | Text/String | Alamat lengkap |
| Nomor Telepon | ❌ Tidak | Text/String | Nomor HP/Telepon |
| Email | ❌ Tidak | Text/String | Email valid |

### Contoh Data:

```
NIP                 | Nama Guru          | Jenis Kelamin | Tanggal Lahir | Alamat                    | Nomor Telepon | Email
--------------------|--------------------|---------------|---------------|---------------------------|---------------|------------------
198501012010011001  | Budi Santoso, S.Pd | L             | 1985-01-01    | Jl. Pendidikan No. 1      | 081234567890  | budi@example.com
198702022011012002  | Siti Rahayu, M.Pd  | P             | 1987-02-02    | Jl. Guru No. 2            | 082345678901  | siti@example.com
```

### Aturan Validasi:

1. **Field Wajib:**
   - NIP tidak boleh kosong
   - Nama Guru tidak boleh kosong
   - Jenis Kelamin harus diisi

2. **Normalisasi Jenis Kelamin:**
   - "LAKI-LAKI", "L", "LA" → dikonversi ke "L"
   - "PEREMPUAN", "P", "PR" → dikonversi ke "P"
   - Selain itu → Error

3. **Unique Constraint:**
   - NIP yang sudah ada di database akan dilewati
   - Tidak ada update data existing

4. **Format Tanggal:**
   - Disarankan format: YYYY-MM-DD
   - Excel date serial juga bisa dibaca oleh xlsx library

## File yang Dimodifikasi/Ditambahkan

### 1. `routes/guru.js`
**Perubahan:**
- Tambah imports: `multer`, `xlsx`, `path`, `fs`
- Konfigurasi multer storage dan file filter
- Route GET `/guru/import` - Halaman import
- Route POST `/guru/import` - Proses import
- Route GET `/guru/download-template` - Download template

**Fitur Utama:**
```javascript
// Auto-create uploads folder jika belum ada
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Read Excel file
const workbook = xlsx.readFile(req.file.path);
const worksheet = workbook.Sheets[sheetName];
const data = xlsx.utils.sheet_to_json(worksheet);

// Process each row
data.forEach((row, index) => {
  // Mapping columns
  const nip = row['NIP'] || row['nip'] || '';
  // ... validation and insert
});

// Cleanup after processing
fs.unlinkSync(req.file.path);
```

### 2. `views/guru/import.ejs` (NEW)
**Komponen:**
- Flash messages (success, warning, error)
- Upload form dengan enctype="multipart/form-data"
- Petunjuk pengisian detail
- Tabel format kolom
- Tombol download template
- Tombol batal dan import

**UI Features:**
- Icon Bootstrap untuk visual appeal
- Color-coded alerts (green=success, yellow=warning, red=error)
- Responsive layout (2 kolom: form + info)
- Required field indicators (*)
- File type hints

### 3. `views/guru/index.ejs`
**Perubahan:**
- Tambah tombol "Import Excel" di header
- Posisi: Sebelum tombol "Tambah Guru Baru"
- Style: btn-success dengan icon file-earmark-excel

## Cara Menggunakan

### Langkah 1: Download Template
1. Buka halaman Data Guru: `http://localhost:3000/guru`
2. Klik tombol **"Import Excel"** (hijau)
3. Di halaman import, klik **"Download Template"**
4. File Excel template akan terdownload otomatis

### Langkah 2: Isi Data di Excel
1. Buka file template yang sudah didownload
2. Isi data sesuai kolom yang tersedia
3. Pastikan field wajib terisi (NIP, Nama, Jenis Kelamin)
4. Gunakan "L" untuk laki-laki, "P" untuk perempuan
5. Simpan file (Ctrl+S)

### Langkah 3: Upload File
1. Kembali ke halaman import
2. Klik **"Choose File"** atau drag & drop file
3. Pilih file Excel yang sudah diisi
4. Klik tombol **"Import Data"**
5. Tunggu proses import selesai

### Langkah 4: Cek Hasil
1. Sistem akan redirect ke halaman Data Guru
2. Lihat flash message untuk hasil import:
   - ✅ Hijau: Semua data berhasil
   - ⚠️ Kuning: Ada yang gagal, cek detail error
   - ❌ Merah: Error sistem
3. Verifikasi data di tabel

## Error Handling

### 1. File Validation Errors
**Error:** "Hanya file Excel (.xlsx atau .xls) yang diperbolehkan!"
**Penyebab:** Upload file bukan Excel (PDF, Word, dll)
**Solusi:** Convert file ke format Excel terlebih dahulu

### 2. Empty File
**Error:** "File Excel kosong atau tidak ada data yang valid!"
**Penyebab:** File tidak memiliki data atau hanya header
**Solusi:** Isi minimal 1 baris data

### 3. Missing Required Fields
**Error:** "Baris X: NIP, Nama, dan Jenis Kelamin wajib diisi"
**Penyebab:** Field wajib kosong di baris tersebut
**Solusi:** Lengkapi data di Excel dan upload ulang

### 4. Invalid Gender Value
**Error:** "Baris X: Jenis Kelamin harus L atau P"
**Penyebab:** Nilai jenis kelamin bukan L/P/Laki-laki/Perempuan
**Solusi:** Gunakan "L" atau "P" saja

### 5. Duplicate NIP
**Error:** "Baris X: NIP XXX sudah terdaftar"
**Penyebab:** NIP sudah ada di database
**Solusi:** Gunakan NIP yang berbeda atau hapus data lama

### 6. System Errors
**Error:** "Terjadi kesalahan saat memproses file: [detail]"
**Penyebab:** Corrupt file, format tidak dikenali, dll
**Solusi:** Coba file lain atau perbaiki format

## Logging & Debugging

### Console Logs:
```
📊 Memproses file Excel: data_guru.xlsx
📋 Ditemukan 50 baris data
✅ Baris 2 berhasil disimpan
✅ Baris 3 berhasil disimpan
❌ Error menyimpan baris 4: UNIQUE constraint failed
...
```

### Flash Message Examples:

**Success (semua berhasil):**
```
✅ Berhasil mengimport 50 data guru!
```

**Partial Success (ada yang gagal):**
```
⚠️ Import selesai: 48 berhasil, 2 gagal.

Detail Error:
- Baris 5: NIP 123456 sudah terdaftar
- Baris 10: Jenis Kelamin harus L atau P
```

**Error (sistem):**
```
❌ Terjadi kesalahan saat memproses file: Invalid file format
```

## Best Practices

### 1. Persiapan Data
- ✅ Backup database sebelum import besar
- ✅ Test dengan data kecil dulu (5-10 baris)
- ✅ Verify data di Excel sebelum upload
- ✅ Gunakan template resmi untuk konsistensi

### 2. Format Data
- ✅ NIP: Gunakan string, bukan number (hindari scientific notation)
- ✅ Tanggal: Format ISO (YYYY-MM-DD) untuk konsistensi
- ✅ Jenis Kelamin: Gunakan "L" atau "P" singkat
- ✅ Email: Pastikan format valid

### 3. Performance
- ⚠️ Untuk data >1000 baris, split jadi beberapa file
- ⚠️ Monitor memory usage saat import besar
- ⚠️ Pertimbangkan batch processing untuk dataset sangat besar

### 4. Data Quality
- ✅ Remove duplicate rows di Excel sebelum upload
- ✅ Trim whitespace di awal/akhir cell
- ✅ Consistent naming convention
- ✅ Validate phone numbers dan emails

## Testing Scenarios

### Test 1: Import Sukses Penuh
**Input:** File Excel dengan 10 data valid
**Expected:** 
- Flash message hijau
- "Berhasil mengimport 10 data guru!"
- 10 data muncul di tabel

### Test 2: Import Sebagian Gagal
**Input:** File dengan 10 data, 2 NIP duplikat
**Expected:**
- Flash message kuning
- "Import selesai: 8 berhasil, 2 gagal."
- Detail error ditampilkan
- 8 data baru masuk database

### Test 3: File Bukan Excel
**Input:** Upload file .pdf atau .docx
**Expected:**
- Flash message merah
- "Hanya file Excel (.xlsx atau .xls) yang diperbolehkan!"
- Tidak ada data yang masuk

### Test 4: File Kosong
**Input:** Excel hanya header, no data rows
**Expected:**
- Flash message merah
- "File Excel kosong atau tidak ada data yang valid!"

### Test 5: Field Wajib Kosong
**Input:** Baris data tanpa NIP
**Expected:**
- Baris tersebut skip
- Error message spesifik
- Baris lain tetap diproses

### Test 6: Download Template
**Action:** Klik tombol download template
**Expected:**
- File terdownload: Template_Import_Guru_YYYY-MM-DD.xlsx
- Isi: 2 baris contoh data
- Kolom sesuai format

## Security Considerations

### 1. File Type Validation
- Server-side MIME type checking
- Extension validation
- Prevent malicious file uploads

### 2. File Size Limit
- Default multer limit: ~5MB (bisa dikonfigurasi)
- Prevent DoS via large files

### 3. File Cleanup
- Auto-delete uploaded files after processing
- Prevent disk space exhaustion
- Use try-catch untuk handle cleanup errors

### 4. SQL Injection Prevention
- Menggunakan parameterized queries via model
- Input sanitization di model layer

### 5. Path Traversal Prevention
- Fixed upload directory
- Generated filenames dengan timestamp
- No user-controlled paths

## Future Enhancements

### Potensi Improvement:

1. **Progress Indicator:**
   - Show progress bar saat import berjalan
   - Real-time counter (processed X of Y rows)

2. **Batch Processing:**
   - Process dalam batch (e.g., 100 rows/batch)
   - Better memory management untuk file besar

3. **Update Existing Records:**
   - Option untuk update data existing berdasarkan NIP
   - Merge strategy configuration

4. **Preview Before Import:**
   - Tampilkan preview data sebelum commit
   - Allow user to review dan confirm

5. **Import History:**
   - Log semua import operations
   - Track who imported what when
   - Rollback capability

6. **Advanced Validation:**
   - Email format validation
   - Phone number format validation
   - Date range validation

7. **Export After Import:**
   - Generate report file dengan hasil import
   - List sukses dan gagal dengan alasan

---

**Status:** ✅ Completed  
**Impact:** High (Major feature addition)  
**Breaking Changes:** None  
**Dependencies Added:** Using existing `multer` and `xlsx` packages  
**Files Modified:** 3 (routes/guru.js, views/guru/import.ejs, views/guru/index.ejs)
