# Fitur Validasi Duplikasi Nama Siswa Saat Import Excel

## Tanggal Implementasi
**2026-04-07**

## Deskripsi Fitur
Sistem validasi otomatis untuk mencegah duplikasi nama siswa saat import data dari Excel. Sistem akan mengecek:
1. **Duplikasi dalam file Excel itu sendiri**
2. **Duplikasi dengan data yang sudah ada di database**

Jika ditemukan duplikasi, **import akan dibatalkan** dan pesan error detail akan ditampilkan.

## Spesifikasi Validasi

### ✅ Aturan Duplikasi

**1. Case-Insensitive**
```javascript
// Nama ini dianggap SAMA:
- "Ahmad Fauzi"
- "ahmad fauzi"
- "AHMAD FAUZI"
- "Ahmad  Fauzi" (double space trimmed)
```

**2. Whitespace Handling**
```javascript
// Spasi di awal/akhir di-trim:
- "  Ahmad Fauzi  " → "Ahmad Fauzi"
- "Ahmad  Fauzi" → Tetap "Ahmad  Fauzi" (double space tetap dianggap beda)
```

**3. Cek dalam File Excel**
```
Contoh File Excel:
Baris 2: Ahmad Fauzi     ✅ OK
Baris 3: Siti Nurhaliza   ✅ OK
Baris 4: Ahmad Fauzi     ❌ DUPLIKAT! (sama dengan baris 2)
```

**4. Cek dengan Database**
```
Database existing:
- Ahmad Fauzi (ID: 123)

File Excel:
Baris 2: Ahmad Fauzi     ❌ DUPLIKAT! (sudah ada di database)
Baris 3: Budi Santoso    ✅ OK
```

## Arsitektur Implementasi

### 1. Logic Validasi di Route

**File:** [`routes/siswa.js`](file://d:\SISTEMINFORMASI\routes\siswa.js)

**Flow Validasi:**

```javascript
POST /siswa/import
│
├─ 1. Baca file Excel
├─ 2. Ambil semua siswa existing dari database
│
├─ 3. Buat Set nama existing (uppercase + trimmed)
│   └─ existingNames = new Set(['AHMAD FAUZI', 'SITI NURHALIZA', ...])
│
├─ 4. Cek duplikasi DALAM FILE
│   ├─ Scan semua baris
│   ├─ Hitung kemunculan setiap nama
│   └─ Jika ada nama muncul > 1x → BATALKAN IMPORT
│
├─ 5. Cek duplikasi DENGAN DATABASE
│   ├─ Bandingkan nama di file dengan existingNames
│   └─ Jika ada yang sama → BATALKAN IMPORT
│
└─ 6. Jika TIDAK ADA duplikasi → LANJUTKAN IMPORT
```

### 2. Detection Logic

**A. Duplikasi dalam File:**

```javascript
const namesInFile = {};
const duplicateInFile = [];

data.forEach((row, index) => {
  const namaSiswa = row['Nama'].toString().toUpperCase().trim();
  
  if (namesInFile[namaSiswa]) {
    // Ditemukan duplikasi!
    duplicateInFile.push({
      name: namaSiswa,
      rows: [namesInFile[namaSiswa], index + 2]
    });
  } else {
    namesInFile[namaSiswa] = index + 2;  // Simpan nomor baris
  }
});
```

**Output Error:**
```
❌ Import dibatalkan! Ditemukan duplikasi nama dalam file:
   - Nama "AHMAD FAUZI" muncul di baris 2 dan 5
   - Nama "SITI NURHALIZA" muncul di baris 3 dan 7
```

**B. Duplikasi dengan Database:**

```javascript
const duplicateWithExisting = [];

data.forEach((row, index) => {
  const namaSiswa = row['Nama'].toString().toUpperCase().trim();
  
  if (existingNames.has(namaSiswa)) {
    duplicateWithExisting.push({
      name: namaSiswa,
      row: index + 2
    });
  }
});
```

**Output Error:**
```
❌ Import dibatalkan! Ditemukan nama siswa yang sudah ada:
   - Baris 2: Nama "AHMAD FAUZI" sudah ada di database
   - Baris 5: Nama "BUDI SANTOSO" sudah ada di database
```

### 3. Error Handling

**A. Jika Ada Duplikasi:**

```javascript
if (duplicateInFile.length > 0 || duplicateWithExisting.length > 0) {
  // Hapus file uploaded
  fs.unlinkSync(req.file.path);
  
  // Set error messages
  req.flash('error', 'Import dibatalkan! Ditemukan duplikasi...');
  req.flash('errors', detailedMessages);
  
  // Redirect kembali ke form
  return res.redirect('/siswa/import');
}
```

**B. Jika Tidak Ada Duplikasi:**

```javascript
// Lanjutkan proses import normal
// ... (existing import logic)
```

## UI/UX Implementation

### 1. Import Form Update

**File:** [`views/siswa/import.ejs`](file://d:\SISTEMINFORMASI\views\siswa\import.ejs)

**Info Box Baru:**

```html
<div class="alert alert-warning" role="alert">
    <h6 class="alert-heading">
        <i class="bi bi-exclamation-triangle me-2"></i>Validasi Duplikasi:
    </h6>
    <ul class="mb-0">
        <li>Sistem akan mengecek duplikasi dalam file Excel</li>
        <li>Sistem akan mengecek duplikasi dengan database existing</li>
        <li>Jika ditemukan duplikasi, import akan dibatalkan</li>
        <li>Pesan error akan ditampilkan untuk memperjelas baris mana yang bermasalah</li>
    </ul>
</div>
```

### 2. Error Display

**Error Messages di View:**

```html
<% if (error && error.length > 0) { %>
    <div class="alert alert-danger alert-dismissible fade show" role="alert">
        <i class="bi bi-exclamation-triangle-fill me-2"></i><%= error[0] %>
        <% if (errors && errors.length > 0) { %>
            <ul class="mb-0 mt-2">
                <% errors.slice(0, 5).forEach(err => { %>
                    <li><%= err %></li>
                <% }); %>
                <% if (errors.length > 5) { %>
                    <li>... dan <%= errors.length - 5 %> error lainnya</li>
                <% } %>
            </ul>
        <% } %>
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    </div>
<% } %>
```

## Testing Scenarios

### Test 1: Duplikasi dalam File Excel

**File Excel:**
```
| NIS  | Nama           | Kelas  |
|------|----------------|--------|
| 1234 | Ahmad Fauzi    | 11 A   |
| 1235 | Siti Nurhaliza | 11 B   |
| 1236 | Ahmad Fauzi    | 11 A   | ← DUPLIKAT!
```

**Expected Result:**
```
❌ Import dibatalkan!
📝 Pesan: "Nama "AHMAD FAUZI" muncul di baris 2 dan 4"
🔄 File tidak tersimpan ke database
```

### Test 2: Duplikasi dengan Database

**Database Existing:**
```
ID: 101 | Nama: Ahmad Fauzi | Kelas: 11 A
```

**File Excel:**
```
| NIS  | Nama           | Kelas  |
|------|----------------|--------|
| 1237 | Ahmad Fauzi    | 11 A   | ← DUPLIKAT dengan DB!
| 1238 | Budi Santoso   | 11 B   |
```

**Expected Result:**
```
❌ Import dibatalkan!
📝 Pesan: "Baris 2: Nama "AHMAD FAUZI" sudah ada di database"
🔄 File tidak tersimpan ke database
```

### Test 3: Tidak Ada Duplikasi

**Database Existing:**
```
ID: 101 | Nama: Ahmad Fauzi | Kelas: 11 A
```

**File Excel:**
```
| NIS  | Nama           | Kelas  |
|------|----------------|--------|
| 1237 | Siti Nurhaliza | 11 B   |
| 1238 | Budi Santoso   | 11 A   |
```

**Expected Result:**
```
✅ Import berhasil!
📝 Pesan: "Berhasil mengimport 2 data siswa tanpa duplikasi"
💾 Data tersimpan ke database
```

### Test 4: Case-Insensitive Check

**Database Existing:**
```
ID: 101 | Nama: Ahmad Fauzi | Kelas: 11 A
```

**File Excel:**
```
| NIS  | Nama           | Kelas  |
|------|----------------|--------|
| 1237 | ahmad fauzi    | 11 B   | ← DUPLIKAT! (lowercase)
```

**Expected Result:**
```
❌ Import dibatalkan!
📝 Pesan: "Baris 2: Nama "AHMAD FAUZI" sudah ada di database"
🔄 Case-insensitive comparison berhasil mendeteksi
```

### Test 5: Multiple Duplicates

**File Excel:**
```
| NIS  | Nama           | Kelas  |
|------|----------------|--------|
| 1234 | Ahmad Fauzi    | 11 A   |
| 1235 | Ahmad Fauzi    | 11 B   | ← DUPLIKAT 1
| 1236 | Siti Nurhaliza | 11 A   |
| 1237 | Siti Nurhaliza | 11 B   | ← DUPLIKAT 2
| 1238 | Budi Santoso   | 11 A   |
```

**Expected Result:**
```
❌ Import dibatalkan!
📝 Pesan: 
   - Nama "AHMAD FAUZI" muncul di baris 2 dan 3
   - Nama "SITI NURHALIZA" muncul di baris 4 dan 5
🔄 Semua duplikasi terdeteksi
```

### Test 6: Mixed Duplicates (File + Database)

**Database Existing:**
```
ID: 101 | Nama: Ahmad Fauzi
```

**File Excel:**
```
| NIS  | Nama           | Kelas  |
|------|----------------|--------|
| 1234 | Ahmad Fauzi    | 11 A   | ← DUPLIKAT dengan DB
| 1235 | Ahmad Fauzi    | 11 B   | ← DUPLIKAT dalam file
| 1236 | Budi Santoso   | 11 A   |
```

**Expected Result:**
```
❌ Import dibatalkan!
📝 Pesan:
   - Nama "AHMAD FAUZI" muncul di baris 2 dan 3 (dalam file)
   - Baris 2: Nama "AHMAD FAUZI" sudah ada di database
🔄 Kedua jenis duplikasi terdeteksi
```

## Error Messages Format

### 1. Duplikasi dalam File

**Format:**
```
❌ Import dibatalkan! Ditemukan duplikasi nama dalam file:
   - Nama "NAMA_SISWA" muncul di baris X dan Y
```

**Contoh:**
```
❌ Import dibatalkan! Ditemukan duplikasi nama dalam file:
   - Nama "AHMAD FAUZI" muncul di baris 2 dan 5
   - Nama "SITI NURHALIZA" muncul di baris 3 dan 7
   - Nama "BUDI SANTOSO" muncul di baris 4 dan 8
```

### 2. Duplikasi dengan Database

**Format:**
```
❌ Import dibatalkan! Ditemukan nama siswa yang sudah ada:
   - Baris X: Nama "NAMA_SISWA" sudah ada di database
```

**Contoh:**
```
❌ Import dibatalkan! Ditemukan nama siswa yang sudah ada:
   - Baris 2: Nama "AHMAD FAUZI" sudah ada di database
   - Baris 5: Nama "BUDI SANTOSO" sudah ada di database
   - Baris 8: Nama "SITI NURHALIZA" sudah ada di database
```

### 3. Mixed Errors

**Format:**
```
❌ Import dibatalkan! Ditemukan duplikasi nama dalam file:
   - Nama "AHMAD FAUZI" muncul di baris 2 dan 5

❌ Import dibatalkan! Ditemukan nama siswa yang sudah ada:
   - Baris 2: Nama "AHMAD FAUZI" sudah ada di database
```

## Success Messages

**Format:**
```
✅ Berhasil mengimport X data siswa tanpa duplikasi
```

**Contoh:**
```
✅ Berhasil mengimport 25 data siswa tanpa duplikasi
```

## Implementation Details

### 1. Performance Optimization

**A. Using Set for Fast Lookup:**
```javascript
// O(1) lookup time
const existingNames = new Set();
existingStudents.forEach(s => {
  existingNames.add(s.nama_siswa.toUpperCase().trim());
});

// Check existence
if (existingNames.has(namaSiswa)) {
  // Duplicate found
}
```

**B. Early Exit:**
```javascript
// Stop processing if duplicates found
if (duplicateInFile.length > 0) {
  fs.unlinkSync(req.file.path);
  req.flash('error', '...');
  return res.redirect('/siswa/import');  // Early return
}
```

### 2. Memory Management

**File Cleanup:**
```javascript
// Always delete uploaded file
try {
  fs.unlinkSync(req.file.path);
} catch (err) {
  console.error('Failed to delete file:', err);
}
```

**Error Handling:**
```javascript
if (req.file && fs.existsSync(req.file.path)) {
  fs.unlinkSync(req.file.path);
}
```

### 3. Edge Cases Handled

**A. Empty Name Field:**
```javascript
const namaSiswa = row['Nama'] || '';
if (!namaSiswa) return;  // Skip empty names
```

**B. Null/Undefined Values:**
```javascript
const namaSiswa = (row['Nama'] || '').toString().toUpperCase().trim();
// Safe even if row['Nama'] is undefined
```

**C. Large Files:**
```javascript
// Process in memory, no streaming needed for typical Excel files
// Set-based lookup ensures O(n) time complexity
```

## File Summary

### Modified Files:
1. ✅ [`routes/siswa.js`](file://d:\SISTEMINFORMASI\routes\siswa.js) - Added duplicate validation logic
2. ✅ [`views/siswa/import.ejs`](file://d:\SISTEMINFORMASI\views\siswa\import.ejs) - Added info about validation

### New Features:
- ✅ Duplikasi dalam file detection
- ✅ Duplikasi dengan database detection
- ✅ Case-insensitive comparison
- ✅ Whitespace trimming
- ✅ Detailed error messages
- ✅ Early exit on duplicate detection
- ✅ File cleanup on error

## Benefits

### 1. Data Integrity
- ✅ Mencegah data duplikat masuk ke database
- ✅ Menjaga konsistensi data siswa
- ✅ Menghindari confusion dengan nama sama

### 2. User Experience
- ✅ Pesan error yang jelas dan detail
- ✅ Informasi baris mana yang bermasalah
- ✅ Tidak perlu manual cek duplikasi

### 3. System Reliability
- ✅ Validasi otomatis sebelum import
- ✅ Tidak ada partial import jika ada error
- ✅ File cleanup yang proper

## Future Enhancements

1. **Fuzzy Matching**: Deteksi nama yang mirip (typo tolerance)
2. **NIS/NISN Validation**: Cek duplikasi berdasarkan nomor induk
3. **Merge Option**: Opsi untuk update data existing jika ada duplikat
4. **Skip Duplicates**: Opsi untuk skip baris duplikat dan lanjutkan import
5. **Excel Preview**: Preview data sebelum import
6. **Batch Processing**: Import file besar secara chunk

---

**Status:** ✅ Completed  
**Features:** Full duplicate validation with detailed error messages  
**Validation Types:** In-file + Database  
**Case Sensitivity:** Case-insensitive  
**Error Handling:** Early exit with file cleanup
