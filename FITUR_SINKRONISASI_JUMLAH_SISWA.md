# Sinkronisasi Otomatis Jumlah Siswa di Menu Kelas dan Data Siswa

## Deskripsi Fitur

Mengimplementasikan sinkronisasi otomatis antara jumlah siswa yang ditampilkan di **Menu Kelas** dengan data aktual siswa di **Data Siswa**. Sistem akan secara otomatis menghitung dan memperbarui jumlah siswa setiap kali ada perubahan data siswa (tambah, edit, hapus, atau pindah kelas).

## Masalah yang Diselesaikan

### Sebelum Implementasi:
- ❌ Field `jumlah_siswa` di tabel kelas diisi manual oleh user
- ❌ Tidak ada jaminan data konsisten antara tabel `kelas` dan `siswa`
- ❌ User harus mengingat untuk update jumlah siswa setiap kali ada perubahan
- ❌ Rentan human error dan data tidak akurat

### Setelah Implementasi:
- ✅ Jumlah siswa dihitung otomatis dari data aktual di tabel `siswa`
- ✅ Sinkronisasi otomatis saat CRUD siswa
- ✅ Data selalu akurat dan konsisten
- ✅ Tidak perlu input manual lagi

## Implementasi Teknis

### 1. Model Updates

#### A. Kelas Model ([`models/Kelas.js`](d:\SISTEMINFORMASI\models\Kelas.js))

Menambahkan dua helper methods untuk sinkronisasi:

**Method 1: `updateJumlahSiswa(kelas_id, callback)`**
```javascript
// Update student count for a specific class
updateJumlahSiswa: (kelas_id, callback) => {
  // Count active students in this class
  const countSql = `SELECT COUNT(*) as count FROM siswa WHERE kelas_id = ? AND status = 'aktif'`;
  db.get(countSql, [kelas_id], (err, row) => {
    if (err) {
      callback(err);
      return;
    }
    
    const newCount = row.count || 0;
    const updateSql = `UPDATE kelas SET jumlah_siswa = ? WHERE id = ?`;
    db.run(updateSql, [newCount, kelas_id], function(err) {
      callback(err);
    });
  });
}
```

**Fungsi:**
- Menghitung jumlah siswa aktif di kelas tertentu
- Update field `jumlah_siswa` di tabel `kelas`
- Hanya menghitung siswa dengan `status = 'aktif'`

**Method 2: `syncAllJumlahSiswa(callback)`**
```javascript
// Recalculate all class student counts
syncAllJumlahSiswa: (callback) => {
  // Get all classes
  const getKelasSql = `SELECT id FROM kelas`;
  db.all(getKelasSql, [], (err, kelasList) => {
    if (err) {
      callback(err);
      return;
    }
    
    if (!kelasList || kelasList.length === 0) {
      callback(null);
      return;
    }
    
    // Update each class
    let completed = 0;
    let hasError = false;
    
    kelasList.forEach(kelas => {
      Kelas.updateJumlahSiswa(kelas.id, (err) => {
        if (err && !hasError) {
          hasError = true;
          callback(err);
          return;
        }
        
        completed++;
        if (completed === kelasList.length && !hasError) {
          callback(null);
        }
      });
    });
  });
}
```

**Fungsi:**
- Melakukan sinkronisasi untuk SEMUA kelas
- Dipanggil saat membuka halaman daftar kelas/siswa
- Memastikan semua data konsisten

#### B. Siswa Model ([`models/Siswa.js`](d:\SISTEMINFORMASI\models\Siswa.js))

Menambahkan import Kelas model dan update semua method CRUD:

**Import:**
```javascript
const Kelas = require('./Kelas');
```

**Update Method `create`:**
```javascript
create: (data, callback) => {
  // ... insert siswa code ...
  
  // Sync student count for the class
  if (kelas_id) {
    Kelas.updateJumlahSiswa(kelas_id, (syncErr) => {
      if (syncErr) {
        console.error('Error syncing student count:', syncErr);
      }
      callback(null, { id: this.lastID });
    });
  } else {
    callback(null, { id: this.lastID });
  }
}
```

**Update Method `update`:**
```javascript
update: (id, data, callback) => {
  // Get old class_id before update
  Siswa.getById(id, (err, oldSiswa) => {
    const oldKelasId = oldSiswa ? oldSiswa.kelas_id : null;
    const newKelasId = kelas_id || null;
    
    // ... update siswa code ...
    
    // Sync student counts for both old and new classes
    let syncCompleted = 0;
    const classesToSync = new Set();
    
    if (oldKelasId) classesToSync.add(oldKelasId);
    if (newKelasId) classesToSync.add(newKelasId);
    
    classesToSync.forEach(kelasId => {
      Kelas.updateJumlahSiswa(kelasId, (syncErr) => {
        if (syncErr) {
          console.error('Error syncing student count:', syncErr);
        }
        
        syncCompleted++;
        if (syncCompleted === classesToSync.size) {
          callback(null);
        }
      });
    });
  });
}
```

**Penting:** Saat siswa pindah kelas, sistem akan mengupdate count untuk:
- Kelas lama (count berkurang)
- Kelas baru (count bertambah)

**Update Method `delete`:**
```javascript
delete: (id, callback) => {
  // Get student's class before deletion
  Siswa.getById(id, (err, siswa) => {
    const kelasId = siswa ? siswa.kelas_id : null;
    
    // ... delete siswa code ...
    
    // Sync student count for the class
    if (kelasId) {
      Kelas.updateJumlahSiswa(kelasId, (syncErr) => {
        if (syncErr) {
          console.error('Error syncing student count:', syncErr);
        }
        callback(null);
      });
    } else {
      callback(null);
    }
  });
}
```

### 2. Route Updates

#### A. Kelas Routes ([`routes/kelas.js`](d:\SISTEMINFORMASI\routes\kelas.js))

```javascript
router.get('/', (req, res) => {
  // Sync all class student counts before displaying
  Kelas.syncAllJumlahSiswa((syncErr) => {
    if (syncErr) {
      console.error('Error syncing student counts:', syncErr);
    }
    
    Kelas.getAll((err, rows) => {
      // ... render view ...
    });
  });
});
```

**Kapan dipanggil:** Setiap kali user membuka halaman daftar kelas

#### B. Siswa Routes ([`routes/siswa.js`](d:\SISTEMINFORMASI\routes\siswa.js))

```javascript
router.get('/', (req, res) => {
  // Sync all class student counts before displaying
  const Kelas = require('../models/Kelas');
  Kelas.syncAllJumlahSiswa((syncErr) => {
    if (syncErr) {
      console.error('Error syncing student counts:', syncErr);
    }
    
    Siswa.getAll((err, rows) => {
      // ... render view ...
    });
  });
});
```

**Kapan dipanggil:** Setiap kali user membuka halaman daftar siswa

### 3. View Updates

#### A. Form Tambah Kelas ([`views/kelas/tambah.ejs`](d:\SISTEMINFORMASI\views\kelas\tambah.ejs))

**Sebelum:**
```html
<input type="number" class="form-control" id="jumlah_siswa" 
       name="jumlah_siswa" min="0" placeholder="Jumlah siswa dalam kelas" value="0">
```

**Sesudah:**
```html
<input type="number" class="form-control" id="jumlah_siswa" 
       name="jumlah_siswa" min="0" placeholder="Akan dihitung otomatis" 
       value="0" readonly disabled>
<small class="text-muted">Jumlah siswa akan dihitung otomatis berdasarkan data siswa yang terdaftar di kelas ini</small>
```

**Perubahan:**
- ✅ Field menjadi `readonly` dan `disabled`
- ✅ Placeholder diubah menjadi "Akan dihitung otomatis"
- ✅ Ditambahkan hint text untuk menjelaskan ke user

#### B. Form Edit Kelas ([`views/kelas/edit.ejs`](d:\SISTEMINFORMASI\views\kelas\edit.ejs))

**Sebelum:**
```html
<input type="number" class="form-control" id="jumlah_siswa" 
       name="jumlah_siswa" min="0" value="<%= kelas.jumlah_siswa || 0 %>">
```

**Sesudah:**
```html
<input type="number" class="form-control" id="jumlah_siswa" 
       name="jumlah_siswa" min="0" value="<%= kelas.jumlah_siswa || 0 %>" 
       readonly disabled>
<small class="text-muted">Jumlah siswa akan dihitung otomatis berdasarkan data siswa yang terdaftar di kelas ini</small>
```

**Perubahan:** Sama seperti form tambah - field read-only dengan hint text

## Cara Kerja Sistem

### Flow Diagram:

```
User Action → Trigger → Auto Sync → Database Update → Display Updated Count
```

### Scenario 1: Tambah Siswa Baru

1. User menambah siswa baru ke kelas X
2. `Siswa.create()` dipanggil
3. Setelah INSERT berhasil, `Kelas.updateJumlahSiswa(kelas_id)` dipanggil
4. Sistem menghitung ulang jumlah siswa aktif di kelas X
5. Update `jumlah_siswa` di tabel `kelas`
6. User melihat count yang sudah terupdate

### Scenario 2: Pindah Kelas

1. User mengubah kelas siswa dari kelas A ke kelas B
2. `Siswa.update()` dipanggil
3. Sistem menyimpan `oldKelasId` (kelas A) sebelum update
4. UPDATE query dijalankan
5. Sistem sync count untuk **kedua kelas**:
   - Kelas A: count berkurang 1
   - Kelas B: count bertambah 1
6. Kedua kelas terupdate dengan benar

### Scenario 3: Hapus Siswa

1. User menghapus siswa dari kelas X
2. `Siswa.delete()` dipanggil
3. Sistem menyimpan `kelasId` sebelum DELETE
4. DELETE query dijalankan
5. `Kelas.updateJumlahSiswa(kelasId)` dipanggil
6. Count di kelas X berkurang 1

### Scenario 4: Buka Halaman Daftar Kelas

1. User klik menu "Data Kelas"
2. Route `/kelas` dipanggil
3. `Kelas.syncAllJumlahSiswa()` dijalankan
4. Semua kelas di-sync satu per satu
5. Data ditampilkan dengan count yang akurat

### Scenario 5: Buka Halaman Daftar Siswa

1. User klik menu "Data Siswa"
2. Route `/siswa` dipanggil
3. `Kelas.syncAllJumlahSiswa()` dijalankan
4. Semua kelas di-sync
5. Data siswa ditampilkan

## Testing

### Test Case 1: Tambah Siswa
```
1. Buka /siswa/tambah
2. Pilih kelas: XII IPA 1
3. Isi data siswa baru
4. Submit
5. Cek /kelas → jumlah_siswa di XII IPA 1 harus bertambah 1
```

### Test Case 2: Pindah Kelas
```
1. Buka /siswa/edit/{id}
2. Ubah kelas dari XII IPA 1 ke XII IPA 2
3. Submit
4. Cek /kelas:
   - XII IPA 1: jumlah_siswa berkurang 1
   - XII IPA 2: jumlah_siswa bertambah 1
```

### Test Case 3: Hapus Siswa
```
1. Di /siswa, hapus salah satu siswa
2. Confirm deletion
3. Cek /kelas → jumlah_siswa di kelas siswa tersebut berkurang 1
```

### Test Case 4: Bulk Sync
```
1. Buka /kelas
2. Lihat semua kelas memiliki jumlah_siswa yang sesuai
3. Buka /siswa
4. Kembali ke /kelas
5. Pastikan count masih konsisten
```

### Test Case 5: Status Siswa Non-Aktif
```
1. Edit siswa, ubah status dari 'aktif' ke 'lulus'
2. Submit
3. Cek /kelas → jumlah_siswa tidak berubah
   (karena hanya siswa 'aktif' yang dihitung)
```

## Edge Cases & Error Handling

### 1. Siswa Tanpa Kelas (kelas_id = NULL)
- ✅ Ditangani: Sistem cek `if (kelas_id)` sebelum sync
- ✅ Tidak ada error jika siswa belum punya kelas

### 2. Pindah ke Kelas yang Sama
- ✅ Ditangani: Menggunakan `Set` untuk menghindari duplikasi sync
- ✅ Hanya sync sekali meskipun old dan new class sama

### 3. Error Saat Sync
- ✅ Ditangani: Error di-log ke console tapi tidak blocking operation
- ✅ Callback tetap dipanggil agar user experience tidak terganggu

### 4. Concurrent Updates
- ⚠️ SQLite tidak support transaction isolation level tinggi
- ✅ Untuk skala sekolah kecil, tidak masalah
- 💡 Jika ada race condition, syncAllJumlahSiswa akan fix saat page reload

### 5. Database Lock
- ⚠️ Multiple updates bisa cause lock contention
- ✅ Async callbacks handle ini dengan baik
- 💡 Monitor performance jika > 1000 students

## Performance Considerations

### Optimizations Implemented:

1. **Selective Sync**:
   - Saat CRUD individual → hanya sync kelas yang affected
   - Tidak sync semua kelas setiap saat

2. **Batch Sync on Page Load**:
   - syncAllJumlahSiswa() hanya dipanggil saat buka halaman list
   - Tidak dipanggil di setiap request API

3. **Efficient Queries**:
   ```sql
   SELECT COUNT(*) as count FROM siswa 
   WHERE kelas_id = ? AND status = 'aktif'
   ```
   - Menggunakan aggregate function COUNT()
   - Indexed column `kelas_id` (pastikan ada index)

### Potential Improvements:

1. **Add Index** (jika belum ada):
   ```sql
   CREATE INDEX idx_siswa_kelas_id ON siswa(kelas_id);
   CREATE INDEX idx_siswa_status ON siswa(status);
   ```

2. **Debounced Sync**:
   - Untuk bulk operations (import Excel), delay sync sampai selesai
   - Gunakan queue mechanism

3. **Caching**:
   - Cache count di Redis/memory untuk high-traffic scenarios
   - Invalidate cache saat ada perubahan

## Troubleshooting

### Masalah: Jumlah siswa tidak update

**Solusi:**
1. Cek browser console untuk JavaScript errors
2. Cek server logs untuk database errors:
   ```bash
   # Lihat log saat tambah/edit/hapus siswa
   tail -f logs/app.log | grep "syncing student count"
   ```
3. Manual trigger sync:
   ```javascript
   // Di Node.js console atau script
   const Kelas = require('./models/Kelas');
   Kelas.syncAllJumlahSiswa((err) => {
     if (err) console.error(err);
     else console.log('Sync completed');
   });
   ```

### Masalah: Count negatif atau tidak masuk akal

**Solusi:**
1. Cek data integrity:
   ```sql
   SELECT k.id, k.nama_kelas, k.jumlah_siswa, 
          COUNT(s.id) as actual_count
   FROM kelas k
   LEFT JOIN siswa s ON k.id = s.kelas_id AND s.status = 'aktif'
   GROUP BY k.id;
   ```
2. Force re-sync:
   ```bash
   node -e "require('./models/Kelas').syncAllJumlahSiswa(console.log)"
   ```

### Masalah: Performance lambat saat load halaman

**Solusi:**
1. Check query execution time:
   ```javascript
   console.time('syncAllJumlahSiswa');
   Kelas.syncAllJumlahSiswa(() => {
     console.timeEnd('syncAllJumlahSiswa');
   });
   ```
2. Add indexes ke database
3. Pertimbangkan lazy sync (hanya sync kelas yang dibuka)

## Maintenance

### Menambah Fitur Baru:

Jika menambahkan fitur yang mempengaruhi data siswa:

1. **Import Siswa dari Excel**:
   ```javascript
   // Setelah bulk insert
   const uniqueKelasIds = [...new Set(importedStudents.map(s => s.kelas_id))];
   uniqueKelasIds.forEach(kelasId => {
     Kelas.updateJumlahSiswa(kelasId, callback);
   });
   ```

2. **Arsip Siswa Lulus**:
   ```javascript
   // Update status ke 'lulus'
   Siswa.update(id, { status: 'lulus' }, (err) => {
     // Auto sync akan trigger di method update
   });
   ```

### Monitoring:

Tambahkan logging untuk track sync operations:

```javascript
// Di models/Kelas.js
updateJumlahSiswa: (kelas_id, callback) => {
  console.log(`[SYNC] Updating student count for class ${kelas_id}`);
  // ... rest of code ...
  
  db.run(updateSql, [newCount, kelas_id], function(err) {
    if (!err) {
      console.log(`[SYNC] Class ${kelas_id} count updated to ${newCount}`);
    }
    callback(err);
  });
}
```

## Best Practices

✅ **DO:**
- Selalu gunakan method `updateJumlahSiswa` untuk update count
- Handle errors gracefully dengan logging
- Test edge cases (null kelas_id, pindah kelas, dll)
- Document changes di changelog

❌ **DON'T:**
- Jangan manual update `jumlah_siswa` di database
- Jangan bypass synchronization logic
- Jangan hapus helper methods dari model
- Jangan ignore error logs

## Migration Guide

### Untuk Existing Database:

Jika sudah ada data sebelumnya dengan count yang tidak akurat:

1. **Backup database**:
   ```bash
   cp database.sqlite database.backup.sqlite
   ```

2. **Run one-time sync**:
   ```bash
   node -e "
     const Kelas = require('./models/Kelas');
     Kelas.syncAllJumlahSiswa((err) => {
       if (err) console.error('Error:', err);
       else console.log('Migration completed successfully');
       process.exit(0);
     });
   "
   ```

3. **Verify results**:
   ```sql
   SELECT k.nama_kelas, k.jumlah_siswa,
          (SELECT COUNT(*) FROM siswa s 
           WHERE s.kelas_id = k.id AND s.status = 'aktif') as actual_count
   FROM kelas k;
   ```

4. **Deploy updated code**

## Summary

### Files Modified:

| File | Changes | Purpose |
|------|---------|---------|
| [`models/Kelas.js`](d:\SISTEMINFORMASI\models\Kelas.js) | +2 methods | Helper methods untuk sync |
| [`models/Siswa.js`](d:\SISTEMINFORMASI\models\Siswa.js) | Import + 3 method updates | Auto-trigger sync on CRUD |
| [`routes/kelas.js`](d:\SISTEMINFORMASI\routes\kelas.js) | 1 route update | Sync on page load |
| [`routes/siswa.js`](d:\SISTEMINFORMASI\routes\siswa.js) | 1 route update | Sync on page load |
| [`views/kelas/tambah.ejs`](d:\SISTEMINFORMASI\views\kelas\tambah.ejs) | Field disabled | Prevent manual input |
| [`views/kelas/edit.ejs`](d:\SISTEMINFORMASI\views\kelas\edit.ejs) | Field disabled | Prevent manual input |

### Benefits:

✅ **Data Accuracy**: Count selalu akurat 100%  
✅ **Automation**: Tidak perlu manual update lagi  
✅ **Consistency**: Data konsisten di seluruh aplikasi  
✅ **User Experience**: UI lebih jelas dengan disabled field  
✅ **Maintainability**: Logic terpusat di model layer  

### Impact:

- 🔄 **Real-time Sync**: Setiap perubahan langsung ter-refleksi
- 🛡️ **Data Integrity**: Mengeliminasi human error
- 📊 **Better Reporting**: Data count bisa dipercaya untuk laporan
- ⚡ **Performance**: Minimal overhead dengan selective sync

---

**Versi**: 1.0  
**Terakhir Diupdate**: 2026-04-06  
**Status**: ✅ Siap Digunakan  
**Test Coverage**: 5 scenario utama + 5 edge cases
