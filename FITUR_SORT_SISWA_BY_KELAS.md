# Fitur Sortir Data Siswa Berdasarkan Kelas

## Deskripsi Fitur

Menambahkan tombol sortir (sort) pada halaman **Data Siswa** yang memungkinkan pengguna untuk mengurutkan daftar siswa berdasarkan:
1. **Nama Siswa** (default) - Urutan alfabetis A-Z
2. **Kelas** - Urutan berdasarkan nama kelas, kemudian nama siswa dalam setiap kelas

## Manfaat

✅ **Navigasi Lebih Mudah**: Memudahkan pencarian siswa dalam kelas tertentu  
✅ **Organisasi Data**: Menampilkan data dengan lebih terstruktur  
✅ **Efisiensi Waktu**: Tidak perlu scroll manual untuk mencari siswa di kelas tertentu  
✅ **User Experience**: Tombol sort yang intuitif dengan indikator visual  

## Implementasi Teknis

### 1. Model Update ([`models/Siswa.js`](d:\SISTEMINFORMASI\models\Siswa.js))

**Method `getAll(sortBy, callback)`** - Updated to accept sort parameter:

```javascript
getAll: (sortBy, callback) => {
  let sql = `
    SELECT s.*, k.nama_kelas
    FROM siswa s
    LEFT JOIN kelas k ON s.kelas_id = k.id
  `;
  
  // Determine sort order
  if (sortBy === 'kelas') {
    sql += ` ORDER BY k.nama_kelas ASC, s.nama_siswa ASC`;
  } else {
    sql += ` ORDER BY s.nama_siswa ASC`;
  }
  
  db.all(sql, [], callback);
}
```

**Logika Sorting:**
- **`sortBy = 'nama'`** (default): `ORDER BY s.nama_siswa ASC`
  - Mengurutkan berdasarkan nama siswa secara alfabetis
  
- **`sortBy = 'kelas'`**: `ORDER BY k.nama_kelas ASC, s.nama_siswa ASC`
  - Primary sort: Nama kelas (X IPA 1, X IPA 2, XI IPA 1, dst)
  - Secondary sort: Nama siswa dalam setiap kelas

### 2. Route Update ([`routes/siswa.js`](d:\SISTEMINFORMASI\routes\siswa.js))

**Route `/siswa`** - Updated to handle query parameter:

```javascript
router.get('/', (req, res) => {
  // Sync all class student counts before displaying
  const Kelas = require('../models/Kelas');
  Kelas.syncAllJumlahSiswa((syncErr) => {
    if (syncErr) {
      console.error('Error syncing student counts:', syncErr);
    }
    
    // Get sort parameter from query string
    const sortBy = req.query.sort || 'nama';
    
    Siswa.getAll(sortBy, (err, rows) => {
      if (err) {
        console.error(err);
        res.status(500).send('Terjadi kesalahan pada server');
      } else {
        res.render('siswa/index', { 
          title: 'Daftar Siswa - SMA Negeri 12 Pontianak',
          siswaList: rows,
          sortBy: sortBy,  // Pass to view for UI state
          showBackButton: true
        });
      }
    });
  });
});
```

**Cara Kerja:**
1. Membaca parameter `sort` dari query string (`req.query.sort`)
2. Default ke `'nama'` jika tidak ada parameter
3. Pass parameter ke model untuk sorting
4. Pass parameter ke view untuk menampilkan state aktif

### 3. View Update ([`views/siswa/index.ejs`](d:\SISTEMINFORMASI\views\siswa\index.ejs))

#### A. Sort Buttons

Menambahkan button group untuk sorting:

```html
<div class="btn-group" role="group">
    <a href="/siswa?sort=nama" class="btn btn-sm <%= sortBy === 'nama' ? 'btn-primary' : 'btn-outline-primary' %>">
        <i class="bi bi-sort-alpha-down me-1"></i>Urutkan Nama
    </a>
    <a href="/siswa?sort=kelas" class="btn btn-sm <%= sortBy === 'kelas' ? 'btn-primary' : 'btn-outline-primary' %>">
        <i class="bi bi-sort-down me-1"></i>Urutkan Kelas
    </a>
</div>
```

**Fitur UI:**
- **Bootstrap Button Group**: Tombol dikelompokkan secara visual
- **Active State**: Tombol yang aktif menggunakan `btn-primary`, yang tidak aktif `btn-outline-primary`
- **Icons**: Menggunakan Bootstrap Icons untuk visual cue
  - `bi-sort-alpha-down`: Icon untuk sort alphabetis
  - `bi-sort-down`: Icon untuk sort umum

#### B. Table Header Indicators

Menambahkan indikator sort di header tabel:

```html
<th>
    <% if (sortBy === 'nama') { %>
        <span class="text-primary"><i class="bi bi-sort-alpha-down me-1"></i></span>Nama Siswa
    <% } else { %>
        Nama Siswa
    <% } %>
</th>
<th>
    <% if (sortBy === 'kelas') { %>
        <span class="text-primary"><i class="bi bi-sort-down me-1"></i></span>Kelas
    <% } else { %>
        Kelas
    <% } %>
</th>
```

**Visual Feedback:**
- Kolom yang sedang diurutkan menampilkan icon berwarna biru (`text-primary`)
- Memberikan konteks visual yang jelas tentang kriteria sorting saat ini

## Cara Penggunaan

### Scenario 1: Sort by Nama (Default)

1. Buka halaman `/siswa`
2. Secara default, siswa diurutkan berdasarkan nama (A-Z)
3. Tombol "Urutkan Nama" berwarna biru (aktif)
4. Header "Nama Siswa" menampilkan icon sort

### Scenario 2: Sort by Kelas

1. Buka halaman `/siswa`
2. Klik tombol **"Urutkan Kelas"**
3. URL berubah menjadi `/siswa?sort=kelas`
4. Daftar siswa sekarang diurutkan:
   - Semua siswa kelas X IPA 1 (diurutkan nama)
   - Semua siswa kelas X IPA 2 (diurutkan nama)
   - Semua siswa kelas XI IPA 1 (diurutkan nama)
   - Dan seterusnya...
5. Tombol "Urutkan Kelas" berwarna biru (aktif)
6. Header "Kelas" menampilkan icon sort

### Scenario 3: Toggle Between Sorts

1. Saat ini sedang sort by kelas
2. Klik tombol **"Urutkan Nama"**
3. Kembali ke urutan alfabetis tanpa pengelompokan kelas
4. URL kembali ke `/siswa?sort=nama` atau `/siswa`

## Contoh Output

### Sebelum Sort (by Nama):
```
| No | NIS  | Nama         | Kelas    |
|----|------|--------------|----------|
| 1  | 1001 | Ahmad        | XII IPA 2|
| 2  | 1002 | Budi         | X IPA 1  |
| 3  | 1003 | Citra        | XI IPA 1 |
| 4  | 1004 | Diana        | X IPA 1  |
```

### Setelah Sort by Kelas:
```
| No | NIS  | Nama         | Kelas    |
|----|------|--------------|----------|
| 1  | 1002 | Budi         | X IPA 1  |
| 2  | 1004 | Diana        | X IPA 1  |
| 3  | 1003 | Citra        | XI IPA 1 |
| 4  | 1001 | Ahmad        | XII IPA 2|
```

**Perhatikan:**
- Siswa dikelompokkan berdasarkan kelas
- Dalam setiap kelas, siswa tetap diurutkan berdasarkan nama

## Testing

### Test Case 1: Default Sort
```
1. Akses /siswa
2. Verifikasi:
   ✅ Data terurut berdasarkan nama (A-Z)
   ✅ Tombol "Urutkan Nama" berwarna biru
   ✅ Icon sort muncul di header "Nama Siswa"
```

### Test Case 2: Sort by Kelas
```
1. Klik tombol "Urutkan Kelas"
2. Verifikasi:
   ✅ URL berubah ke /siswa?sort=kelas
   ✅ Data terkelompok per kelas
   ✅ Dalam setiap kelas, data terurut nama
   ✅ Tombol "Urutkan Kelas" berwarna biru
   ✅ Icon sort muncul di header "Kelas"
```

### Test Case 3: Switch Back to Name Sort
```
1. Dari mode sort by kelas, klik "Urutkan Nama"
2. Verifikasi:
   ✅ URL kembali ke /siswa atau /siswa?sort=nama
   ✅ Data kembali terurut nama tanpa pengelompokan
   ✅ Tombol "Urutkan Nama" kembali biru
```

### Test Case 4: Persistence After Actions
```
1. Set sort by kelas
2. Tambah siswa baru
3. Setelah redirect, verifikasi:
   ✅ Sort mode tetap terjaga (jika diimplementasikan)
   Atau
   ✅ Kembali ke default (current behavior)
```

## Performance Considerations

### Query Optimization:

**Current Implementation:**
```sql
SELECT s.*, k.nama_kelas
FROM siswa s
LEFT JOIN kelas k ON s.kelas_id = k.id
ORDER BY k.nama_kelas ASC, s.nama_siswa ASC
```

**Recommended Indexes:**
Untuk performa optimal dengan data besar (>1000 siswa), tambahkan index:

```sql
CREATE INDEX idx_siswa_nama ON siswa(nama_siswa);
CREATE INDEX idx_siswa_kelas_id ON siswa(kelas_id);
CREATE INDEX idx_kelas_nama ON kelas(nama_kelas);
```

**Impact:**
- ✅ Tanpa index: O(n log n) untuk sorting
- ✅ Dengan index: Database dapat menggunakan index untuk menghindari full table scan
- ✅ Untuk <500 siswa: Perbedaan tidak signifikan

## Edge Cases

### 1. Siswa Tanpa Kelas (kelas_id = NULL)
**Behavior:**
- Dengan sort by nama: Siswa tanpa kelas tersebar di seluruh list berdasarkan nama
- Dengan sort by kelas: Siswa tanpa kelas akan muncul di awal (NULL sorts first) atau akhir tergantung database

**Solution:**
Jika ingin siswa tanpa kelas selalu di akhir:
```sql
ORDER BY 
  CASE WHEN k.nama_kelas IS NULL THEN 1 ELSE 0 END,
  k.nama_kelas ASC, 
  s.nama_siswa ASC
```

### 2. Kelas dengan Nama Tidak Standar
**Example:** "X IPA 1", "XII IPS 2", "X-A"
**Behavior:** Sorting mengikuti ASCII/Unicode order
- "X IPA 1" < "X IPA 2" < "XI IPA 1" < "XII IPA 1"

**Note:** Ini adalah behavior yang diharapkan untuk nama kelas standar Indonesia

### 3. Empty Dataset
**Behavior:** Tidak ada error, tabel menampilkan pesan "Belum ada data siswa"

### 4. Invalid Sort Parameter
**Example:** `/siswa?sort=invalid`
**Behavior:** Default ke sort by nama karena kondisi `else` clause

## Customization Options

### Menambah Opsi Sort Baru:

**Contoh: Sort by Tahun Ajaran**

1. **Update Model:**
```javascript
getAll: (sortBy, callback) => {
  let sql = `
    SELECT s.*, k.nama_kelas
    FROM siswa s
    LEFT JOIN kelas k ON s.kelas_id = k.id
  `;
  
  if (sortBy === 'kelas') {
    sql += ` ORDER BY k.nama_kelas ASC, s.nama_siswa ASC`;
  } else if (sortBy === 'tahun_ajaran') {
    sql += ` ORDER BY s.tahun_ajaran DESC, k.nama_kelas ASC, s.nama_siswa ASC`;
  } else {
    sql += ` ORDER BY s.nama_siswa ASC`;
  }
  
  db.all(sql, [], callback);
}
```

2. **Update View:**
```html
<a href="/siswa?sort=tahun_ajaran" class="btn btn-sm <%= sortBy === 'tahun_ajaran' ? 'btn-primary' : 'btn-outline-primary' %>">
    <i class="bi bi-calendar me-1"></i>Urutkan Tahun Ajaran
</a>
```

### Mengubah Default Sort:

Ubah di route:
```javascript
const sortBy = req.query.sort || 'kelas'; // Change default to 'kelas'
```

### Adding Descending Sort:

Tambahkan parameter `order`:
```javascript
// URL: /siswa?sort=nama&order=desc
const sortBy = req.query.sort || 'nama';
const sortOrder = req.query.order || 'asc';

let orderClause = '';
if (sortBy === 'kelas') {
  orderClause = `k.nama_kelas ${sortOrder}, s.nama_siswa ASC`;
} else {
  orderClause = `s.nama_siswa ${sortOrder}`;
}

sql += ` ORDER BY ${orderClause}`;
```

## Troubleshooting

### Masalah: Sort tidak berfungsi

**Solusi:**
1. Cek browser console untuk JavaScript errors
2. Verifikasi URL memiliki parameter yang benar: `/siswa?sort=kelas`
3. Cek server logs untuk query errors
4. Test query SQL langsung di SQLite:
   ```sql
   SELECT s.*, k.nama_kelas
   FROM siswa s
   LEFT JOIN kelas k ON s.kelas_id = k.id
   ORDER BY k.nama_kelas ASC, s.nama_siswa ASC;
   ```

### Masalah: Icon tidak muncul

**Solusi:**
1. Pastikan Bootstrap Icons CSS ter-load di layout:
   ```html
   <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.5/font/bootstrap-icons.css">
   ```
2. Clear browser cache
3. Cek network tab untuk failed requests

### Masalah: Sorting tidak konsisten

**Solusi:**
1. Pastikan data `kelas_id` valid dan match dengan tabel `kelas`
2. Cek apakah ada siswa dengan `kelas_id = NULL`
3. Verify data integrity:
   ```sql
   SELECT s.id, s.nama_siswa, s.kelas_id, k.nama_kelas
   FROM siswa s
   LEFT JOIN kelas k ON s.kelas_id = k.id
   WHERE s.kelas_id IS NOT NULL AND k.id IS NULL;
   ```

## Best Practices

✅ **DO:**
- Gunakan query parameters untuk state management
- Berikan visual feedback yang jelas (active buttons, icons)
- Default ke sort yang paling umum digunakan (nama)
- Test dengan dataset besar untuk performance

❌ **DON'T:**
- Jangan gunakan session untuk menyimpan preferensi sort (kurang flexible)
- Jangan lupa handle invalid sort parameters
- Jangan hardcode sort logic di multiple places
- Jangan lupakan edge cases (NULL values, empty datasets)

## Future Enhancements

### Potential Improvements:

1. **Multi-column Sort**:
   - Allow users to sort by multiple criteria
   - Example: First by class, then by gender, then by name

2. **Sort Direction Toggle**:
   - Add ascending/descending toggle for each column
   - Click header to toggle direction

3. **Persistent Preferences**:
   - Save user's sort preference in localStorage
   - Restore on next visit

4. **Server-side Pagination + Sort**:
   - Combine with pagination for large datasets
   - Maintain sort state across pages

5. **Advanced Filter + Sort**:
   - Filter by class first, then sort within filtered results
   - Combine with search functionality

## Summary

### Files Modified:

| File | Changes | Lines Changed |
|------|---------|---------------|
| [`models/Siswa.js`](d:\SISTEMINFORMASI\models\Siswa.js) | Updated getAll() method | +8 lines |
| [`routes/siswa.js`](d:\SISTEMINFORMASI\routes\siswa.js) | Added sort parameter handling | +5 lines |
| [`views/siswa/index.ejs`](d:\SISTEMINFORMASI\views\siswa\index.ejs) | Added sort buttons & indicators | +20 lines |

### Features Implemented:

✅ **Two Sort Modes**: By name (default) and by class  
✅ **Visual Indicators**: Active button state and header icons  
✅ **Clean UI**: Bootstrap button group with icons  
✅ **Flexible**: Easy to add more sort options  
✅ **Performant**: Efficient SQL ORDER BY clauses  
✅ **User-Friendly**: Intuitive controls with clear feedback  

### Benefits:

🎯 **Improved UX**: Users can quickly find students by class  
📊 **Better Organization**: Data presented in logical groups  
⚡ **Fast Navigation**: One-click sorting without page reload complexity  
🔍 **Enhanced Discoverability**: Visual cues guide user interaction  

---

**Versi**: 1.0  
**Terakhir Diupdate**: 2026-04-06  
**Status**: ✅ Siap Digunakan  
**Test Coverage**: 4 test scenarios + 4 edge cases
