# Konversi Aplikasi Node.js/Express ke Cloudflare Workers

## Gambaran Umum

Aplikasi ini saat ini berjalan di `http://localhost:3000` sebagai aplikasi Node.js/Express tradisional dengan database SQLite. Cloudflare Workers menggunakan lingkungan serverless yang berbeda dan tidak mendukung runtime Node.js secara langsung, sehingga kita perlu melakukan perubahan arsitektural.

## Perbedaan Lingkungan

### Lingkungan Saat Ini (Node.js/Express)
- Runtime Node.js penuh
- Akses filesystem
- Database SQLite (file-based)
- Session disimpan di filesystem/memory
- Server berjalan terus-menerus

### Lingkungan Cloudflare Workers
- Lingkungan serverless
- Tidak ada akses filesystem
- Tidak mendukung SQLite (karena bersifat file-based)
- Harus menggunakan D1 (Cloudflare's SQL database) atau database eksternal
- Stateless - tidak ada session persisten

## Langkah-langkah Konversi

### 1. Ganti Database SQLite ke D1 atau Database Eksternal

#### Sebelum (di [config/dbConfig.js](file:///d%3A/SISTEMINFORMASIoke/config/dbConfig.js)):
```javascript
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.db');
```

#### Sesudah (untuk Cloudflare Workers):
```javascript
// Dalam handler fetch
export default {
  async fetch(request, env, ctx) {
    // Query ke D1
    const { results } = await env.DB.prepare(
      'SELECT * FROM users LIMIT 10'
    ).all();
    
    return new Response(JSON.stringify(results), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
```

### 2. Ubah Sistem Template (EJS ke HTML String)

#### Sebelum (di [app.js](file:///d%3A/SISTEMINFORMASIoke/app.js)):
```javascript
app.set('view engine', 'ejs');
res.render('index', { data: someData });
```

#### Sesudah (untuk Cloudflare Workers):
```javascript
const html = `
<!DOCTYPE html>
<html>
<head><title>Dashboard</title></head>
<body>
  <h1>Dashboard</h1>
  <p>Total Siswa: ${totalSiswa}</p>
</body>
</html>
`;

return new Response(html, {
  headers: { 'Content-Type': 'text/html' }
});
```

### 3. Ganti Sistem Session

#### Sebelum (express-session):
```javascript
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true
}));
```

#### Sesudah (menggunakan Cloudflare KV):
```javascript
// Simpan session
await env.SESSIONS.put(sessionId, JSON.stringify(sessionData), { 
  expirationTtl: 86400 
});

// Ambil session
const sessionData = await env.SESSIONS.get(sessionId);
```

### 4. Modifikasi Semua File Model

Ubah semua model dari operasi SQLite ke D1:

#### Sebelum (di [models/Siswa.js](file:///d%3A/SISTEMINFORMASIoke/models/Siswa.js)):
```javascript
db.all('SELECT * FROM siswa WHERE kelas = ?', [kelas], (err, rows) => {
  callback(err, rows);
});
```

#### Sesudah:
```javascript
const { results } = await env.DB.prepare(
  'SELECT * FROM siswa WHERE kelas = ?'
).bind(kelas).all();
```

## Konfigurasi untuk Cloudflare Workers

### File wrangler.toml
```toml
name = "sistem-informasi-akademik"
main = "src/worker.js"
compatibility_date = "2024-05-11"

# Environment Variables
[vars]
NODE_ENV = "production"

# D1 Database
[[d1_databases]]
binding = "DB"
database_name = "sistem-akademik-db"
database_id = ""

# KV Namespace for sessions
[[kv_namespaces]]
binding = "SESSIONS"
id = "your-session-namespace-id"
```

## Struktur Baru Aplikasi untuk Workers

### File src/worker.js
```javascript
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    // Rute autentikasi
    if (path === '/login' && method === 'POST') {
      return await this.handleLogin(request, env);
    }
    
    // Middleware autentikasi
    const isAuthenticated = await this.checkAuth(request, env);
    if (!isAuthenticated && path.startsWith('/dashboard')) {
      return this.redirectToLogin();
    }
    
    // Rute-rute proteksi
    if (path.startsWith('/dashboard')) {
      return await this.handleDashboard(request, env);
    }
    
    // Rute utama
    return await this.handleHome(env);
  },

  async handleLogin(request, env) {
    const formData = await request.formData();
    const username = formData.get('username');
    const password = formData.get('password');
    
    // Verifikasi login
    const hashedPassword = await this.hashPassword(password);
    const { results } = await env.DB.prepare(
      'SELECT * FROM users WHERE username = ? AND password = ?'
    ).bind(username, hashedPassword).all();
    
    if (results.length > 0) {
      // Buat session
      const sessionId = crypto.randomUUID();
      await env.SESSIONS.put(sessionId, JSON.stringify({
        userId: results[0].id,
        username: results[0].username,
        role: results[0].role
      }), { expirationTtl: 86400 });
      
      // Set cookie session
      const response = this.redirect('/dashboard');
      response.headers.set('Set-Cookie', `sessionId=${sessionId}; Path=/; HttpOnly`);
      return response;
    }
    
    return new Response('Login gagal', { status: 401 });
  },

  redirect(url) {
    return new Response(null, {
      status: 302,
      headers: {
        Location: url
      }
    });
  }
};
```

## Persiapan untuk Deploy

1. Migrasi skema database ke D1
2. Konversi semua model ke sintaks D1
3. Ganti semua rute ke handler Workers
4. Ganti sistem template ke HTML string
5. Ganti sistem session ke Cloudflare KV
6. Test lokal dengan Miniflare

## Testing Lokal

Jalankan dengan Miniflare:
```bash
npx miniflare src/worker.js --modules --d1 --kv --port 8787
```

## Deployment

Deploy ke Cloudflare:
```bash
wrangler deploy
```

## Alternatif: Hybrid Approach

Jika konversi penuh terlalu kompleks, pertimbangkan pendekatan hybrid:
- Host backend di platform lain (Render, Railway)
- Gunakan Cloudflare untuk CDN, caching, dan SSL
- Arahkan domain ke backend hosted di tempat lain
- Gunakan Cloudflare Workers untuk caching dan edge logic sederhana

Dengan pendekatan ini, Anda tetap bisa memanfaatkan keunggulan Cloudflare (kecepatan, keamanan) tanpa harus mengonversi seluruh aplikasi.