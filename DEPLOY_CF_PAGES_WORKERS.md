# Deploy Aplikasi ke Cloudflare Pages dan Workers

## Gambaran Umum

Dokumen ini menjelaskan dua pendekatan untuk mendeploy aplikasi Sistem Informasi Akademik ke infrastruktur Cloudflare:

1. Menggunakan Cloudflare Workers untuk backend
2. Menggunakan Cloudflare Pages untuk frontend statis

## Pendekatan 1: Backend di Cloudflare Workers

### Persiapan

1. Install Wrangler CLI:
   ```bash
   npm install -g wrangler
   ```

2. Login ke akun Cloudflare:
   ```bash
   wrangler login
   ```

3. Inisialisasi proyek:
   ```bash
   wrangler init
   ```

### Konfigurasi Database D1

1. Buat database D1:
   ```bash
   wrangler d1 create sistem-akademik-db
   ```

2. Update [wrangler.toml](file:///d%3A/SISTEMINFORMASIoke/wrangler.toml) dengan ID database:
   ```toml
   [[d1_databases]]
   binding = "DB"
   database_name = "sistem-akademik-db"
   database_id = "your-database-id-from-create-command"
   ```

3. Deploy skema awal:
   ```bash
   wrangler d1 execute sistem-akademik-db --file=./migrations/001_initial_schema.sql
   ```

### Deploy ke Workers

1. Pastikan konfigurasi benar di [wrangler.toml](file:///d%3A/SISTEMINFORMASIoke/wrangler.toml)

2. Deploy ke production:
   ```bash
   wrangler deploy
   ```

3. Deploy ke preview (opsional):
   ```bash
   wrangler deploy --dry-run
   ```

## Pendekatan 2: Frontend di Cloudflare Pages

### Persiapan Build Statis

Karena Cloudflare Pages hanya mendukung file statis, kita perlu menghasilkan versi statis dari aplikasi. Ini bisa dilakukan dengan:

1. Membangun sistem build untuk menghasilkan halaman HTML statis
2. Menggunakan sistem headless CMS atau API eksternal untuk data
3. Menggunakan JavaScript untuk menghubungkan ke API

### Konfigurasi Pages

1. Login ke dashboard Cloudflare
2. Pilih "Pages" dari menu
3. Klik "Create a project"
4. Pilih repositori GitHub Anda ([https://github.com/cepoyanoh/sisteminformasisma.git](https://github.com/cepoyanoh/sisteminformasisma.git))
5. Konfigurasi build:
   - Framework preset: None
   - Build command: `npm run build:static` (anda perlu membuat script ini)
   - Build output directory: `dist` atau direktori output Anda
   - Root directory: `./`

### Script Build Statis

Tambahkan ke [package.json](file:///d%3A/SISTEMINFORMASIoke/package.json):

```json
{
  "scripts": {
    "build:static": "node scripts/build-static.js",
    "preview:pages": "npx wrangler pages dev dist"
  }
}
```

Contoh `scripts/build-static.js`:

```javascript
const fs = require('fs').promises;
const path = require('path');
const puppeteer = require('puppeteer'); // Perlu install: npm install puppeteer

(async () => {
  // Buat direktori dist jika belum ada
  await fs.mkdir('dist', { recursive: true });

  // Salin file publik
  const publicDir = './public';
  const distPublicDir = './dist/public';
  await fs.cp(publicDir, distPublicDir, { recursive: true }).catch(console.error);

  // Jika Anda memiliki backend untuk diakses:
  console.log('Harap pastikan backend Anda berjalan di server terpisah');
  console.log('Script ini hanya contoh konsep, bukan implementasi lengkap');

  // Contoh dengan Puppeteer untuk menghasilkan halaman statis
  // dari aplikasi SSR Anda (memerlukan server berjalan)
  /*
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  // Asumsikan Anda memiliki server berjalan di localhost:3000
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
  const html = await page.content();
  
  await fs.writeFile('dist/index.html', html);
  await browser.close();
  */
})();
```

## Arsitektur Hybrid: Pages + Workers

### Konfigurasi

1. Gunakan Cloudflare Pages untuk file statis (HTML, CSS, JS)
2. Gunakan Cloudflare Workers untuk API backend
3. Hubungkan keduanya melalui panggilan API

### Contoh Struktur

```
frontend (Pages)
├── index.html
├── assets/
│   ├── css/
│   ├── js/
│   └── images/
└── _routes.json

backend (Workers)
├── wrangler.toml
├── src/
│   └── index.js
├── migrations/
└── package.json
```

File `/_routes.json` di Pages untuk menentukan rute yang dihandle oleh Workers:

```json
{
  "version": 1,
  "include": ["/api/*"],
  "exclude": []
}
```

Ini akan mengarahkan semua permintaan `/api/*` ke Workers Anda.

## Konfigurasi Environment Variables

### Di Workers

Tambahkan ke [wrangler.toml](file:///d%3A/SISTEMINFORMASIoke/wrangler.toml):

```toml
[vars]
NODE_ENV = "production"
SESSION_SECRET = "your-session-secret"
```

Atau set lewat CLI:
```bash
wrangler secret put SESSION_SECRET
```

### Di Pages

Di dashboard Cloudflare Pages:
1. Pilih proyek Anda
2. Ke bagian "Settings" > "Environment Variables"
3. Tambahkan variabel yang diperlukan

## Domain dan SSL

### Domain Custom

1. Di dashboard Cloudflare, ke bagian "Workers & Pages"
2. Pilih proyek Anda
3. Di tab "Custom domains", tambahkan domain Anda
4. Ikuti instruksi untuk mengkonfigurasi DNS

### SSL

SSL otomatis disediakan oleh Cloudflare untuk domain yang terdaftar di akun Cloudflare Anda.

## Monitoring dan Logging

### Di Workers

Gunakan Wrangler untuk melihat log:

```bash
wrangler tail
```

### Di Pages

Monitoring tersedia di dashboard Cloudflare Pages.

## Troubleshooting Umum

### API Tidak Bisa Diakses

Pastikan konfigurasi `_routes.json` benar dan domain Anda diizinkan untuk akses API.

### Masalah CORS

Pastikan header CORS dikonfigurasi dengan benar di Workers Anda.

### Build Gagal

Cek konfigurasi build di dashboard Cloudflare Pages:
- Framework Preset
- Build Command
- Build Output Directory
- Root Directory

## Best Practices

1. Pisahkan logika frontend dan backend secara jelas
2. Gunakan API endpoint yang aman dan terotentikasi
3. Implementasikan caching yang tepat
4. Gunakan environment variables untuk konfigurasi
5. Gunakan CI/CD untuk deployment otomatis
6. Backup database secara rutin
7. Monitor penggunaan D1 dan KV untuk biaya

## Kesimpulan

Deploy ke Cloudflare bisa dilakukan dengan berbagai pendekatan tergantung kebutuhan aplikasi Anda. Untuk aplikasi seperti Sistem Informasi Akademik ini, pendekatan hybrid (Pages untuk frontend, Workers untuk backend) mungkin paling sesuai.