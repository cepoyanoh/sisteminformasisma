# Fitur Pencarian Data Siswa

## Tanggal Penambahan
**2026-04-07**

## Deskripsi Fitur
Menambahkan kemampuan untuk mencari data siswa berdasarkan **Nama**, **NIS** (Nomor Induk Siswa), atau **NISN** (Nomor Induk Siswa Nasional). Fitur ini memungkinkan administrator untuk dengan cepat menemukan siswa tertentu tanpa harus scroll melalui semua data.

## Teknologi yang Digunakan

### Backend:
- **SQL LIKE Operator** - Pattern matching untuk pencarian teks
- **Parameterized Queries** - Mencegah SQL injection
- **Wildcard Search** - Menggunakan `%` untuk matching parsial

### Frontend:
- **HTML Form** - Input text dengan method GET
- **Bootstrap Icons** - Visual icons untuk UX
- **EJS Template** - Server-side rendering

## Implementasi

### 1. Model Layer (`models/Siswa.js`)

**Method: `getAll(sortBy, search, callback)`**

**Signature Update:**
```javascript
// Sebelum
getAll: (sortBy, callback) => { ... }

// Sesudah
getAll: (sortBy, search, callback) => { ... }
```

**Query SQL dengan Search:**
```javascript
getAll: (sortBy, search, callback) => {
  let sql = `
    SELECT s.*, k.nama_kelas
    FROM siswa s
    LEFT JOIN kelas k ON s.kelas_id = k.id
  `;
  
  const params = [];
  
  // Add search filter if provided
  if (search && search.trim() !== '') {
    sql += ` WHERE s.nama_siswa LIKE ? OR s.nis LIKE ? OR s.nisn LIKE ?`;
    const searchTerm = `%${search.trim()}%`;
    params.push(searchTerm, searchTerm, searchTerm);
  }
  
  // Determine sort order
  if (sortBy === 'kelas') {
    sql += ` ORDER BY k.nama_kelas ASC, s.nama_siswa ASC`;
  } else {
    sql += ` ORDER BY s.nama_siswa ASC`;
  }
  
  db.all(sql, params, callback);
}
```

**Penjelasan:**
- **LIKE Operator**: Mencari pattern yang mengandung keyword
- **Wildcard `%`**: 
  - `%keyword%` = mengandung keyword di manapun
  - `keyword%` = dimulai dengan keyword
  - `%keyword` = diakhiri dengan keyword
- **Parameterized Query**: Menggunakan `?` placeholder untuk keamanan
- **OR Condition**: Mencari di 3 field (nama, NIS, NISN)

### 2. Route Layer (`routes/siswa.js`)

**Route: `GET /siswa`**

**Update:**
```javascript
router.get('/', (req, res) => {
  const Kelas = require('../models/Kelas');
  Kelas.syncAllJumlahSiswa((syncErr) => {
    // Get sort and search parameters from query string
    const sortBy = req.query.sort || 'nama';
    const search = req.query.search || '';  // ← NEW
    
    Siswa.getAll(sortBy, search, (err, rows) => {  // ← Pass search
      res.render('siswa/index', { 
        siswaList: rows,
        sortBy: sortBy,
        search: search,  // ← Pass to view
        showBackButton: true
      });
    });
  });
});
```

**Parameter Query:**
```
/siswa?search=budi          → Cari "budi"
/siswa?search=12345         → Cari NIS/NISN "12345"
/siswa?sort=nama&search=x   → Sort + Search
```

### 3. View Layer (`views/siswa/index.ejs`)

**Komponen yang Ditambahkan:**

#### A. Search Form Card
```html
<div class="card border-0 shadow-sm mb-4">
    <div class="card-body">
        <form method="GET" action="/siswa" class="row g-3">
            <div class="col-md-8">
                <div class="input-group">
                    <span class="input-group-text bg-white">
                        <i class="bi bi-search text-muted"></i>
                    </span>
                    <input type="text" 
                           class="form-control" 
                           name="search" 
                           placeholder="Cari berdasarkan Nama, NIS, atau NISN..." 
                           value="<%= search || '' %>"
                           autocomplete="off">
                    <% if (search) { %>
                        <a href="/siswa" class="btn btn-outline-secondary" title="Hapus pencarian">
                            <i class="bi bi-x-circle"></i>
                        </a>
                    <% } %>
                </div>
            </div>
            <div class="col-md-4">
                <button type="submit" class="btn btn-primary w-100">
                    <i class="bi bi-search me-2"></i>Cari
                </button>
            </div>
        </form>
        <% if (search) { %>
            <small class="text-muted mt-2 d-block">
                <i class="bi bi-info-circle me-1"></i>
                Menampilkan hasil pencarian untuk: "<strong><%= search %></strong>"
            </small>
        <% } %>
    </div>
</div>
```

**Fitur UI:**
- ✅ Search icon di input field
- ✅ Auto-focus ready
- ✅ Clear button (X) saat ada search aktif
- ✅ Search keyword dipertahankan di input
- ✅ Info text menampilkan keyword yang dicari

#### B. Result Count Badge
```html
<% if (siswaList && siswaList.length > 0) { %>
    <div class="d-flex justify-content-between align-items-center mb-3">
        <div>
            <span class="badge bg-primary fs-6">
                <i class="bi bi-people-fill me-1"></i>
                Total: <%= siswaList.length %> siswa
            </span>
            <% if (search) { %>
                <span class="badge bg-info fs-6 ms-2">
                    <i class="bi bi-funnel-fill me-1"></i>
                    Hasil pencarian
                </span>
            <% } %>
        </div>
    </div>
<% } %>
```

**Visual Feedback:**
- Badge biru: Total jumlah siswa
- Badge cyan: Indikator mode pencarian aktif

#### C. Empty State Messages

**Dengan Pencarian (tidak ada hasil):**
```html
<% if (search) { %>
    <i class="bi bi-search" style="font-size: 3rem;"></i>
    <h5 class="text-muted">Tidak ada hasil untuk "<%= search %>"</h5>
    <p class="mb-0">Coba gunakan kata kunci yang berbeda atau 
       <a href="/siswa">lihat semua data siswa</a>
    </p>
<% } else { %>
    <i class="bi bi-inbox" style="font-size: 3rem;"></i>
    <h5 class="text-muted">Belum ada data siswa</h5>
    <p class="mb-0">Silakan <a href="/siswa/tambah">tambah siswa baru</a> atau 
       <a href="/siswa/import">import dari Excel</a>
    </p>
<% } %>
```

**UX Improvement:**
- Pesan berbeda untuk "tidak ditemukan" vs "belum ada data"
- Actionable links untuk navigasi cepat
- Icon visual untuk konteks

## Cara Menggunakan

### Metode 1: Search by Nama
```
1. Buka http://localhost:3000/siswa
2. Ketik nama di kolom pencarian: "Budi"
3. Klik "Cari" atau tekan Enter
4. Hasil: Semua siswa dengan nama mengandung "Budi"
```

**Contoh Pencarian:**
- `"Budi"` → Budi Santoso, Ahmad Budiman, Budiarto
- `"siti"` → Siti Rahayu, Siti Nurhaliza
- `"ahmad"` → Ahmad Yani, Muhammad Ahmad

### Metode 2: Search by NIS
```
1. Ketik NIS: "12345"
2. Klik "Cari"
3. Hasil: Siswa dengan NIS mengandung "12345"
```

**Contoh:**
- `"12345"` → NIS: 12345, 012345, 123456

### Metode 3: Search by NISN
```
1. Ketik NISN: "0012345"
2. Klik "Cari"
3. Hasil: Siswa dengan NISN mengandung "0012345"
```

### Metode 4: Combined with Sort
```
URL: /siswa?sort=kelas&search=budi
→ Urutkan berdasarkan kelas, lalu filter nama "budi"
```

### Metode 5: Clear Search
```
Opsi 1: Klik tombol X di input field
Opsi 2: Hapus text manual dan klik "Cari"
Opsi 3: Klik link "lihat semua data siswa" di empty state
```

## Fitur UI/UX

### 1. Search Form Design
```
┌────────────────────────────────────────────┐
│ 🔍 [Cari berdasarkan Nama, NIS, atau NISN]│ [X] │
└────────────────────────────────────────────┘
         [🔍 Cari]
```

**Characteristics:**
- Clean, modern design dengan Bootstrap 5
- Icon search untuk clarity
- Clear button muncul saat ada text
- Responsive layout

### 2. Visual Indicators

**Active Search State:**
```
┌──────────────────────────────────────────┐
│ 🔍 [budi............................] [X] │
└──────────────────────────────────────────┘
         [🔍 Cari]

ℹ️ Menampilkan hasil pencarian untuk: "budi"

👥 Total: 5 siswa  🔍 Hasil pencarian
```

**No Results State:**
```
┌──────────────────────────────────────────┐
│              🔍                          │
│     Tidak ada hasil untuk "xyz"          │
│  Coba gunakan kata kunci yang berbeda    │
│  atau lihat semua data siswa             │
└──────────────────────────────────────────┘
```

### 3. Search Persistence
- Keyword tetap ada di input field setelah search
- User bisa modify keyword tanpa ketik ulang
- Clear button untuk reset cepat

## Testing Scenarios

### Test 1: Search by Partial Name
**Input:** `"budi"`
**Expected:**
- ✅ Budi Santoso
- ✅ Ahmad Budiman
- ✅ Budiarto
- ❌ Siti Rahayu

### Test 2: Search by NIS
**Input:** `"12345"`
**Expected:**
- ✅ NIS: 12345
- ✅ NIS: 012345
- ✅ NIS: 123456
- ❌ NIS: 67890

### Test 3: Search by NISN
**Input:** `"0012345678"`
**Expected:**
- ✅ NISN: 0012345678
- ✅ NISN: 990012345678
- ❌ NISN: 1122334455

### Test 4: Case Insensitive Search
**Input:** `"BUDI"` atau `"budi"` atau `"Budi"`
**Expected:**
- ✅ Semua menghasilkan hasil yang sama
- ✅ SQLite LIKE is case-insensitive by default

### Test 5: Empty Search
**Input:** `""` (kosong)
**Expected:**
- ✅ Menampilkan semua data
- ✅ Tidak ada badge "Hasil pencarian"

### Test 6: Special Characters
**Input:** `"%"` atau `"_"`
**Expected:**
- ⚠️ LIKE wildcards mungkin perlu escaping
- ✅ Tidak error, tapi hasil mungkin tidak expected

### Test 7: Search + Sort Combined
**URL:** `/siswa?sort=kelas&search=ahmad`
**Expected:**
- ✅ Filter nama "ahmad"
- ✅ Urutkan berdasarkan kelas
- ✅ Badge "Hasil pencarian" muncul

### Test 8: No Results
**Input:** `"xyz123abc"`
**Expected:**
- ✅ Empty state dengan pesan spesifik
- ✅ Link "lihat semua data siswa"
- ✅ Tidak ada error

## Performance Considerations

### 1. Small Dataset (< 1000 students)
- ✅ Client-side atau server-side sama cepatnya
- ✅ LIKE query sangat cepat
- ✅ No index needed

### 2. Medium Dataset (1000-10000 students)
- ✅ Server-side LIKE masih acceptable
- ⚠️ Pertimbangkan indexing pada kolom nama, nis, nisn

### 3. Large Dataset (> 10000 students)
- ⚠️ LIKE dengan wildcard di awal (`%keyword%`) tidak menggunakan index
- 💡 Solusi: 
  - Full-text search (FTS5 di SQLite)
  - Separate search index
  - Paginated results

### 4. SQL Injection Prevention
✅ **Implemented:**
```javascript
const searchTerm = `%${search.trim()}%`;
params.push(searchTerm, searchTerm, searchTerm);
db.all(sql, params, callback);  // Parameterized query
```

❌ **Vulnerable (TIDAK DIGUNAKAN):**
```javascript
// JANGAN PERNAH lakukan ini!
const sql = `WHERE nama LIKE '%${search}%'`;  // SQL Injection risk!
```

## Future Enhancements

### 1. Advanced Filters
```
┌─────────────────────────────────┐
│ 🔍 [Search...]                  │
│                                 │
│ Kelas: [Dropdown]               │
│ Status: [Aktif ▼]               │
│ Jenis Kelamin: [Semua ▼]        │
│                                 │
│ [🔍 Filter] [↺ Reset]           │
└─────────────────────────────────┘
```

### 2. Search History
- Save recent searches in localStorage
- Dropdown suggestion saat typing

### 3. Debounced Auto-Search
- Trigger search after user stops typing (500ms)
- No need to click "Cari" button
- Better UX untuk power users

### 4. Highlight Search Terms
- Highlight matching text in results table
- Visual feedback untuk user

### 5. Export Search Results
- Button "Export Hasil Pencarian"
- Download filtered data as Excel/PDF

## Security Best Practices

### 1. Input Sanitization
```javascript
// Trim whitespace
const search = req.query.search || '';
const cleanSearch = search.trim();

// Empty check
if (cleanSearch === '') {
  // No search, return all
}
```

### 2. Parameterized Queries
```javascript
// ✅ SAFE
db.all(sql, [searchTerm, searchTerm, searchTerm], callback);

// ❌ UNSAFE
db.all(`WHERE nama LIKE '%${search}%'`, callback);
```

### 3. Length Limits
```javascript
// Optional: Add max length validation
if (search.length > 100) {
  req.flash('error', 'Pencarian terlalu panjang!');
  return res.redirect('/siswa');
}
```

## File Changes Summary

### Modified Files:
1. ✅ [`models/Siswa.js`](file://d:\SISTEMINFORMASI\models\Siswa.js)
   - Added `search` parameter to `getAll()` method
   - Implemented LIKE query with parameterized inputs
   - Support search across 3 fields (nama, nis, nisn)

2. ✅ [`routes/siswa.js`](file://d:\SISTEMINFORMASI\routes\siswa.js)
   - Extract `search` from query parameters
   - Pass search to model and view
   - Maintain search state in URL

3. ✅ [`views/siswa/index.ejs`](file://d:\SISTEMINFORMASI\views\siswa\index.ejs)
   - Added search form card
   - Added result count badges
   - Enhanced empty state messages
   - Added clear button functionality

### Lines of Code Added:
- Model: ~15 lines
- Route: ~3 lines
- View: ~60 lines
- **Total: ~78 lines**

## Rollback Instructions

Jika ingin menghapus fitur pencarian:

1. **Revert Model:**
```javascript
// models/Siswa.js
getAll: (sortBy, callback) => {  // Remove search parameter
  let sql = `...`;
  // Remove search logic
  db.all(sql, [], callback);  // Empty params
}
```

2. **Revert Route:**
```javascript
// routes/siswa.js
const sortBy = req.query.sort || 'nama';
// Remove: const search = req.query.search || '';
Siswa.getAll(sortBy, (err, rows) => {  // Remove search param
  // Remove search from render
});
```

3. **Remove View Components:**
- Delete search form card
- Remove result count badges
- Revert empty state message

---

**Status:** ✅ Completed  
**Impact:** Medium (UX enhancement)  
**Breaking Changes:** None  
**Performance Impact:** Negligible untuk dataset kecil  
**Security:** ✅ Parameterized queries, no SQL injection risk
