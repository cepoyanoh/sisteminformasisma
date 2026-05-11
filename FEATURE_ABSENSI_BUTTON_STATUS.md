# Perbaikan UI Input Absensi - Tombol Status

## Masalah
Input absensi menggunakan dropdown untuk memilih status kehadiran, yang kurang efisien dan tidak user-friendly untuk input cepat.

## Solusi
Mengganti dropdown dengan tombol-tombol yang bisa diklik langsung untuk memilih status kehadiran (Hadir, Sakit, Izin, Alpha).

## Perubahan yang Dilakukan

### File: `views/absensi/input.ejs`

#### 1. **HTML Structure - Tombol Status**
Mengganti `<select>` dropdown dengan tombol-tombol:

```html
<div class="status-buttons" data-siswa-id="<%= siswa.id %>">
    <button type="button" class="btn-status btn-hadir" data-status="hadir" onclick="setStatus(this)">
        <i class="bi bi-check-circle"></i> Hadir
    </button>
    <button type="button" class="btn-status btn-sakit" data-status="sakit" onclick="setStatus(this)">
        <i class="bi bi-thermometer-half"></i> Sakit
    </button>
    <button type="button" class="btn-status btn-izin" data-status="izin" onclick="setStatus(this)">
        <i class="bi bi-envelope"></i> Izin
    </button>
    <button type="button" class="btn-status btn-alpha" data-status="alpha" onclick="setStatus(this)">
        <i class="bi bi-x-circle"></i> Alpha
    </button>
    <input type="hidden" name="status_<%= siswa.id %>" value="hadir" class="status-value">
</div>
```

**Keuntungan:**
- ✅ Satu klik langsung memilih status (tidak perlu buka dropdown)
- ✅ Visual yang lebih jelas dengan warna dan icon
- ✅ Lebih cepat untuk input massal
- ✅ Status aktif terlihat jelas dengan highlight warna

#### 2. **CSS Styling**
Menambahkan styling khusus untuk tombol status:

```css
.status-buttons {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
}

.btn-status {
    padding: 6px 12px;
    border: 2px solid #dee2e6;
    background-color: #fff;
    color: #6c757d;
    border-radius: 8px;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
}

.btn-status:hover {
    transform: translateY(-2px);
    box-shadow: 0 2px 8px rgba(0,0,0,0.15);
}

.btn-status.active {
    color: white;
    border-color: transparent;
    box-shadow: 0 2px 8px rgba(0,0,0,0.2);
}

/* Warna untuk setiap status */
.btn-hadir.active { background-color: #198754; } /* Hijau */
.btn-sakit.active { background-color: #ffc107; color: #000; } /* Kuning */
.btn-izin.active { background-color: #0dcaf0; } /* Biru muda */
.btn-alpha.active { background-color: #dc3545; } /* Merah */
```

**Fitur Visual:**
-  **Hadir**: Hijau (success)
- 🟡 **Sakit**: Kuning (warning)
- 🔵 **Izin**: Biru muda (info)
- 🔴 **Alpha**: Merah (danger)
-  Hover effect dengan shadow dan transform
- ✅ Active state dengan warna solid dan border

#### 3. **JavaScript Logic**
Mengupdate JavaScript untuk menangani tombol:

```javascript
// Set status ketika tombol diklik
function setStatus(button) {
    const container = button.parentElement;
    const siswaId = container.dataset.siswaId;
    const status = button.dataset.status;
    
    // Remove active class from all buttons
    const allButtons = container.querySelectorAll('.btn-status');
    allButtons.forEach(btn => btn.classList.remove('active'));
    
    // Add active class to clicked button
    button.classList.add('active');
    
    // Update hidden input
    const hiddenInput = container.querySelector('.status-value');
    if (hiddenInput) {
        hiddenInput.value = status;
    }
    
    // Update data array
    const item = absensiData.find(d => d.siswa_id === siswaId);
    if (item) {
        item.status_kehadiran = status;
    }
}

// Set semua status
function setAllStatus(status) {
    const allContainers = document.querySelectorAll('.status-buttons');
    allContainers.forEach(container => {
        const buttons = container.querySelectorAll('.btn-status');
        buttons.forEach(btn => {
            if (btn.dataset.status === status) {
                btn.click(); // Trigger click event
            }
        });
    });
}
```

#### 4. **Enhanced Submit Validation**
Menampilkan breakdown status sebelum submit:

```javascript
// Hitung status breakdown
const statusCounts = {
    hadir: absensiData.filter(d => d.status_kehadiran === 'hadir').length,
    sakit: absensiData.filter(d => d.status_kehadiran === 'sakit').length,
    izin: absensiData.filter(d => d.status_kehadiran === 'izin').length,
    alpha: absensiData.filter(d => d.status_kehadiran === 'alpha').length
};

console.log(`✅ Total siswa: ${absensiData.length}`);
console.log(`📊 Status breakdown:`, statusCounts);
```

## Cara Menggunakan

### Input Absensi dengan Tombol

1. **Buka halaman Input Absensi** (`/absensi/input`)
2. **Pilih kelas** (jika belum)
3. **Pilih Mata Pelajaran** dan **Guru Pengajar**
4. **Klik tombol status** untuk setiap siswa:
   - Klik **"Hadir"** (hijau) jika siswa hadir
   - Klik **"Sakit"** (kuning) jika siswa sakit
   - Klik **"Izin"** (biru) jika siswa izin
   - Klik **"Alpha"** (merah) jika siswa tidak hadir tanpa keterangan

5. **Tambahkan keterangan** (opsional) di kolom Keterangan
6. **Klik "Simpan Absensi"** untuk menyimpan

### Fitur "Semua Hadir"
- Klik tombol **"Semua Hadir"** untuk menandai semua siswa hadir sekaligus
- Kemudian ubah status siswa yang tidak hadir secara individual

## Keuntungan UI Baru

### ✅ Kecepatan
- **1 klik** untuk memilih status (vs 2-3 klik dengan dropdown)
- Tidak perlu buka/tutup dropdown
- Lebih cepat untuk input 30+ siswa

### ✅ Visual Clarity
- Warna yang berbeda untuk setiap status
- Icon yang membantu identifikasi cepat
- Status aktif terlihat jelas dengan highlight

### ✅ User Experience
- Tombol lebih mudah diklik (larger click area)
- Tidak perlu scroll untuk melihat opsi
- Responsive untuk mobile (icon disembunyikan di layar kecil)

### ✅ Error Prevention
- Status default sudah terpilih (Hadir)
- Visual feedback jelas saat memilih
- Konfirmasi sebelum submit jika ada Alpha

## Responsive Design

Pada layar mobile (<768px):
- Icon disembunyikan untuk hemat space
- Tombol lebih kecil
- Gap lebih rapat
- Tetap fungsional dan mudah diklik

## Testing Checklist

Setelah menerapkan perubahan:

- [ ] Tombol status muncul dengan benar
- [ ] Klik tombol mengubah status dengan benar
- [ ] Warna berubah sesuai status yang dipilih
- [ ] Hidden input terupdate dengan nilai yang benar
- [ ] Tombol "Semua Hadir" berfungsi
- [ ] Submit form mengirim data dengan benar
- [ ] Console log menampilkan status breakdown
- [ ] Konfirmasi alert muncul jika ada Alpha
- [ ] Responsive di mobile

## Troubleshooting

### Tombol tidak berubah warna saat diklik
- Pastikan CSS sudah terload
- Cek console untuk JavaScript errors
- Verify class "active" ditambahkan dengan benar

### Data tidak tersimpan dengan benar
- Cek console log saat submit
- Verify hidden input value terupdate
- Periksa format JSON di absensiData

### Tombol "Semua Hadir" tidak berfungsi
- Pastikan selector `.status-buttons` benar
- Verify click event di-trigger dengan `btn.click()`
- Cek console log untuk debugging

## Catatan Tambahan

- **Default status**: Hadir (otomatis dipilih saat halaman dimuat)
- **Validasi**: Mapel dan Guru wajib dipilih sebelum submit
- **Konfirmasi**: Alert muncul jika ada siswa dengan status Alpha
- **Normalisasi**: Status "alpa" otomatis dikonversi ke "alpha" di backend
