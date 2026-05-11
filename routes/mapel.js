const express = require('express');
const router = express.Router();
const MataPelajaran = require('../models/MataPelajaran');
const Guru = require('../models/Guru');
const db = require('../config/dbConfig');

// Halaman utama - daftar mata pelajaran
router.get('/', (req, res) => {
  MataPelajaran.getAll((err, rows) => {
    if (err) {
      console.error(err);
      res.status(500).send('Terjadi kesalahan pada server');
    } else {
      res.render('mapel/index', { 
        title: 'Daftar Mata Pelajaran - SMA Negeri 12 Pontianak',
        mapelList: rows,
        showBackButton: true
      });
    }
  });
});

// Form tambah mata pelajaran
router.get('/tambah', (req, res) => {
  res.render('mapel/tambah', { 
    title: 'Tambah Mata Pelajaran - SMA Negeri 12 Pontianak',
    showBackButton: true
  });
});

// Proses tambah mata pelajaran
router.post('/tambah', (req, res) => {
  const { nama_mapel, kategori, jam_pembelajaran } = req.body;
  
  console.log('📝 Menerima data mata pelajaran baru:', { nama_mapel, kategori });
  
  // Validasi input
  if (!nama_mapel || !kategori || !jam_pembelajaran) {
    console.error('❌ Validasi gagal: Field wajib kosong');
    req.flash('error', 'Nama Mata Pelajaran, Kategori, dan Jam Pembelajaran wajib diisi!');
    return res.redirect('/mapel/tambah');
  }
  
  // Validasi jam_pembelajaran harus angka positif
  if (parseInt(jam_pembelajaran) <= 0) {
    console.error('❌ Validasi gagal: Jam pembelajaran harus lebih dari 0');
    req.flash('error', 'Jam Pembelajaran harus lebih dari 0!');
    return res.redirect('/mapel/tambah');
  }
  
  // Generate kode_mapel yang unik
  let baseKode = nama_mapel.substring(0, 3).toUpperCase();
  let kodeMapel = baseKode;
  let counter = 1;
  
  // Cek apakah kode sudah ada, jika ya tambahkan nomor urut
  const checkSql = `SELECT kode_mapel FROM mata_pelajaran WHERE kode_mapel LIKE ?`;
  
  db.all(checkSql, [`${baseKode}%`], (err, rows) => {
    if (err) {
      console.error(' Error saat cek kode_mapel:', err);
      req.flash('error', 'Terjadi kesalahan saat memeriksa data!');
      return res.redirect('/mapel/tambah');
    }
    
    // Jika ada kode yang mirip, tambahkan nomor urut
    if (rows && rows.length > 0) {
      kodeMapel = `${baseKode}${rows.length + 1}`;
    }
    
    console.log(' Generated kode_mapel:', kodeMapel);
    
    MataPelajaran.create({
      kode_mapel: kodeMapel,
      nama_mapel,
      kategori,
      kelas: 10, // Default ke kelas 10
      jam_pembelajaran: parseInt(jam_pembelajaran),
      guru_pengampu: null, // Default null
      is_mapel_pilihan: 0 // Default mata pelajaran wajib
    }, (err, result) => {
      if (err) {
        console.error('❌ Error saat menyimpan data mata pelajaran:', err.message);
        
        // Cek error spesifik
        if (err.message.includes('UNIQUE constraint failed')) {
          if (err.message.includes('kode_mapel')) {
            req.flash('error', `Kode mata pelajaran ${kodeMapel} sudah terdaftar! Mungkin sudah ada mata pelajaran dengan nama yang sama.`);
          } else {
            req.flash('error', 'Data duplikat terdeteksi!');
          }
        } else {
          req.flash('error', 'Terjadi kesalahan saat menyimpan data: ' + err.message);
        }
        
        return res.redirect('/mapel/tambah');
      } else {
        console.log('✅ Data mata pelajaran berhasil disimpan dengan ID:', result.id);
        req.flash('success', `Mata pelajaran "${nama_mapel}" berhasil ditambahkan! (Kode: ${kodeMapel})`);
        res.redirect('/mapel');
      }
    });
  });
});

// Form edit mata pelajaran
router.get('/edit/:id', (req, res) => {
  const id = req.params.id;
  
  // Ambil data mata pelajaran
  MataPelajaran.getById(id, (err, row) => {
    if (err) {
      console.error(err);
      res.status(500).send('Terjadi kesalahan pada server');
    } else if (!row) {
      res.status(404).send('Data mata pelajaran tidak ditemukan');
    } else {
      res.render('mapel/edit', { 
        title: 'Edit Mata Pelajaran - SMA Negeri 12 Pontianak',
        mapel: row,
        showBackButton: true
      });
    }
  });
});

// Proses update mata pelajaran
router.post('/edit/:id', (req, res) => {
  const id = req.params.id;
  const { nama_mapel, kategori, jam_pembelajaran } = req.body;
  
  console.log('✏️ Mengupdate data mata pelajaran ID:', id);
  
  // Validasi input - hanya 3 field wajib
  if (!nama_mapel || !kategori || !jam_pembelajaran) {
    console.error('❌ Validasi gagal: Field wajib kosong');
    req.flash('error', 'Nama Mata Pelajaran, Kategori, dan Jam Pembelajaran wajib diisi!');
    return res.redirect(`/mapel/edit/${id}`);
  }
  
  // Validasi jam_pembelajaran harus angka positif
  if (parseInt(jam_pembelajaran) <= 0) {
    console.error('❌ Validasi gagal: Jam pembelajaran harus lebih dari 0');
    req.flash('error', 'Jam Pembelajaran harus lebih dari 0!');
    return res.redirect(`/mapel/edit/${id}`);
  }
  
  // Ambil data lama untuk mempertahankan field yang tidak ada di form
  MataPelajaran.getById(id, (err, oldData) => {
    if (err || !oldData) {
      req.flash('error', 'Data mata pelajaran tidak ditemukan!');
      return res.redirect('/mapel');
    }
    
    // Generate kode_mapel yang unik (sama seperti saat tambah)
    let baseKode = nama_mapel.substring(0, 3).toUpperCase();
    let kodeMapel = baseKode;
    
    // Cek apakah kode sudah ada (kecuali data saat ini)
    const checkSql = `SELECT kode_mapel FROM mata_pelajaran WHERE kode_mapel LIKE ? AND id != ?`;
    
    db.all(checkSql, [`${baseKode}%`, id], (err, rows) => {
      if (err) {
        console.error(' Error saat cek kode_mapel:', err);
        req.flash('error', 'Terjadi kesalahan saat memeriksa data!');
        return res.redirect(`/mapel/edit/${id}`);
      }
      
      // Jika ada kode yang mirip, tambahkan nomor urut
      if (rows && rows.length > 0) {
        kodeMapel = `${baseKode}${rows.length + 1}`;
      }
      
      console.log(' Generated kode_mapel untuk update:', kodeMapel);
      
      MataPelajaran.update(id, {
        kode_mapel: kodeMapel,
        nama_mapel,
        kategori,
        kelas: oldData.kelas, // Tetap menggunakan kelas lama
        jam_pembelajaran: parseInt(jam_pembelajaran),
        guru_pengampu: oldData.guru_pengampu, // Tetap menggunakan guru pengampu lama
        is_mapel_pilihan: oldData.is_mapel_pilihan // Tetap menggunakan status lama
      }, (err) => {
        if (err) {
          console.error('❌ Error saat update data mata pelajaran:', err.message);
          
          // Cek error spesifik
          if (err.message.includes('UNIQUE constraint failed')) {
            if (err.message.includes('kode_mapel')) {
              req.flash('error', `Kode mata pelajaran ${kodeMapel} sudah digunakan! Mungkin sudah ada mata pelajaran dengan nama yang sama.`);
            } else {
              req.flash('error', 'Data duplikat terdeteksi!');
            }
          } else {
            req.flash('error', 'Terjadi kesalahan saat memperbarui data: ' + err.message);
          }
          
          return res.redirect(`/mapel/edit/${id}`);
        } else {
          console.log('✅ Data mata pelajaran berhasil diupdate');
          req.flash('success', `Mata pelajaran "${nama_mapel}" berhasil diperbarui! (Kode: ${kodeMapel})`);
          res.redirect('/mapel');
        }
      });
    });
  });
});

// Toggle status mapel pilihan
router.get('/toggle-pilihan/:id', (req, res) => {
  const id = req.params.id;
  
  MataPelajaran.getById(id, (err, mapel) => {
    if (err || !mapel) {
      req.flash('error', 'Mata pelajaran tidak ditemukan!');
      return res.redirect('/mapel');
    }
    
    // Toggle status: jika 0 jadi 1, jika 1 jadi 0
    const newStatus = mapel.is_mapel_pilihan === 1 ? 0 : 1;
    
    MataPelajaran.update(id, {
      kode_mapel: mapel.kode_mapel,
      nama_mapel: mapel.nama_mapel,
      kategori: mapel.kategori,
      kelas: mapel.kelas,
      jam_pembelajaran: mapel.jam_pembelajaran,
      guru_pengampu: mapel.guru_pengampu,
      is_mapel_pilihan: newStatus
    }, (updateErr) => {
      if (updateErr) {
        console.error('❌ Error saat toggle status:', updateErr.message);
        req.flash('error', 'Gagal mengubah status: ' + updateErr.message);
      } else {
        const statusText = newStatus === 1 ? 'Mata Pelajaran Pilihan' : 'Mata Pelajaran Wajib';
        req.flash('success', `${mapel.nama_mapel} sekarang adalah ${statusText}`);
      }
      res.redirect('/mapel');
    });
  });
});

// Hapus mata pelajaran
router.get('/hapus/:id', (req, res) => {
  const id = req.params.id;
  
  // Ambil nama mapel untuk pesan konfirmasi
  MataPelajaran.getById(id, (err, row) => {
    if (err || !row) {
      console.error('❌ Error mengambil data mapel untuk hapus');
      req.flash('error', 'Data mata pelajaran tidak ditemukan!');
      return res.redirect('/mapel');
    }
    
    MataPelajaran.delete(id, (err) => {
      if (err) {
        console.error('❌ Error saat menghapus data mata pelajaran:', err.message);
        req.flash('error', 'Gagal menghapus data. Mungkin ada data terkait yang masih menggunakan.');
        return res.redirect('/mapel');
      } else {
        console.log('✅ Data mata pelajaran berhasil dihapus');
        req.flash('success', `Mata pelajaran "${row.nama_mapel}" berhasil dihapus!`);
        res.redirect('/mapel');
      }
    });
  });
});

module.exports = router;