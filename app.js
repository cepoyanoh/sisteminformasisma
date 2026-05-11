const express = require('express');
const bodyParser = require('body-parser');
const engine = require('ejs-mate');
const path = require('path');
const session = require('express-session');
const flash = require('connect-flash');
const multer = require('multer');
const methodOverride = require('method-override');
require('dotenv').config();

// Import models
const Kelas = require('./models/Kelas');
const MataPelajaran = require('./models/MataPelajaran');
const Guru = require('./models/Guru');
const JurnalGuru = require('./models/JurnalGuru');
const Siswa = require('./models/Siswa');
const Nilai = require('./models/Nilai');
const Absensi = require('./models/Absensi');

const app = express();
const PORT = process.env.PORT || 3000;

// Konfigurasi ejs-mate dengan lokasi layout yang benar
app.engine('ejs', engine);

// Atur lokasi views
const viewsPath = path.join(__dirname, 'views');
app.set('views', viewsPath);
app.set('view engine', 'ejs');

// Minimal session configuration (required for flash messages)
app.use(session({
  secret: process.env.SESSION_SECRET || 'sistemInformasiKurikulum2026',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 }
}));

// Flash messages
app.use(flash());

// Konfigurasi multer untuk file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, 'uploads');
    // Buat folder uploads jika belum ada
    if (!require('fs').existsSync(uploadDir)) {
      require('fs').mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'siswa-import-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    // Hanya terima file Excel
    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel'
    ];
    const allowedExtensions = ['.xlsx', '.xls'];
    const ext = path.extname(file.originalname).toLowerCase();
    
    if (allowedExtensions.includes(ext) || allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Hanya file Excel (.xlsx, .xls) yang diperbolehkan'));
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // Max 5MB
  }
});

// Buat multer instance tersedia untuk routes
app.locals.upload = upload;

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Method override untuk mendukung PUT dan DELETE dari form HTML
app.use(methodOverride('_method'));

// Import routes
const mapelRoutes = require('./routes/mapel');
const kelasRoutes = require('./routes/kelas');
const guruRoutes = require('./routes/guru');
const jurnalRoutes = require('./routes/jurnal');
const siswaRoutes = require('./routes/siswa');
const nilaiRoutes = require('./routes/nilai');
const absensiRoutes = require('./routes/absensi');
const { router: authRoutes, requireAuth, requireRole } = require('./routes/auth');

// Middleware untuk logging request (tambahkan sebelum middleware lainnya)
app.use((req, res, next) => {
  const start = Date.now();
  
  console.log(`\n➡️  ${req.method} ${req.path} | ${new Date().toLocaleTimeString('id-ID')}`);
  
  // Monitor response
  res.on('finish', () => {
    const duration = Date.now() - start;
    const status = res.statusCode;
    console.log(`⬅️  ${req.method} ${req.path} | ${status} | ${duration}ms`);
    
    if (status >= 400) {
      console.log(`⚠️  Error response detected`);
    }
  });
  
  next();
});

// Flash messages middleware & set user locals
app.use((req, res, next) => {
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  res.locals.warning = req.flash('warning');
  res.locals.errors = req.flash('errors');
  
  // Set user from session
  res.locals.user = req.session.user || {
    id: null,
    username: 'Guest',
    role: 'guest',
    nama: 'Guest'
  };
  
  next();
});

// Middleware untuk memuat statistik dashboard
app.use((req, res, next) => {
  console.log('📊 Stats middleware: Loading dashboard statistics...');
  
  // Ambil data statistik secara async
  let completed = 0;
  let hasError = false;
  const stats = {
    totalKelas: 0,
    totalMapel: 0,
    totalGuru: 0,
    totalJurnal: 0,
    totalSiswa: 0,
    totalNilai: 0,
  };
  
  const totalQueries = 6;
  
  const checkComplete = () => {
    completed++;
    console.log(`   Stats query ${completed}/${totalQueries} completed`);
    
    if (completed === totalQueries) {
      clearTimeout(timeout);
      if (!hasError) {
        res.locals.stats = stats;
        console.log('✅ Stats loaded successfully:', stats);
      } else {
        console.log('⚠️  Some stats queries failed, using defaults');
        res.locals.stats = stats;
      }
      console.log('📊 Stats middleware: Calling next()');
      next();
    }
  };
  
  // Handle errors gracefully
  const handleError = (queryName, err) => {
    if (err) {
      console.error(`❌ Stats query failed (${queryName}):`, err.message);
      hasError = true;
    }
    checkComplete();
  };
  
  // Set timeout to prevent hanging - REDUCED to 3 seconds
  const timeout = setTimeout(() => {
    if (completed < totalQueries) {
      console.error('⏰ Stats middleware timeout! Force calling next()');
      console.log(`   Completed: ${completed}/${totalQueries}`);
      res.locals.stats = stats;
      next();
    }
  }, 3000); // 3 second timeout (reduced from 5)
  
  Kelas.getAll((err, list) => {
    if (!err) stats.totalKelas = list.length;
    handleError('Kelas', err);
  });
  
  MataPelajaran.getAll((err, list) => {
    if (!err) stats.totalMapel = list.length;
    handleError('MataPelajaran', err);
  });
  
  Guru.getAll((err, list) => {
    if (!err) stats.totalGuru = list.length;
    handleError('Guru', err);
  });
  
  JurnalGuru.getAll((err, list) => {
    if (!err) stats.totalJurnal = list.length;
    handleError('JurnalGuru', err);
  });
  
  Siswa.getAll('nama', (err, list) => {
    if (!err) stats.totalSiswa = list.length;
    handleError('Siswa', err);
  });
  
  Nilai.getAll({}, (err, list) => {
    if (!err) stats.totalNilai = list.length;
    handleError('Nilai', err);
  });

});

// Use auth routes FIRST (before other routes)
app.use('/', authRoutes);

// Apply authentication middleware to protected routes
app.use('/mapel', requireAuth, requireRole('super_admin', 'admin'), mapelRoutes);
app.use('/kelas', requireAuth, requireRole('super_admin', 'admin'), kelasRoutes);
app.use('/guru', requireAuth, requireRole('super_admin', 'admin'), guruRoutes);
app.use('/jurnal', requireAuth, requireRole('super_admin', 'admin', 'guru'), jurnalRoutes);
app.use('/siswa', requireAuth, requireRole('super_admin', 'admin'), siswaRoutes);
app.use('/nilai', requireAuth, requireRole('super_admin', 'admin', 'guru', 'siswa'), nilaiRoutes);
app.use('/absensi', requireAuth, requireRole('super_admin', 'admin', 'guru'), absensiRoutes);

// Route untuk halaman utama - dashboard
app.get('/', requireAuth, async (req, res) => {
  console.log('📊 Dashboard route accessed by:', req.session.user.username);
  
  try {
    console.log('   Loading statistics...');
    
    // Hitung statistik untuk dashboard dengan error handling yang lebih baik
    const stats = {
      totalGuru: 0,
      totalMapel: 0,
      totalKelas: 0,
      totalSiswa: 0,
      totalJurnal: 0,
      totalNilai: 0,
      totalAbsensi: 0
    };
    
    // 1. Total Guru
    try {
      const guruList = await new Promise((resolve, reject) => {
        Guru.getAll((err, list) => {
          if (err) reject(err);
          else resolve(list || []);
        });
      });
      stats.totalGuru = guruList.length;
      console.log('   ✅ Guru loaded:', stats.totalGuru);
    } catch (error) {
      console.error('   ⚠️  Error loading Guru stats:', error.message);
    }
    
    // 2. Total Mapel
    try {
      const mapelList = await new Promise((resolve, reject) => {
        MataPelajaran.getAll((err, list) => {
          if (err) reject(err);
          else resolve(list || []);
        });
      });
      stats.totalMapel = mapelList.length;
      console.log('   ✅ Mapel loaded:', stats.totalMapel);
    } catch (error) {
      console.error('   ⚠️  Error loading Mapel stats:', error.message);
    }
    
    // 3. Total Kelas
    try {
      const kelasList = await new Promise((resolve, reject) => {
        Kelas.getAll((err, list) => {
          if (err) reject(err);
          else resolve(list || []);
        });
      });
      stats.totalKelas = kelasList.length;
      console.log('   ✅ Kelas loaded:', stats.totalKelas);
    } catch (error) {
      console.error('   ⚠️  Error loading Kelas stats:', error.message);
    }
    
    // 4. Total Siswa
    try {
      const siswaList = await new Promise((resolve, reject) => {
        Siswa.getAll('', '', (err, list) => {
          if (err) reject(err);
          else resolve(list || []);
        });
      });
      stats.totalSiswa = siswaList.length;
      console.log('   ✅ Siswa loaded:', stats.totalSiswa);
    } catch (error) {
      console.error('   ⚠️  Error loading Siswa stats:', error.message);
    }
    
    // 5. Total Jurnal
    try {
      const jurnalList = await new Promise((resolve, reject) => {
        JurnalGuru.getAll((err, list) => {
          if (err) reject(err);
          else resolve(list || []);
        });
      });
      stats.totalJurnal = jurnalList.length;
      console.log('   ✅ Jurnal loaded:', stats.totalJurnal);
    } catch (error) {
      console.error('   ⚠️  Error loading Jurnal stats:', error.message);
    }
    
    // 6. Total Nilai
    try {
      const nilaiList = await new Promise((resolve, reject) => {
        Nilai.getAll({}, (err, list) => {
          if (err) reject(err);
          else resolve(list || []);
        });
      });
      stats.totalNilai = nilaiList.length;
      console.log('   ✅ Nilai loaded:', stats.totalNilai);
    } catch (error) {
      console.error('   ⚠️  Error loading Nilai stats:', error.message);
    }
    
    // 7. Total Absensi
    try {
      const absensiCount = await new Promise((resolve, reject) => {
        Absensi.count((err, total) => {
          if (err) reject(err);
          else resolve(total || 0);
        });
      });
      stats.totalAbsensi = absensiCount;
      console.log('   ✅ Absensi loaded:', stats.totalAbsensi);
    } catch (error) {
      console.error('   ⚠️  Error loading Absensi stats:', error.message);
      // Fallback: query langsung jika method count error
      try {
        const result = await new Promise((resolve, reject) => {
          require('./config/dbConfig').get('SELECT COUNT(*) as total FROM absensi', (err, row) => {
            if (err) reject(err);
            else resolve(row ? row.total : 0);
          });
        });
        stats.totalAbsensi = result;
        console.log('   ✅ Absensi loaded (fallback):', stats.totalAbsensi);
      } catch (fallbackError) {
        console.error('   ⚠️  Fallback Absensi count juga error:', fallbackError.message);
      }
    }
    
    console.log('   🎨 Rendering dashboard view...');
    res.render('index', { 
      title: 'Dashboard - Sistem Informasi Akademik - SMA Negeri 12 Pontianak',
      user: req.session.user,
      heading: 'Dashboard Sistem Informasi',
      stats: stats
    });
    console.log('   ✅ Dashboard rendered successfully');
  } catch (error) {
    console.error('❌ CRITICAL ERROR rendering dashboard:', error);
    console.error('   Stack:', error.stack);
    res.status(500).send(`
      <h1>Error Loading Dashboard</h1>
      <p>Error: ${error.message}</p>
      <p>Check terminal for detailed error logs.</p>
    `);
  }
});

// Jalankan server
app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});