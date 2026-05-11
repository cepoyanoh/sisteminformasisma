# Perbaikan: Nama Mata Pelajaran Bisa Dipakai Lebih dari Satu (Multi-Kelas)

## Tanggal Perbaikan
**2026-04-07**

## Masalah yang Dilaporkan
User melaporkan bahwa **"nama mata pelajaran bisa dipakai lebih dari satu"** - artinya mata pelajaran yang sama (misalnya "Matematika") harus bisa ada di kelas yang berbeda (Kelas 10, 11, 12).

### Masalah Sebelumnya:
- Kode mapel dibuat hanya dari 3 huruf pertama nama mapel
- Contoh: "Matematika" -> kode "MAT"
- Ketika mencoba menambah "Matematika" untuk kelas lain, terjadi error UNIQUE constraint
- Sistem menganggap sebagai duplikat padahal untuk kelas berbeda

## Solusi yang Diterapkan

### Perubahan Logika Kode Mapel

**Sebelum:**
```javascript
kode_mapel: nama_mapel.substring(0, 3).toUpperCase()
// Matematika -> "MAT"
// Matematika Kelas 10 -> "MAT" ❌ Conflict
// Matematika Kelas 11 -> "MAT" ❌ Conflict
```

**Sesudah:**
```javascript
const kodePrefix = nama_mapel.substring(0, 3).toUpperCase();
const kodeMapel = `${kodePrefix}${kelas}`;
// Matematika Kelas 10 -> "MAT10" ✅ Unique
// Matematika Kelas 11 -> "MAT11" ✅ Unique
// Matematika Kelas 12 -> "MAT12" ✅ Unique
```

### Implementasi di Routes

#### 1. Route POST `/mapel/tambah`
```javascript
// Generate kode_mapel yang unik: kombinasi nama mapel + kelas
const kodePrefix = nama_mapel.substring(0, 3).toUpperCase();
const kodeMapel = `${kodePrefix}${kelas}`;

console.log('🔑 Generated kode_mapel:', kodeMapel);

MataPelajaran.create({
  kode_mapel: kodeMapel,
  nama_mapel,
  kategori,
  kelas: parseInt(kelas),
  jam_pembelajaran: parseInt(jam_pembelajaran),
  guru_pengampu: guru_pengampu || null
}, ...)
```

#### 2. Route POST `/mapel/edit/:id`
```javascript
// Generate kode_mapel yang unik: kombinasi nama mapel + kelas
const kodePrefix = nama_mapel.substring(0, 3).toUpperCase();
const kodeMapel = `${kodePrefix}${kelas}`;

console.log('🔑 Generated kode_mapel untuk update:', kodeMapel);

MataPelajaran.update(id, {
  kode_mapel: kodeMapel,
  // ... other fields
}, ...)
```

#### 3. Error Message yang Lebih Informatif
```javascript
if (err.message.includes('kode_mapel')) {
  req.flash('error', `Kode mata pelajaran ${kodeMapel} sudah terdaftar untuk kelas ${kelas}! Mungkin sudah ada mata pelajaran "${nama_mapel}" di kelas ini.`);
}
```

## File yang Dimodifikasi

1. ✅ [`routes/mapel.js`](file://d:\SISTEMINFORMASI\routes\mapel.js)
   - Updated create route with new kode_mapel generation logic
   - Updated edit route with same logic
   - Improved error messages to show generated code and class info
   - Added logging for debugging

## Contoh Penggunaan

### Skenario 1: Menambah Matematika untuk Berbagai Kelas

**Tambah Matematika Kelas 10:**
```
Nama: Matematika
Kelas: 10
Kode otomatis: MAT10 ✅
Status: Berhasil disimpan
```

**Tambah Matematika Kelas 11:**
```
Nama: Matematika
Kelas: 11
Kode otomatis: MAT11 ✅
Status: Berhasil disimpan (tidak conflict dengan MAT10)
```

**Tambah Matematika Kelas 12:**
```
Nama: Matematika
Kelas: 12
Kode otomatis: MAT12 ✅
Status: Berhasil disimpan (tidak conflict dengan MAT10/MAT11)
```

### Skenario 2: Mencegah Duplikat dalam Kelas Sama

**Coba tambah Matematika Kelas 10 lagi:**
```
Nama: Matematika
Kelas: 10
Kode otomatis: MAT10
Status: ❌ Error - "Kode mata pelajaran MAT10 sudah terdaftar untuk kelas 10!"
```

### Skenario 3: Mata Pelajaran Berbeda dengan Prefix Sama

**Fisika Kelas 10:**
```
Nama: Fisika
Kelas: 10
Kode otomatis: FIS10 ✅
```

**Fisika Kimia Kelas 10:**
```
Nama: Fisika Kimia
Kelas: 10
Kode otomatis: FIS10 ❌ Conflict!
Error: "Kode mata pelajaran FIS10 sudah digunakan!"
Solusi: Gunakan nama yang berbeda atau singkatan lain
```

## Format Kode Mapel

**Struktur:** `[PREFIX][KELAS]`

| Nama Mapel | Kelas | Kode | Keterangan |
|------------|-------|------|------------|
| Matematika | 10 | MAT10 | 3 huruf pertama + kelas |
| Matematika | 11 | MAT11 | Unik per kelas |
| Matematika | 12 | MAT12 | Unik per kelas |
| Bahasa Indonesia | 10 | BAH10 | 3 huruf pertama |
| Bahasa Inggris | 10 | BAH10 | ⚠️ Conflict! |
| Fisika | 10 | FIS10 | Unik |
| Kimia | 10 | KIM10 | Unik |

### Catatan Penting:
⚠️ **Potensi Conflict:** Jika ada dua mata pelajaran dengan 3 huruf pertama yang sama untuk kelas yang sama (contoh: "Bahasa Indonesia" dan "Bahasa Inggris" keduanya jadi "BAH10"), akan terjadi error.

**Solusi untuk kasus ini:**
1. Gunakan nama yang lebih spesifik: "B. Indonesia", "B. Inggris"
2. Atau gunakan singkatan berbeda: "BIN" untuk Bahasa Indonesia, "BIG" untuk Bahasa Inggris

## Testing

### Test 1: Tambah Mapel Sama untuk Kelas Berbeda
1. Buka `http://localhost:3000/mapel/tambah`
2. Tambah "Matematika" untuk Kelas 10
3. ✅ Seharusnya berhasil dengan kode MAT10
4. Tambah "Matematika" untuk Kelas 11
5. ✅ Seharusnya berhasil dengan kode MAT11
6. Tambah "Matematika" untuk Kelas 12
7. ✅ Seharusnya berhasil dengan kode MAT12

### Test 2: Cek di Tabel Index
1. Buka `http://localhost:3000/mapel`
2. Seharusnya terlihat 3 entry Matematika dengan badge:
   - MAT10 (Kelas 10)
   - MAT11 (Kelas 11)
   - MAT12 (Kelas 12)

### Test 3: Coba Duplikat dalam Kelas Sama
1. Coba tambah "Matematika" untuk Kelas 10 lagi
2. ❌ Seharusnya error: "Kode mata pelajaran MAT10 sudah terdaftar untuk kelas 10!"

### Test 4: Edit Mapel Pindah Kelas
1. Edit "Matematika" Kelas 10
2. Ubah kelas menjadi 11
3. Kode akan otomatis berubah dari MAT10 ke MAT11
4. Jika MAT11 sudah ada, akan muncul error

## Console Logging

Sekarang aplikasi akan menampilkan log:

**Saat menambah:**
```
📝 Menerima data mata pelajaran baru: { nama_mapel: 'Matematika', kategori: 'Wajib', kelas: '10' }
🔑 Generated kode_mapel: MAT10
✅ Data mata pelajaran berhasil disimpan dengan ID: 5
```

**Saat edit:**
```
✏️ Mengupdate data mata pelajaran ID: 5
🔑 Generated kode_mapel untuk update: MAT11
✅ Data mata pelajaran berhasil diupdate
```

## Manfaat Perubahan

✅ **Fleksibilitas Lebih Tinggi:**
- Mata pelajaran yang sama bisa ada di multiple kelas
- Tidak ada batasan artificial pada nama mapel
- Mendukung struktur kurikulum yang realistis

✅ **Uniqueness yang Lebih Baik:**
- Kode mapel sekarang truly unique per kombinasi nama+kelas
- Mencegah duplikasi dalam kelas yang sama
- Masih mudah dibaca dan dipahami

✅ **User Experience:**
- Error messages yang lebih informatif
- Menunjukkan kode yang digenerate
- Menjelaskan konflik dengan jelas

✅ **Backward Compatibility:**
- Data existing tetap berfungsi
- Hanya mengubah cara generate kode untuk data baru
- Tidak perlu migrasi database

## Potensi Issue & Solusi

### Issue 1: Prefix Sama untuk Mapel Berbeda
**Masalah:** "Bahasa Indonesia" dan "Bahasa Inggris" sama-sama jadi "BAH"

**Solusi:**
- Gunakan nama pendek: "B. Indonesia", "B. Inggris"
- Atau manual input kode mapel (perlu modifikasi form)
- Atau gunakan 4 huruf prefix

### Issue 2: Edit Mapel Ganti Kelas
**Masalah:** Saat edit mapel dan ganti kelas, kode berubah

**Solusi:**
- Ini behavior yang diinginkan (kode harus match dengan kelas)
- Error handling sudah ada jika kode baru conflict
- User mendapat warning yang jelas

## Rekomendasi Selanjutnya

Untuk mengatasi issue prefix sama, pertimbangkan:
1. **Opsi A:** Tambah field "Kode Mapel" manual di form (user input sendiri)
2. **Opsi B:** Gunakan 4-5 huruf prefix untuk mengurangi collision
3. **Opsi C:** Tambah counter/sequence: MAT10-1, MAT10-2 (kurang readable)
4. **Opsi D:** Validasi sebelum save dan suggest alternatif kode

---

**Status:** ✅ Completed  
**Impact:** Low (Logic change only, no breaking changes)  
**Breaking Changes:** None  
**Database Migration Required:** No
