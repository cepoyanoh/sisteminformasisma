// Server untuk Cloudflare Workers - Sistem Informasi Akademik

// Catatan: Ini adalah contoh struktur dasar karena implementasi lengkap
// memerlukan perubahan signifikan terhadap seluruh aplikasi

export default {
  /**
   * Fungsi utama untuk menangani permintaan
   */
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
      // Parsing URL
      const url = new URL(request.url);
      const path = url.pathname;
      const method = request.method;

      // Rute dasar
      if (path === '/' && method === 'GET') {
        return this.handleHome(env);
      } else if (path.startsWith('/api/')) {
        return this.handleApiRequest(path, method, request, env);
      } else {
        return new Response('Not Found', { status: 404 });
      }
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  },

  /**
   * Handler untuk halaman utama
   */
  async handleHome(env) {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Sistem Informasi Akademik - SMA Negeri 12 Pontianak</title>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
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
              <p>Versi Cloudflare Workers - Implementasi Dasar</p>
            </div>
            
            <div class="dashboard-stats">
              <div class="stat-card">
                <h3 id="totalSiswa">0</h3>
                <p>Siswa</p>
              </div>
              <div class="stat-card">
                <h3 id="totalGuru">0</h3>
                <p>Guru</p>
              </div>
              <div class="stat-card">
                <h3 id="totalKelas">0</h3>
                <p>Kelas</p>
              </div>
              <div class="stat-card">
                <h3 id="totalMapel">0</h3>
                <p>Mata Pelajaran</p>
              </div>
            </div>
          </main>
          
          <footer>
            <div class="container">
              <p>&copy; 2024 SMA Negeri 12 Pontianak - Sistem Informasi Akademik</p>
            </div>
          </footer>
          
          <script>
            // Load stats
            window.onload = async function() {
              try {
                const statsResponse = await fetch('/api/stats');
                if(statsResponse.ok) {
                  const stats = await statsResponse.json();
                  document.getElementById('totalSiswa').textContent = stats.totalSiswa || 0;
                  document.getElementById('totalGuru').textContent = stats.totalGuru || 0;
                  document.getElementById('totalKelas').textContent = stats.totalKelas || 0;
                  document.getElementById('totalMapel').textContent = stats.totalMapel || 0;
                }
              } catch (error) {
                console.error('Error loading stats:', error);
              }
            };
          </script>
        </body>
      </html>
    `;
    
    return new Response(html, {
      headers: {
        'Content-Type': 'text/html',
      },
    });
  },

  /**
   * Handler untuk permintaan API
   */
  async handleApiRequest(path, method, request, env) {
    // Contoh endpoint untuk statistik
    if (path === '/api/stats' && method === 'GET') {
      // Dalam implementasi nyata, ini akan mengambil data dari D1
      const stats = {
        totalSiswa: 0,
        totalGuru: 0,
        totalKelas: 0,
        totalMapel: 0
      };
      
      return new Response(JSON.stringify(stats), {
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }
    
    // Contoh endpoint untuk data siswa
    if (path.startsWith('/api/siswa') && method === 'GET') {
      // Dalam implementasi nyata, ini akan mengambil data dari D1
      const siswaData = [];
      
      return new Response(JSON.stringify(siswaData), {
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }
    
    return new Response(JSON.stringify({ error: 'Endpoint not implemented' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

/**
 * Konstanta dan fungsi bantuan
 */
const TABLES = {
  USERS: 'users',
  GURU: 'guru',
  SISWA: 'siswa',
  KELAS: 'kelas',
  MATA_PELAJARAN: 'mata_pelajaran',
  NILAI: 'nilai',
  ABSENSI: 'absensi',
  JURNAL_GURU: 'jurnal_guru'
};