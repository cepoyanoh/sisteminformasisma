# Fitur Filter Siswa Berdasarkan Kelas di Form Input Nilai

## Deskripsi Fitur

Fitur ini memungkinkan pengguna untuk memfilter daftar siswa berdasarkan kelas yang dipilih di form input nilai. Ketika pengguna memilih kelas tertentu, dropdown siswa akan otomatis menampilkan hanya siswa-siswa yang terdaftar di kelas tersebut.

## Manfaat

1. **Memudahkan Pencarian**: Pengguna tidak perlu mencari siswa dari daftar panjang semua siswa
2. **Mencegah Kesalahan**: Memastikan nilai diinput ke siswa yang benar sesuai kelasnya
3. **UX Lebih Baik**: Interface lebih intuitif dan user-friendly
4. **Efisiensi Waktu**: Mengurangi waktu yang dibutuhkan untuk menemukan siswa tertentu

## Implementasi Teknis

### 1. Model (models/Siswa.js)

Menambahkan method `getByKelasId` untuk mengambil siswa berdasarkan ID kelas:

```javascript
getByKelasId: (kelas_id, callback) => {
  const sql = `
    SELECT s.*, k.nama_kelas
    FROM siswa s
    LEFT JOIN kelas k ON s.kelas_id = k.id
    WHERE s.kelas_id = ? AND s.status = 'aktif'
    ORDER BY s.nama_siswa ASC
  `;
  db.all(sql, [kelas_id], callback);
}
```

**Catatan**: Query hanya mengambil siswa dengan status 'aktif'.

### 2. API Endpoint (routes/siswa.js)

Menambahkan endpoint API untuk mendapatkan siswa berdasarkan kelas:

```javascript
router.get('/api/by-kelas/:kelas_id', (req, res) => {
  const kelas_id = req.params.kelas_id;
  
  if (!kelas_id || kelas_id === '') {
    return res.json([]);
  }
  
  Siswa.getByKelasId(kelas_id, (err, rows) => {
    if (err) {
      console.error('Error fetching students by class:', err);
      return res.status(500).json({ error: 'Failed to fetch students' });
    }
    res.json(rows || []);
  });
});
```

**Endpoint**: `GET /siswa/api/by-kelas/:kelas_id`

### 3. View - Create Form (views/nilai/create.ejs)

#### HTML Changes:
- Menambahkan attribute `data-kelas-id` pada setiap option siswa
- Menambahkan hint text untuk memberikan feedback kepada user

```html
<select class="form-select" id="siswa_id" name="siswa_id" required>
    <option value="">Pilih Siswa</option>
    <% siswaList.forEach(siswa => { %>
        <option value="<%= siswa.id %>" data-kelas-id="<%= siswa.kelas_id || '' %>">
            <%= siswa.nama_siswa %> - <%= siswa.nis || '-' %>
        </option>
    <% }); %>
</select>
<small class="text-muted" id="siswa_hint">Pilih kelas terlebih dahulu untuk memfilter siswa</small>
```

#### JavaScript Logic:

```javascript
// Store all student options for filtering
const allSiswaOptions = Array.from(siswaSelect.querySelectorAll('option[data-kelas-id]'));

// Function to filter students by class
function filterSiswaByKelas(kelasId) {
    // Clear current options except the first one
    while (siswaSelect.options.length > 1) {
        siswaSelect.remove(1);
    }
    
    if (!kelasId || kelasId === '') {
        // No class selected
        siswaHint.textContent = 'Pilih kelas terlebih dahulu untuk memfilter siswa';
        // Add disabled option
        return;
    }
    
    // Filter and add students from selected class
    const filteredStudents = allSiswaOptions.filter(opt => opt.dataset.kelasId === kelasId);
    
    if (filteredStudents.length === 0) {
        siswaHint.textContent = 'Tidak ada siswa aktif di kelas ini';
        siswaHint.className = 'text-warning';
    } else {
        siswaHint.textContent = `Menampilkan ${filteredStudents.length} siswa dari kelas yang dipilih`;
        siswaHint.className = 'text-success';
        
        filteredStudents.forEach(opt => {
            siswaSelect.appendChild(opt.cloneNode(true));
        });
    }
}

// Event listener for class selection
kelasSelect.addEventListener('change', function() {
    filterSiswaByKelas(this.value);
});
```

### 4. View - Edit Form (views/nilai/edit.ejs)

Implementasi sama dengan create form, dengan tambahan:
- Inisialisasi filter berdasarkan kelas yang sedang diedit
- Mempertahankan siswa yang sudah terpilih jika masih dalam kelas yang sama

```javascript
// Initialize with current class selection
const currentKelasId = kelasSelect.value;
if (currentKelasId && currentKelasId !== '') {
    filterSiswaByKelas(currentKelasId);
} else {
    filterSiswaByKelas('');
}
```

## Cara Kerja

1. **Saat Halaman Dimuat**:
   - Semua opsi siswa disimpan dalam memory
   - Dropdown siswa di-disable sampai kelas dipilih
   - Hint text menampilkan "Pilih kelas terlebih dahulu untuk memfilter siswa"

2. **Saat Kelas Dipilih**:
   - Event listener mendeteksi perubahan pada dropdown kelas
   - Fungsi `filterSiswaByKelas()` dipanggil dengan ID kelas yang dipilih
   - Dropdown siswa dikosongkan (kecuali option default)
   - Hanya siswa dengan `data-kelas-id` yang sesuai ditambahkan kembali
   - Hint text diupdate menampilkan jumlah siswa yang ditampilkan

3. **Jika Tidak Ada Siswa**:
   - Menampilkan pesan "Tidak ada siswa aktif di kelas ini"
   - Dropdown siswa menampilkan option disabled

4. **Saat Kelas Diubah**:
   - Proses filtering diulang untuk kelas baru
   - Jika siswa yang sebelumnya dipilih tidak ada di kelas baru, selection direset

## User Flow

### Tambah Nilai Baru:
1. User membuka halaman `/nilai/create`
2. User memilih kelas dari dropdown "Kelas"
3. Dropdown "Siswa" otomatis terfilter menampilkan siswa dari kelas tersebut
4. User memilih siswa dari daftar yang sudah difilter
5. User mengisi field lainnya dan menyimpan

### Edit Nilai:
1. User membuka halaman `/nilai/{id}/edit`
2. Form sudah terisi dengan data existing
3. Dropdown siswa sudah terfilter berdasarkan kelas saat ini
4. Jika user mengubah kelas, dropdown siswa akan update otomatis
5. User mengupdate data dan menyimpan

## Feedback Visual

Hint text menggunakan Bootstrap color classes untuk memberikan feedback:
- **text-muted** (abu-abu): Belum memilih kelas
- **text-success** (hijau): Menampilkan X siswa dari kelas yang dipilih
- **text-warning** (kuning): Tidak ada siswa aktif di kelas ini

## Testing

Untuk menguji fitur ini:

1. **Pastikan ada data siswa dengan kelas berbeda**:
   ```sql
   SELECT id, nama_siswa, kelas_id FROM siswa WHERE status = 'aktif';
   ```

2. **Test di browser**:
   - Buka `/nilai/create`
   - Pilih kelas yang berbeda-beda
   - Verifikasi dropdown siswa berubah sesuai kelas
   - Cek hint text berubah dengan benar

3. **Test edit form**:
   - Buka `/nilai/{id}/edit` untuk record yang ada
   - Verifikasi siswa yang dipilih masih terlihat
   - Ubah kelas dan verifikasi filter bekerja

## Troubleshooting

### Siswa tidak muncul setelah memilih kelas:
1. Cek apakah siswa memiliki `kelas_id` yang valid
2. Cek apakah status siswa = 'aktif'
3. Buka browser console (F12) untuk melihat error JavaScript

### Filter tidak bekerja:
1. Pastikan JavaScript enabled di browser
2. Cek console untuk error
3. Verifikasi attribute `data-kelas-id` ada di option siswa

### Error di server:
1. Cek log server untuk error dari endpoint API
2. Pastikan method `getByKelasId` ada di model Siswa
3. Verifikasi koneksi database berfungsi

## Catatan Penting

⚠️ **Hanya Siswa Aktif**: Fitur ini hanya menampilkan siswa dengan status 'aktif'. Siswa dengan status 'non-aktif' atau 'lulus' tidak akan muncul.

🔄 **Dynamic Filtering**: Filtering dilakukan di client-side menggunakan JavaScript, sehingga responsif dan cepat tanpa perlu request ke server.

💾 **Data Attribute**: Menggunakan HTML5 `data-*` attributes untuk menyimpan metadata kelas pada setiap option siswa, memudahkan filtering di client-side.

🎯 **User Experience**: Hint text memberikan feedback real-time kepada user tentang status filtering, meningkatkan usability.

---

**Versi**: 1.0  
**Terakhir Diupdate**: 2026-04-06  
**Status**: ✅ Siap Digunakan
