# Fitur Tombol "Kembali ke Dashboard" di Setiap Menu

## Deskripsi Fitur

Menambahkan tombol **"Kembali ke Dashboard"** yang konsisten di setiap halaman menu (selain dashboard utama) untuk memudahkan navigasi pengguna kembali ke halaman utama sistem.

## Manfaat

1. **Navigasi Mudah**: Pengguna dapat dengan cepat kembali ke dashboard dari halaman manapun
2. **UX Lebih Baik**: Meningkatkan pengalaman pengguna dengan navigasi yang jelas dan konsisten
3. **Efisiensi Waktu**: Mengurangi jumlah klik untuk kembali ke halaman utama
4. **Konsistensi UI**: Tampilan yang seragam di seluruh aplikasi

## Implementasi Teknis

### 1. Layout Template (views/layout.ejs)

Menambahkan komponen tombol "Kembali ke Dashboard" yang kondisional di dalam layout utama:

```html
<!-- Main Content -->
<main class="main-content px-4 py-4">
    <div class="container-fluid">
        <!-- Back to Dashboard Button - Auto shown on sub-pages -->
        <% if (typeof showBackButton !== 'undefined' && showBackButton) { %>
        <div class="mb-3">
            <a href="/" class="btn btn-outline-primary btn-sm">
                <i class="bi bi-house-door me-2"></i>Kembali ke Dashboard
            </a>
        </div>
        <% } %>
        
        <%- body %>
    </div>
</main>
```

**Cara Kerja:**
- Tombol hanya muncul jika variabel `showBackButton` diset ke `true`
- Menggunakan Bootstrap button styling (`btn btn-outline-primary btn-sm`)
- Icon rumah dari Bootstrap Icons (`bi-house-door`)
- Link mengarah ke root path `/` (dashboard)
- Margin bottom (`mb-3`) untuk jarak dengan konten

### 2. Route Updates

Semua route files telah diupdate untuk menambahkan `showBackButton: true` pada setiap `res.render()` call.

#### Files yang Diupdate:

| File | Routes Updated | Jumlah Render Calls |
|------|----------------|---------------------|
| [`routes/guru.js`](d:\SISTEMINFORMASI\routes\guru.js) | index, tambah, edit | 3 |
| [`routes/siswa.js`](d:\SISTEMINFORMASI\routes\siswa.js) | index, tambah, edit | 3 |
| [`routes/kelas.js`](d:\SISTEMINFORMASI\routes\kelas.js) | index, tambah, edit | 3 |
| [`routes/mapel.js`](d:\SISTEMINFORMASI\routes\mapel.js) | index, tambah, edit | 3 |
| [`routes/jurnal.js`](d:\SISTEMINFORMASI\routes\jurnal.js) | index, tambah, edit | 3 |
| [`routes/nilai.js`](d:\SISTEMINFORMASI\routes\nilai.js) | index, create, edit | 3 |
| [`routes/auth.js`](d:\SISTEMINFORMASI\routes\auth.js) | users, users/tambah | 2 |

**Total: 23 render calls updated**

#### Contoh Implementasi di Route:

**Sebelum:**
```javascript
res.render('guru/index', { 
  title: 'Daftar Guru - SMA Negeri 12 Pontianak',
  guruList: rows 
});
```

**Sesudah:**
```javascript
res.render('guru/index', { 
  title: 'Daftar Guru - SMA Negeri 12 Pontianak',
  guruList: rows,
  showBackButton: true  // ← Tambahan
});
```

### 3. Halaman yang Mendapat Tombol

#### ✅ Dengan Tombol Kembali:
- Semua halaman **index/listing** (daftar data)
- Semua halaman **tambah/create** (form tambah data)
- Semua halaman **edit** (form edit data)
- Halaman **manajemen user** (khusus tata usaha)

#### ❌ Tanpa Tombol Kembali:
- Halaman **Dashboard** (`/`) - karena sudah di dashboard
- Halaman **Login** (`/login`) - sebelum autentikasi
- Halaman **Error** (404, 500) - halaman error khusus

## Styling & Design

### Button Style:
```css
.btn-outline-primary.btn-sm
```

**Karakteristik:**
- **Outline style**: Border berwarna primary, background transparan
- **Small size**: Ukuran kecil agar tidak terlalu dominan
- **Icon + Text**: Kombinasi icon rumah dan teks untuk clarity
- **Hover effect**: Bootstrap otomatis memberikan efek hover

### Positioning:
- **Location**: Di atas konten utama, sebelum heading/page title
- **Spacing**: Margin bottom 3 (1rem) untuk jarak dengan konten
- **Alignment**: Kiri (default flow)

## User Flow

### Contoh Penggunaan:

1. **Dari Daftar Guru:**
   ```
   User klik menu "Data Guru" 
   → Lihat daftar guru
   → Ada tombol "Kembali ke Dashboard" di kiri atas
   → Klik tombol
   → Kembali ke Dashboard
   ```

2. **Dari Form Tambah Siswa:**
   ```
   User klik "Tambah Siswa Baru"
   → Isi form
   → Ingin batal dan kembali
   → Klik "Kembali ke Dashboard"
   → Kembali ke Dashboard
   ```

3. **Dari Edit Nilai:**
   ```
   User sedang edit nilai
   → Selesai edit atau ingin batal
   → Klik "Kembali ke Dashboard"
   → Kembali ke Dashboard
   ```

## Testing

Untuk menguji fitur ini:

1. **Start server:**
   ```bash
   npm run dev
   ```

2. **Test setiap menu:**
   - Login ke sistem
   - Akses setiap menu dari dashboard
   - Verifikasi tombol "Kembali ke Dashboard" muncul di:
     - Halaman daftar (index)
     - Halaman tambah (create/tambah)
     - Halaman edit
   
3. **Test fungsi tombol:**
   - Klik tombol "Kembali ke Dashboard"
   - Pastikan redirect ke `/` (dashboard)
   - Verifikasi dashboard tampil dengan benar

4. **Test konsistensi:**
   - Cek posisi tombol sama di semua halaman
   - Cek styling konsisten
   - Cek icon dan teks tampil dengan benar

## Troubleshooting

### Tombol tidak muncul:
1. **Cek route file**: Pastikan `showBackButton: true` ada di `res.render()`
   ```javascript
   res.render('page/view', {
     // ... other data
     showBackButton: true  // ← Harus ada
   });
   ```

2. **Cek layout file**: Pastikan kondisi `<% if %>` ada di layout.ejs
   ```html
   <% if (typeof showBackButton !== 'undefined' && showBackButton) { %>
   ```

3. **Clear cache**: Restart server dan clear browser cache

### Tombol muncul di dashboard:
- Ini seharusnya tidak terjadi karena dashboard tidak set `showBackButton`
- Cek file `app.js` route untuk `/`, pastikan tidak ada `showBackButton: true`

### Styling tidak sesuai:
1. **Cek Bootstrap loaded**: Pastikan Bootstrap CSS ter-load
   ```html
   <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
   ```

2. **Cek class names**: Pastikan menggunakan class Bootstrap yang benar
   - `btn` - Base button class
   - `btn-outline-primary` - Outline primary style
   - `btn-sm` - Small size
   - `mb-3` - Margin bottom

### Icon tidak muncul:
1. **Cek Bootstrap Icons loaded**:
   ```html
   <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.5/font/bootstrap-icons.css">
   ```

2. **Cek class icon**: Pastikan `bi-house-door` ditulis dengan benar

## Customization

### Mengubah Warna Tombol:

Ganti class `btn-outline-primary` dengan:
- `btn-outline-secondary` - Abu-abu
- `btn-outline-success` - Hijau
- `btn-outline-danger` - Merah
- `btn-outline-warning` - Kuning
- `btn-outline-info` - Biru muda

### Mengubah Ukuran:

Ganti class `btn-sm` dengan:
- Hapus `btn-sm` - Ukuran default
- `btn-lg` - Ukuran besar

### Mengubah Posisi:

Untuk rata kanan, tambahkan wrapper div:
```html
<div class="mb-3 text-end">
    <a href="/" class="btn btn-outline-primary btn-sm">
        <i class="bi bi-house-door me-2"></i>Kembali ke Dashboard
    </a>
</div>
```

### Mengubah Icon:

Ganti `bi-house-door` dengan icon lain dari [Bootstrap Icons](https://icons.getbootstrap.com/):
- `bi-arrow-left` - Panah kiri
- `bi-chevron-left` - Chevron kiri
- `bi-reply` - Reply arrow
- `bi-x-circle` - X circle

## Best Practices

✅ **DO:**
- Selalu tambahkan `showBackButton: true` di setiap route baru
- Gunakan ukuran `btn-sm` agar tidak terlalu dominan
- Letakkan di atas konten sebelum heading
- Gunakan icon untuk visual cue yang jelas

❌ **DON'T:**
- Jangan tambahkan tombol di dashboard itu sendiri
- Jangan gunakan ukuran terlalu besar (`btn-lg`)
- Jangan letakkan di posisi yang membingungkan
- Jangan lupa load Bootstrap Icons CSS

## Maintenance

### Menambah Menu Baru:

Ketika membuat route/menu baru, jangan lupa:

1. **Tambahkan showBackButton di route:**
   ```javascript
   router.get('/menu-baru', (req, res) => {
     res.render('menu-baru/index', {
       title: 'Menu Baru',
       data: someData,
       showBackButton: true  // ← Jangan lupa!
     });
   });
   ```

2. **Test tombol muncul dan berfungsi**

3. **Update dokumentasi ini jika perlu**

### Mengupdate Styling:

Jika ingin mengubah tampilan tombol:
1. Edit di [`views/layout.ejs`](d:\SISTEMINFORMASI\views\layout.ejs)
2. Test di beberapa halaman untuk konsistensi
3. Update dokumentasi jika perubahan signifikan

## Catatan Penting

⚠️ **Konsistensi adalah Kunci**: Pastikan SEMUA route yang bukan dashboard memiliki `showBackButton: true`

🔄 **Layout-Centric Approach**: Tombol didefinisikan sekali di layout, digunakan di banyak halaman - DRY principle

🎯 **User Experience**: Tombol kecil tapi mudah ditemukan, tidak mengganggu konten utama

📱 **Responsive**: Bootstrap button otomatis responsive di semua device

---

**Versi**: 1.0  
**Terakhir Diupdate**: 2026-04-06  
**Status**: ✅ Siap Digunakan  
**Total Halaman**: 23 halaman dengan tombol kembali
