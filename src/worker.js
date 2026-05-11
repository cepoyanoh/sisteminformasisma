// Contoh awal worker untuk Cloudflare
// Ini adalah implementasi skeleton untuk aplikasi Sistem Informasi Akademik

export default {
  async fetch(request, env, ctx) {
    // Konfigurasi header CORS
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    // Tangani permintaan preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      const url = new URL(request.url);
      const path = url.pathname;
      const method = request.method;

      // Cek apakah ini permintaan API
      if (path.startsWith('/api/')) {
        return await this.handleApiRequest(path, method, request, env);
      }
      
      // Rute utama
      if (path === '/' && method === 'GET') {
        return await this.handleHome(env);
      }
      
      // Rute login
      if (path === '/login' && method === 'GET') {
        return await this.handleLoginPage(env);
      }
      
      // Proses login
      if (path === '/login' && method === 'POST') {
        return await this.handleLogin(request, env);
      }
      
      // Proteksi rute dashboard
      const sessionId = this.getSessionIdFromCookie(request);
      if (path.startsWith('/dashboard') || path.startsWith('/admin')) {
        const sessionData = await this.validateSession(sessionId, env);
        if (!sessionData) {
          return this.handleLoginPage(env);
        }
        
        return await this.handleDashboard(sessionData, env);
      }

      return new Response('Not Found', { status: 404 });
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  },

  // Handler untuk halaman utama
  async handleHome(env) {
    // Ambil statistik dasar (tanpa autentikasi)
    const stats = await this.getBasicStats(env);
    
    const html = `
      <!DOCTYPE html>
      <html lang="id">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Sistem Informasi Akademik - SMA Negeri 12 Pontianak</title>
          <link rel="stylesheet" href="/public/style.css">
        </head>
        <body>
          <header>
            <div class="container">
              <h1>Sistem Informasi Akademik</h1>
              <p>SMA Negeri 12 Pontianak</p>
            </div>
          </header>
          
          <main class="container">
            <div class="card">
              <h2>Selamat Datang</h2>
              <p>Sistem Informasi Akademik SMA Negeri 12 Pontianak</p>
              <p>Implementasi Cloudflare Workers</p>
              
              <div style="margin-top: 20px;">
                <a href="/login" class="btn btn-primary">Masuk ke Sistem</a>
              </div>
            </div>
            
            <div class="dashboard-stats">
              <div class="stat-card">
                <h3>${stats.totalSiswa || 0}</h3>
                <p>Siswa</p>
              </div>
              <div class="stat-card">
                <h3>${stats.totalGuru || 0}</h3>
                <p>Guru</p>
              </div>
              <div class="stat-card">
                <h3>${stats.totalKelas || 0}</h3>
                <p>Kelas</p>
              </div>
              <div class="stat-card">
                <h3>${stats.totalMapel || 0}</h3>
                <p>Mata Pelajaran</p>
              </div>
            </div>
          </main>
          
          <footer>
            <div class="container">
              <p>&copy; 2024 SMA Negeri 12 Pontianak - Sistem Informasi Akademik</p>
            </div>
          </footer>
        </body>
      </html>
    `;
    
    return new Response(html, {
      headers: {
        'Content-Type': 'text/html',
      },
    });
  },

  // Handler untuk halaman login
  async handleLoginPage(env) {
    const html = `
      <!DOCTYPE html>
      <html lang="id">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Login - Sistem Informasi Akademik</title>
          <link rel="stylesheet" href="/public/style.css">
        </head>
        <body>
          <header>
            <div class="container">
              <h1>Login Sistem Informasi Akademik</h1>
            </div>
          </header>
          
          <main class="container">
            <div class="card" style="max-width: 400px; margin: 2rem auto;">
              <h2>Masuk ke Akun</h2>
              <form method="post" action="/login">
                <div class="form-group">
                  <label for="username">Username:</label>
                  <input type="text" id="username" name="username" class="form-control" required>
                </div>
                
                <div class="form-group">
                  <label for="password">Password:</label>
                  <input type="password" id="password" name="password" class="form-control" required>
                </div>
                
                <button type="submit" class="btn btn-primary">Login</button>
              </form>
              
              ${this.getLoginMessage()}
            </div>
          </main>
          
          <footer>
            <div class="container">
              <p>&copy; 2024 SMA Negeri 12 Pontianak - Sistem Informasi Akademik</p>
            </div>
          </footer>
        </body>
      </html>
    `;
    
    return new Response(html, {
      headers: { 'Content-Type': 'text/html' },
    });
  },

  // Handler untuk proses login
  async handleLogin(request, env) {
    const formData = await request.formData();
    const username = formData.get('username');
    const password = formData.get('password');

    // Validasi input
    if (!username || !password) {
      return new Response('Username dan password harus diisi', { status: 400 });
    }

    try {
      // Verifikasi kredensial dari database D1
      const hashedPassword = await this.hashPassword(password);
      const { results } = await env.DB.prepare(
        'SELECT * FROM users WHERE username = ? AND password = ? AND is_active = 1'
      ).bind(username, hashedPassword).all();

      if (results && results.length > 0) {
        // Buat session
        const sessionId = crypto.randomUUID();
        const sessionData = {
          userId: results[0].id,
          username: results[0].username,
          role: results[0].role,
          nama: results[0].nama || results[0].username,
          timestamp: Date.now()
        };

        // Simpan session ke KV
        await env.SESSIONS.put(sessionId, JSON.stringify(sessionData), { 
          expirationTtl: 86400 // 24 jam
        });

        // Redirect ke dashboard dengan session cookie
        const response = new Response(null, {
          status: 302,
          headers: {
            'Location': '/dashboard',
            'Set-Cookie': `sessionId=${sessionId}; Path=/; HttpOnly; Secure; SameSite=Strict`
          }
        });
        return response;
      } else {
        // Login gagal
        const response = new Response('Username atau password salah', { 
          status: 401 
        });
        return response;
      }
    } catch (error) {
      return new Response(`Error dalam proses login: ${error.message}`, { 
        status: 500 
      });
    }
  },

  // Handler untuk dashboard
  async handleDashboard(sessionData, env) {
    // Ambil statistik untuk pengguna yang login
    const stats = await this.getUserStats(sessionData.userId, env);
    
    const html = `
      <!DOCTYPE html>
      <html lang="id">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Dashboard - Sistem Informasi Akademik</title>
          <link rel="stylesheet" href="/public/style.css">
        </head>
        <body>
          <header>
            <div class="container">
              <h1>Dashboard Sistem Informasi Akademik</h1>
              <div style="text-align: right;">
                <p>Halo, ${sessionData.nama} (${sessionData.role})</p>
                <a href="/logout" class="btn btn-warning">Logout</a>
              </div>
            </div>
          </header>
          
          <main class="container">
            <div class="dashboard-stats">
              <div class="stat-card">
                <h3>${stats.totalSiswa || 0}</h3>
                <p>Siswa</p>
              </div>
              <div class="stat-card">
                <h3>${stats.totalGuru || 0}</h3>
                <p>Guru</p>
              </div>
              <div class="stat-card">
                <h3>${stats.totalKelas || 0}</h3>
                <p>Kelas</p>
              </div>
              <div class="stat-card">
                <h3>${stats.totalMapel || 0}</h3>
                <p>Mata Pelajaran</p>
              </div>
            </div>
            
            <div class="card">
              <h2>Menu Utama</h2>
              <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 1rem;">
                ${this.getMainMenuByRole(sessionData.role)}
              </div>
            </div>
          </main>
          
          <footer>
            <div class="container">
              <p>&copy; 2024 SMA Negeri 12 Pontianak - Sistem Informasi Akademik</p>
            </div>
          </footer>
        </body>
      </html>
    `;
    
    return new Response(html, {
      headers: { 'Content-Type': 'text/html' },
    });
  },

  // Handler untuk permintaan API
  async handleApiRequest(path, method, request, env) {
    // Contoh endpoint untuk statistik
    if (path === '/api/stats' && method === 'GET') {
      const stats = await this.getBasicStats(env);
      return new Response(JSON.stringify(stats), {
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    // Contoh endpoint untuk data siswa
    if (path === '/api/siswa' && method === 'GET') {
      const { results } = await env.DB.prepare(
        'SELECT * FROM siswa LIMIT 10'
      ).all();
      
      return new Response(JSON.stringify(results), {
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    return new Response(JSON.stringify({ error: 'Endpoint tidak ditemukan' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
  },

  // Fungsi bantu untuk mendapatkan ID session dari cookie
  getSessionIdFromCookie(request) {
    const cookieHeader = request.headers.get('Cookie');
    if (!cookieHeader) return null;
    
    const cookies = cookieHeader.split('; ');
    for (const cookie of cookies) {
      if (cookie.startsWith('sessionId=')) {
        return cookie.substring('sessionId='.length);
      }
    }
    return null;
  },

  // Fungsi bantu untuk validasi session
  async validateSession(sessionId, env) {
    if (!sessionId) return null;
    
    try {
      const sessionData = await env.SESSIONS.get(sessionId);
      if (!sessionData) return null;
      
      return JSON.parse(sessionData);
    } catch (error) {
      console.error('Error validating session:', error);
      return null;
    }
  },

  // Fungsi bantu untuk hash password
  async hashPassword(password) {
    // Dalam implementasi sebenarnya, gunakan bcrypt atau algoritma hashing yang aman
    // Untuk contoh ini, kita gunakan encoding sederhana
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  },

  // Fungsi bantu untuk mendapatkan statistik dasar
  async getBasicStats(env) {
    try {
      const [
        { results: siswaResults },
        { results: guruResults },
        { results: kelasResults },
        { results: mapelResults }
      ] = await Promise.all([
        env.DB.prepare('SELECT COUNT(*) as count FROM siswa').all(),
        env.DB.prepare('SELECT COUNT(*) as count FROM guru').all(),
        env.DB.prepare('SELECT COUNT(*) as count FROM kelas').all(),
        env.DB.prepare('SELECT COUNT(*) as count FROM mata_pelajaran').all()
      ]);

      return {
        totalSiswa: siswaResults[0]?.count || 0,
        totalGuru: guruResults[0]?.count || 0,
        totalKelas: kelasResults[0]?.count || 0,
        totalMapel: mapelResults[0]?.count || 0
      };
    } catch (error) {
      console.error('Error getting basic stats:', error);
      return { totalSiswa: 0, totalGuru: 0, totalKelas: 0, totalMapel: 0 };
    }
  },

  // Fungsi bantu untuk mendapatkan statistik pengguna
  async getUserStats(userId, env) {
    // Dalam implementasi sebenarnya, ini akan memfilter berdasarkan akses pengguna
    return await this.getBasicStats(env);
  },

  // Fungsi bantu untuk menu utama berdasarkan peran
  getMainMenuByRole(role) {
    const menuItems = [];

    // Semua peran bisa mengakses nilai
    menuItems.push('<a href="/nilai" class="btn">Nilai Siswa</a>');

    // Admin dan super_admin bisa mengakses semua fitur
    if (['admin', 'super_admin'].includes(role)) {
      menuItems.push('<a href="/siswa" class="btn">Data Siswa</a>');
      menuItems.push('<a href="/guru" class="btn">Data Guru</a>');
      menuItems.push('<a href="/kelas" class="btn">Data Kelas</a>');
      menuItems.push('<a href="/mapel" class="btn">Mata Pelajaran</a>');
      menuItems.push('<a href="/absensi" class="btn">Absensi</a>');
    }

    // Guru bisa mengakses jurnal dan nilai
    if (['guru', 'admin', 'super_admin'].includes(role)) {
      menuItems.push('<a href="/jurnal" class="btn">Jurnal Guru</a>');
    }

    return menuItems.join('');
  },

  // Fungsi bantu untuk pesan login
  getLoginMessage() {
    // Dalam implementasi sebenarnya, ini akan menampilkan pesan flash dari session
    return '<!-- Pesan login akan ditampilkan di sini -->';
  }
};