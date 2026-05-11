const express = require('express');
const router = express.Router();
const Guru = require('../models/Guru');
const multer = require('multer');
const xlsx = require('xlsx');
const path = require('path');
const fs = require('fs');

// Konfigurasi multer untuk upload file Excel
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/';
    // Buat folder uploads jika belum ada
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel'
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Hanya file Excel (.xlsx atau .xls) yang diperbolehkan!'), false);
    }
  }
});

// Halaman utama - daftar guru
router.get('/', (req, res) => {
  Guru.getAll((err, rows) => {
    if (err) {
      console.error(err);
      res.status(500).send('Terjadi kesalahan pada server');
    } else {
      // Ambil importErrors dari session jika ada, lalu hapus
      const importErrors = req.session.importErrors || [];
      delete req.session.importErrors;
      
      res.render('guru/index', { 
        title: 'Daftar Guru - SMA Negeri 12 Pontianak',
        guruList: rows,
        showBackButton: true,
        importErrors: importErrors
      });
    }
  });
});

// Form tambah guru
router.get('/tambah', (req, res) => {
  res.render('guru/tambah', { 
    title: 'Tambah Guru - SMA Negeri 12 Pontianak',
    showBackButton: true
  });
});

// Proses tambah guru
router.post('/tambah', (req, res) => {
  const { nip, nama_guru, jenis_kelamin, tanggal_lahir, alamat, nomor_telepon, email } = req.body;
  
  console.log('📝 Menerima data guru baru:', { nip, nama_guru, jenis_kelamin });
  
  // Validasi input
  if (!nip || !nama_guru || !jenis_kelamin) {
    console.error('❌ Validasi gagal: Field wajib kosong');
    req.flash('error', 'NIP, Nama Guru, dan Jenis Kelamin wajib diisi!');
    return res.redirect('/guru/tambah');
  }
  
  Guru.create({
    nip,
    nama_guru,
    jenis_kelamin,
    tanggal_lahir: tanggal_lahir || null,
    alamat: alamat || null,
    nomor_telepon: nomor_telepon || null,
    email: email || null
  }, (err, result) => {
    if (err) {
      console.error('❌ Error saat menyimpan data guru:', err.message);
      
      // Cek error spesifik
      if (err.message.includes('UNIQUE constraint failed')) {
        if (err.message.includes('nip')) {
          req.flash('error', 'NIP sudah terdaftar! Gunakan NIP yang berbeda.');
        } else if (err.message.includes('email')) {
          req.flash('error', 'Email sudah terdaftar! Gunakan email yang berbeda.');
        } else {
          req.flash('error', 'Data duplikat terdeteksi!');
        }
      } else {
        req.flash('error', 'Terjadi kesalahan saat menyimpan data: ' + err.message);
      }
      
      return res.redirect('/guru/tambah');
    } else {
      console.log('✅ Data guru berhasil disimpan dengan ID:', result.id);
      req.flash('success', `Data guru "${nama_guru}" berhasil ditambahkan!`);
      res.redirect('/guru');
    }
  });
});

// Form edit guru
router.get('/edit/:id', (req, res) => {
  const id = req.params.id;
  
  Guru.getById(id, (err, row) => {
    if (err) {
      console.error(err);
      res.status(500).send('Terjadi kesalahan pada server');
    } else if (!row) {
      res.status(404).send('Data guru tidak ditemukan');
    } else {
      res.render('guru/edit', { 
        title: 'Edit Guru - SMA Negeri 12 Pontianak',
        guru: row,
        showBackButton: true
      });
    }
  });
});

// Proses update guru
router.post('/edit/:id', (req, res) => {
  const id = req.params.id;
  const { nip, nama_guru, jenis_kelamin, tanggal_lahir, alamat, nomor_telepon, email } = req.body;
  
  console.log('✏️ Mengupdate data guru ID:', id);
  
  // Validasi input
  if (!nip || !nama_guru || !jenis_kelamin) {
    console.error('❌ Validasi gagal: Field wajib kosong');
    req.flash('error', 'NIP, Nama Guru, dan Jenis Kelamin wajib diisi!');
    return res.redirect(`/guru/edit/${id}`);
  }
  
  Guru.update(id, {
    nip,
    nama_guru,
    jenis_kelamin,
    tanggal_lahir: tanggal_lahir || null,
    alamat: alamat || null,
    nomor_telepon: nomor_telepon || null,
    email: email || null
  }, (err) => {
    if (err) {
      console.error('❌ Error saat update data guru:', err.message);
      
      // Cek error spesifik
      if (err.message.includes('UNIQUE constraint failed')) {
        if (err.message.includes('nip')) {
          req.flash('error', 'NIP sudah digunakan oleh guru lain!');
        } else if (err.message.includes('email')) {
          req.flash('error', 'Email sudah digunakan oleh guru lain!');
        } else {
          req.flash('error', 'Data duplikat terdeteksi!');
        }
      } else {
        req.flash('error', 'Terjadi kesalahan saat memperbarui data: ' + err.message);
      }
      
      return res.redirect(`/guru/edit/${id}`);
    } else {
      console.log('✅ Data guru berhasil diupdate');
      req.flash('success', `Data guru "${nama_guru}" berhasil diperbarui!`);
      res.redirect('/guru');
    }
  });
});

// Hapus guru
router.get('/hapus/:id', (req, res) => {
  const id = req.params.id;
  
  Guru.delete(id, (err) => {
    if (err) {
      console.error(err);
      res.status(500).send('Terjadi kesalahan saat menghapus data');
    } else {
      res.redirect('/guru');
    }
  });
});

// Halaman import Excel
router.get('/import', (req, res) => {
  res.render('guru/import', { 
    title: 'Import Data Guru - SMA Negeri 12 Pontianak',
    showBackButton: true
  });
});

// Proses import Excel
router.post('/import', upload.single('file_excel'), async (req, res) => {
  try {
    if (!req.file) {
      req.flash('error', 'Silakan pilih file Excel untuk diupload!');
      return res.redirect('/guru/import');
    }

    console.log('📊 Memproses file Excel:', req.file.originalname);

    // Baca file Excel
    const workbook = xlsx.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // Konversi ke JSON
    const data = xlsx.utils.sheet_to_json(worksheet);
    
    console.log(`📋 Ditemukan ${data.length} baris data`);

    if (data.length === 0) {
      fs.unlinkSync(req.file.path); // Hapus file setelah diproses
      req.flash('error', 'File Excel kosong atau tidak ada data yang valid!');
      return res.redirect('/guru/import');
    }

    let successCount = 0;
    let errorCount = 0;
    const errors = [];

    // Proses setiap baris data secara berurutan
    for (let index = 0; index < data.length; index++) {
      const row = data[index];
      
      // Mapping kolom Excel ke field database
      const nip = row['NIP'] || row['nip'] || '';
      const nama_guru = row['Nama Guru'] || row['nama_guru'] || row['Nama'] || '';
      const jenis_kelamin = row['Jenis Kelamin'] || row['jenis_kelamin'] || row['JK'] || '';
      const tanggal_lahir = row['Tanggal Lahir'] || row['tanggal_lahir'] || null;
      const alamat = row['Alamat'] || row['alamat'] || null;
      const nomor_telepon = row['Nomor Telepon'] || row['nomor_telepon'] || row['Telepon'] || null;
      const email = row['Email'] || row['email'] || null;

      // Validasi field wajib
      if (!nip || !nama_guru || !jenis_kelamin) {
        errorCount++;
        errors.push(`Baris ${index + 2}: NIP, Nama, dan Jenis Kelamin wajib diisi`);
        continue;
      }

      // Normalisasi jenis kelamin sesuai CHECK constraint database
      let jk = jenis_kelamin.toString().trim().toUpperCase();
      if (jk === 'LAKI-LAKI' || jk === 'L' || jk === 'LA' || jk === 'LAKI') {
        jk = 'Laki-laki';  // Sesuai dengan CHECK constraint database
      } else if (jk === 'PEREMPUAN' || jk === 'P' || jk === 'PR' || jk === 'WANITA') {
        jk = 'Perempuan';  // Sesuai dengan CHECK constraint database
      } else {
        errorCount++;
        errors.push(`Baris ${index + 2}: Jenis Kelamin harus 'Laki-laki' atau 'Perempuan' (diterima: "${jenis_kelamin}")`);
        continue;
      }

      // Simpan ke database menggunakan Promise
      try {
        await new Promise((resolve, reject) => {
          Guru.create({
            nip: nip.toString(),
            nama_guru,
            jenis_kelamin: jk,
            tanggal_lahir: tanggal_lahir || null,
            alamat: alamat || null,
            nomor_telepon: nomor_telepon || null,
            email: email || null
          }, (err, result) => {
            if (err) {
              reject(err);
            } else {
              resolve(result);
            }
          });
        });
        
        successCount++;
        console.log(`✅ Baris ${index + 2} berhasil disimpan`);
      } catch (err) {
        console.error(`❌ Error menyimpan baris ${index + 2}:`, err.message);
        errorCount++;
        if (err.message.includes('UNIQUE constraint failed')) {
          errors.push(`Baris ${index + 2}: NIP ${nip} sudah terdaftar`);
        } else {
          errors.push(`Baris ${index + 2}: ${err.message}`);
        }
      }
    }

    // Hapus file setelah diproses
    fs.unlinkSync(req.file.path);

    // Set flash message berdasarkan hasil
    if (errorCount === 0) {
      req.flash('success', `Berhasil mengimport ${successCount} data guru!`);
    } else {
      req.flash('warning', `Import selesai: ${successCount} berhasil, ${errorCount} gagal.`);
      req.session.importErrors = errors;
    }
    
    res.redirect('/guru');

  } catch (error) {
    console.error('❌ Error saat import Excel:', error);
    
    // Hapus file jika ada error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    req.flash('error', 'Terjadi kesalahan saat memproses file: ' + error.message);
    res.redirect('/guru/import');
  }
});

// Download template Excel
router.get('/download-template', (req, res) => {
  // Buat workbook baru
  const wb = xlsx.utils.book_new();
  
  // Data contoh untuk template
  const templateData = [
    {
      'NIP': '198501012010011001',
      'Nama Guru': 'Budi Santoso, S.Pd',
      'Jenis Kelamin': 'L',
      'Tanggal Lahir': '1985-01-01',
      'Alamat': 'Jl. Pendidikan No. 1, Pontianak',
      'Nomor Telepon': '081234567890',
      'Email': 'budi.santoso@example.com'
    },
    {
      'NIP': '198702022011012002',
      'Nama Guru': 'Siti Rahayu, M.Pd',
      'Jenis Kelamin': 'P',
      'Tanggal Lahir': '1987-02-02',
      'Alamat': 'Jl. Guru No. 2, Pontianak',
      'Nomor Telepon': '082345678901',
      'Email': 'siti.rahayu@example.com'
    }
  ];
  
  // Buat worksheet
  const ws = xlsx.utils.json_to_sheet(templateData);
  
  // Atur lebar kolom
  ws['!cols'] = [
    { wch: 20 }, // NIP
    { wch: 30 }, // Nama Guru
    { wch: 15 }, // Jenis Kelamin
    { wch: 15 }, // Tanggal Lahir
    { wch: 40 }, // Alamat
    { wch: 15 }, // Nomor Telepon
    { wch: 30 }  // Email
  ];
  
  // Tambahkan worksheet ke workbook
  xlsx.utils.book_append_sheet(wb, ws, 'Data Guru');
  
  // Generate filename dengan timestamp
  const fileName = `Template_Import_Guru_${new Date().toISOString().split('T')[0]}.xlsx`;
  
  // Kirim file ke client
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
  
  const buffer = xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });
  res.send(buffer);
});

module.exports = router;