const express = require('express');
const router = express.Router();
const Siswa = require('../models/Siswa');
const Kelas = require('../models/Kelas');
const xlsx = require('xlsx');
const fs = require('fs');
const path = require('path');
const multer = require('multer');

// Konfigurasi multer untuk upload file Excel
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '..', 'uploads');
    // Buat folder uploads jika belum ada
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
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

// Halaman utama - daftar siswa
router.get('/', (req, res) => {
  // Sync all class student counts before displaying
  const Kelas = require('../models/Kelas');
  Kelas.syncAllJumlahSiswa((syncErr) => {
    if (syncErr) {
      console.error('Error syncing student counts:', syncErr);
    }
    
    // Get sort and search parameters from query string
    const sortBy = req.query.sort || 'nama';
    const search = req.query.search || '';
    
    Siswa.getAll(sortBy, search, (err, rows) => {
      if (err) {
        console.error(err);
        res.status(500).send('Terjadi kesalahan pada server');
      } else {
        res.render('siswa/index', { 
          title: 'Daftar Siswa - SMA Negeri 12 Pontianak',
          siswaList: rows,
          sortBy: sortBy,
          search: search,
          showBackButton: true
        });
      }
    });
  });
});

// Form tambah siswa
router.get('/tambah', (req, res) => {
  Kelas.getAll((err, kelasRows) => {
    if (err) {
      console.error(err);
      res.status(500).send('Terjadi kesalahan saat mengambil data kelas');
    } else {
      res.render('siswa/tambah', { 
        title: 'Tambah Siswa - SMA Negeri 12 Pontianak',
        kelasList: kelasRows,
        showBackButton: true
      });
    }
  });
});

// Proses tambah siswa
router.post('/tambah', (req, res) => {
  const { nis, nisn, nama_siswa, jenis_kelamin, tempat_lahir, tanggal_lahir, alamat, nomor_telepon, kelas_id, tahun_ajaran, status } = req.body;
  
  Siswa.create({
    nis,
    nisn,
    nama_siswa,
    jenis_kelamin,
    tempat_lahir,
    tanggal_lahir,
    alamat,
    nomor_telepon,
    kelas_id: kelas_id || null,
    tahun_ajaran,
    status: status || 'aktif'
  }, (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).send('Terjadi kesalahan saat menyimpan data');
    } else {
      res.redirect('/siswa');
    }
  });
});

// Form edit siswa
router.get('/edit/:id', (req, res) => {
  const id = req.params.id;
  
  Siswa.getById(id, (err, row) => {
    if (err) {
      console.error(err);
      res.status(500).send('Terjadi kesalahan pada server');
    } else if (!row) {
      res.status(404).send('Data siswa tidak ditemukan');
    } else {
      Kelas.getAll((err, kelasRows) => {
        if (err) {
          console.error(err);
          res.status(500).send('Terjadi kesalahan saat mengambil data kelas');
        } else {
          res.render('siswa/edit', { 
            title: 'Edit Siswa - SMA Negeri 12 Pontianak',
            siswa: row,
            kelasList: kelasRows,
            showBackButton: true
          });
        }
      });
    }
  });
});

// Proses update siswa
router.post('/edit/:id', (req, res) => {
  const id = req.params.id;
  const { nis, nisn, nama_siswa, jenis_kelamin, tempat_lahir, tanggal_lahir, alamat, nomor_telepon, kelas_id, tahun_ajaran, status } = req.body;
  
  Siswa.update(id, {
    nis,
    nisn,
    nama_siswa,
    jenis_kelamin,
    tempat_lahir,
    tanggal_lahir,
    alamat,
    nomor_telepon,
    kelas_id: kelas_id || null,
    tahun_ajaran,
    status
  }, (err) => {
    if (err) {
      console.error(err);
      res.status(500).send('Terjadi kesalahan saat mengupdate data');
    } else {
      res.redirect('/siswa');
    }
  });
});

// Proses hapus siswa
router.get('/hapus/:id', (req, res) => {
  const id = req.params.id;
  
  Siswa.delete(id, (err) => {
    if (err) {
      console.error(err);
      req.flash('error', 'Gagal menghapus data siswa');
      // Redirect dengan mempertahankan parameter sort dan search
      const sortBy = req.query.sort || 'nama';
      const search = req.query.search || '';
      let redirectUrl = `/siswa?sort=${sortBy}`;
      if (search) {
        redirectUrl += `&search=${encodeURIComponent(search)}`;
      }
      res.redirect(redirectUrl);
    } else {
      req.flash('success', 'Data siswa berhasil dihapus');
      // Redirect dengan mempertahankan parameter sort dan search
      const sortBy = req.query.sort || 'nama';
      const search = req.query.search || '';
      let redirectUrl = `/siswa?sort=${sortBy}`;
      if (search) {
        redirectUrl += `&search=${encodeURIComponent(search)}`;
      }
      res.redirect(redirectUrl);
    }
  });
});

// Form import Excel
router.get('/import', (req, res) => {
  res.render('siswa/import', { 
    title: 'Import Data Siswa - SMA Negeri 12 Pontianak'
  });
});

// Proses import Excel
router.post('/import', upload.single('file'), (req, res) => {
  // Ambil file dari req.file (dari multer)
  if (!req.file) {
    req.flash('error', 'Silakan pilih file Excel terlebih dahulu');
    return res.redirect('/siswa/import');
  }

  console.log('📥 Mulai proses import Excel...');
  console.log('📄 File:', req.file.originalname);
  console.log('📍 Path:', req.file.path);

  try {
    // Baca file Excel
    const workbook = xlsx.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // Convert ke JSON
    const data = xlsx.utils.sheet_to_json(worksheet);
    
    console.log('📊 Total baris data:', data.length);
    
    if (data.length === 0) {
      // Hapus file setelah diproses
      fs.unlinkSync(req.file.path);
      console.log('❌ File Excel kosong');
      req.flash('error', 'File Excel kosong atau format tidak sesuai');
      return res.redirect('/siswa/import');
    }

    // Ambil semua siswa yang sudah ada untuk cek duplikasi
    Siswa.getAll('nama', (err, existingStudents) => {
      if (err) {
        console.error('❌ Error mengambil data siswa existing:', err);
        fs.unlinkSync(req.file.path);
        req.flash('error', 'Gagal mengambil data siswa existing');
        return res.redirect('/siswa/import');
      }

      console.log('✅ Data existing loaded:', existingStudents.length, 'siswa');

      // Buat Set untuk nama siswa yang sudah ada (case-insensitive)
      const existingNames = new Set();
      existingStudents.forEach(s => {
        existingNames.add(s.nama_siswa.toUpperCase().trim());
      });

      // Cek duplikasi dalam file Excel itu sendiri
      const namesInFile = {};
      const duplicateInFile = [];
      
      data.forEach((row, index) => {
        const namaSiswa = (row['Nama'] || row['nama'] || row['Nama Siswa'] || row['NAMA SISWA'] || '').toString().toUpperCase().trim();
        
        if (!namaSiswa) return;
        
        if (namesInFile[namaSiswa]) {
          duplicateInFile.push({
            name: namaSiswa,
            rows: [namesInFile[namaSiswa], index + 2]
          });
        } else {
          namesInFile[namaSiswa] = index + 2;
        }
      });

      // Jika ada duplikasi dalam file
      if (duplicateInFile.length > 0) {
        console.log('❌ Ditemukan duplikasi dalam file:', duplicateInFile.length);
        fs.unlinkSync(req.file.path);
        const dupMessages = duplicateInFile.map(d => 
          `Nama "${d.name}" muncul di baris ${d.rows.join(' dan ')}`
        );
        req.flash('error', 'Import dibatalkan! Ditemukan duplikasi nama dalam file:');
        req.flash('errors', dupMessages);
        return res.redirect('/siswa/import');
      }

      console.log('✅ Tidak ada duplikasi dalam file');

      // Cek duplikasi dengan data existing di database
      const duplicateWithExisting = [];
      data.forEach((row, index) => {
        const namaSiswa = (row['Nama'] || row['nama'] || row['Nama Siswa'] || row['NAMA SISWA'] || '').toString().toUpperCase().trim();
        
        if (!namaSiswa) return;
        
        if (existingNames.has(namaSiswa)) {
          duplicateWithExisting.push({
            name: namaSiswa,
            row: index + 2
          });
        }
      });

      // Jika ada duplikasi dengan database
      if (duplicateWithExisting.length > 0) {
        console.log('❌ Ditemukan duplikasi dengan database:', duplicateWithExisting.length);
        fs.unlinkSync(req.file.path);
        const dupMessages = duplicateWithExisting.map(d => 
          `Baris ${d.row}: Nama "${d.name}" sudah ada di database`
        );
        req.flash('error', 'Import dibatalkan! Ditemukan nama siswa yang sudah ada:');
        req.flash('errors', dupMessages);
        return res.redirect('/siswa/import');
      }

      console.log('✅ Tidak ada duplikasi dengan database');
      console.log('🚀 Memulai proses insert ke database...');

      // Jika tidak ada duplikasi, lanjutkan proses import
      let berhasil = 0;
      let gagal = 0;
      const errors = [];

      // Ambil semua kelas untuk mapping
      Kelas.getAll((err, kelasList) => {
        if (err) {
          console.error('❌ Error mengambil data kelas:', err);
          fs.unlinkSync(req.file.path);
          req.flash('error', 'Gagal mengambil data kelas');
          return res.redirect('/siswa/import');
        }

        console.log('✅ Data kelas loaded:', kelasList.length, 'kelas');

        // Buat mapping nama kelas ke ID
        const kelasMap = {};
        kelasList.forEach(k => {
          kelasMap[k.nama_kelas.toUpperCase()] = k.id;
        });

        console.log('🗺️ Kelas map:', Object.keys(kelasMap).length, 'entries');

        // Proses setiap baris data
        data.forEach((row, index) => {
          try {
            // Mapping nama kolom dari Excel ke field database
            const namaKelas = row['Kelas'] || row['kelas'] || row['KELAS'];
            const kelasId = namaKelas ? kelasMap[namaKelas.toString().toUpperCase()] : null;

            if (namaKelas && !kelasId) {
              console.warn(`⚠️ Baris ${index + 2}: Kelas "${namaKelas}" tidak ditemukan di database`);
            }

            const siswaData = {
              nis: row['NIS'] || row['nis'] || row['Nis'] || '',
              nisn: row['NISN'] || row['nisn'] || row['Nisn'] || '',
              nama_siswa: row['Nama'] || row['nama'] || row['Nama Siswa'] || row['NAMA SISWA'] || '',
              jenis_kelamin: row['Jenis Kelamin'] || row['jenis kelamin'] || row['JK'] || row['jk'] || '',
              tempat_lahir: row['Tempat Lahir'] || row['tempat lahir'] || row['TempatLahir'] || '',
              tanggal_lahir: row['Tanggal Lahir'] || row['tanggal lahir'] || row['TanggalLahir'] || '',
              alamat: row['Alamat'] || row['alamat'] || row['ALAMAT'] || '',
              nomor_telepon: row['No Telepon'] || row['no telepon'] || row['Telepon'] || row['telepon'] || '',
              kelas_id: kelasId,
              tahun_ajaran: row['Tahun Ajaran'] || row['tahun ajaran'] || row['TahunAjaran'] || '2025/2026',
              status: row['Status'] || row['status'] || 'aktif'
            };

            // Validasi data wajib
            if (!siswaData.nama_siswa) {
              console.warn(`⚠️ Baris ${index + 2}: Nama kosong`);
              gagal++;
              errors.push(`Baris ${index + 2}: Nama siswa tidak boleh kosong`);
              return;
            }

            // Normalisasi jenis kelamin
            if (siswaData.jenis_kelamin) {
              const jk = siswaData.jenis_kelamin.toString().toUpperCase();
              if (jk === 'L' || jk === 'LAKI-LAKI' || jk === 'LAKI LAKI') {
                siswaData.jenis_kelamin = 'L';
              } else if (jk === 'P' || jk === 'PEREMPUAN') {
                siswaData.jenis_kelamin = 'P';
              } else {
                siswaData.jenis_kelamin = '';
              }
            }

            // Normalisasi status
            if (siswaData.status) {
              const status = siswaData.status.toString().toLowerCase();
              if (status === 'aktif') {
                siswaData.status = 'aktif';
              } else if (status === 'non-aktif' || status === 'non aktif') {
                siswaData.status = 'non-aktif';
              } else if (status === 'lulus') {
                siswaData.status = 'lulus';
              } else {
                siswaData.status = 'aktif';
              }
            }

            // Konversi tanggal jika format Excel date
            if (siswaData.tanggal_lahir && typeof siswaData.tanggal_lahir === 'number') {
              // Excel date to JS date
              const excelDate = new Date((siswaData.tanggal_lahir - 25569) * 86400 * 1000);
              siswaData.tanggal_lahir = excelDate.toISOString().split('T')[0];
            }

            console.log(`💾 Menyimpan baris ${index + 2}: ${siswaData.nama_siswa} (Kelas: ${namaKelas || 'N/A'})`);

            // Simpan ke database
            Siswa.create(siswaData, (err, result) => {
              if (err) {
                console.error(`❌ Baris ${index + 2} GAGAL:`, err.message);
                gagal++;
                errors.push(`Baris ${index + 2}: Gagal menyimpan data - ${err.message}`);
              } else {
                console.log(`✅ Baris ${index + 2} BERHASIL (ID: ${result.id})`);
                berhasil++;
              }

              // Jika sudah selesai memproses semua data
              if (berhasil + gagal === data.length) {
                console.log(`\n📊 ===== IMPORT SELESAI =====`);
                console.log(`✅ Berhasil: ${berhasil}`);
                console.log(`❌ Gagal: ${gagal}`);
                console.log(`📝 Total: ${data.length}`);
                
                // Hapus file setelah diproses
                fs.unlinkSync(req.file.path);

                // Set flash message
                if (errors.length > 0) {
                  req.flash('warning', `Import selesai: ${berhasil} berhasil, ${gagal} gagal`);
                  req.flash('errors', errors);
                } else {
                  req.flash('success', `Berhasil mengimport ${berhasil} data siswa tanpa duplikasi`);
                }

                res.redirect('/siswa');
              }
            });
          } catch (error) {
            console.error(`❌ Baris ${index + 2} ERROR:`, error.message);
            gagal++;
            errors.push(`Baris ${index + 2}: Error processing - ${error.message}`);
          }
        });
      });
    });
  } catch (error) {
    console.error('❌ FATAL ERROR saat import:', error);
    // Hapus file jika ada error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    req.flash('error', `Gagal memproses file: ${error.message}`);
    res.redirect('/siswa/import');
  }
});

// Download template Excel
router.get('/template', (req, res) => {
  // Buat workbook baru
  const wb = xlsx.utils.book_new();
  
  // Buat data template
  const templateData = [
    {
      'NIS': '12345',
      'NISN': '1234567890',
      'Nama': 'Contoh Nama Siswa',
      'Jenis Kelamin': 'L',
      'Tempat Lahir': 'Pontianak',
      'Tanggal Lahir': '2005-01-15',
      'Alamat': 'Jl. Contoh No. 123',
      'No Telepon': '081234567890',
      'Kelas': 'X IPA 1',
      'Tahun Ajaran': '2025/2026',
      'Status': 'aktif'
    },
    {
      'NIS': '12346',
      'NISN': '1234567891',
      'Nama': 'Contoh Nama Siswi',
      'Jenis Kelamin': 'P',
      'Tempat Lahir': 'Pontianak',
      'Tanggal Lahir': '2005-02-20',
      'Alamat': 'Jl. Contoh No. 456',
      'No Telepon': '081234567891',
      'Kelas': 'X IPA 1',
      'Tahun Ajaran': '2025/2026',
      'Status': 'aktif'
    }
  ];

  // Buat worksheet
  const ws = xlsx.utils.json_to_sheet(templateData);
  
  // Set column widths
  ws['!cols'] = [
    { wch: 10 }, // NIS
    { wch: 15 }, // NISN
    { wch: 30 }, // Nama
    { wch: 15 }, // Jenis Kelamin
    { wch: 15 }, // Tempat Lahir
    { wch: 15 }, // Tanggal Lahir
    { wch: 30 }, // Alamat
    { wch: 15 }, // No Telepon
    { wch: 15 }, // Kelas
    { wch: 15 }, // Tahun Ajaran
    { wch: 10 }  // Status
  ];

  // Add worksheet to workbook
  xlsx.utils.book_append_sheet(wb, ws, 'Data Siswa');

  // Generate Excel file
  const excelBuffer = xlsx.write(wb, { bookType: 'xlsx', type: 'buffer' });

  // Set response headers
  res.setHeader('Content-Disposition', 'attachment; filename=Template-Data-Siswa.xlsx');
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  
  res.send(excelBuffer);
});

// API Endpoint - Get students by class ID (for dynamic filtering in forms)
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

module.exports = router;
