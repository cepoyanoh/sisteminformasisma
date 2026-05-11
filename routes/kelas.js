const express = require('express');
const router = express.Router();
const Kelas = require('../models/Kelas');
const Guru = require('../models/Guru');

// Halaman utama - daftar kelas
router.get('/', (req, res) => {
  // Sync all class student counts before displaying
  Kelas.syncAllJumlahSiswa((syncErr) => {
    if (syncErr) {
      console.error('Error syncing student counts:', syncErr);
    }
    
    Kelas.getAll((err, rows) => {
      if (err) {
        console.error(err);
        res.status(500).send('Terjadi kesalahan pada server');
      } else {
        res.render('kelas/index', { 
          title: 'Daftar Kelas - SMA Negeri 12 Pontianak',
          kelasList: rows,
          showBackButton: true
        });
      }
    });
  });
});

// Form tambah kelas
router.get('/tambah', (req, res) => {
  Guru.getAll((err, guruRows) => {
    if (err) {
      console.error(err);
      res.status(500).send('Terjadi kesalahan saat mengambil data guru');
    } else {
      res.render('kelas/tambah', { 
        title: 'Tambah Kelas - SMA Negeri 12 Pontianak',
        guruList: guruRows,
        showBackButton: true
      });
    }
  });
});

// Proses tambah kelas
router.post('/tambah', (req, res) => {
  const { nama_kelas, jurusan, wali_kelas, tahun_pelajaran, jumlah_siswa } = req.body;
  
  Kelas.create({
    nama_kelas,
    jurusan: '',
    wali_kelas: wali_kelas || null,  // Ini sekarang adalah ID guru
    tahun_pelajaran,
    jumlah_siswa: parseInt(jumlah_siswa) || 0
  }, (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).send('Terjadi kesalahan saat menyimpan data');
    } else {
      res.redirect('/kelas'); // Kembali ke halaman daftar kelas
    }
  });
});

// Form edit kelas
router.get('/edit/:id', (req, res) => {
  const id = req.params.id;
  
  Kelas.getById(id, (err, row) => {
    if (err) {
      console.error(err);
      res.status(500).send('Terjadi kesalahan pada server');
    } else if (!row) {
      res.status(404).send('Data kelas tidak ditemukan');
    } else {
      Guru.getAll((err, guruRows) => {
        if (err) {
          console.error(err);
          res.status(500).send('Terjadi kesalahan saat mengambil data guru');
        } else {
          res.render('kelas/edit', { 
            title: 'Edit Kelas - SMA Negeri 12 Pontianak',
            kelas: row,
            guruList: guruRows,
            showBackButton: true
          });
        }
      });
    }
  });
});

// Proses update kelas
router.post('/edit/:id', (req, res) => {
  const id = req.params.id;
  const { nama_kelas, jurusan, wali_kelas, tahun_pelajaran, jumlah_siswa } = req.body;
  
  Kelas.update(id, {
    nama_kelas,
    jurusan: '',
    wali_kelas: wali_kelas || null,  // Ini sekarang adalah ID guru
    tahun_pelajaran,
    jumlah_siswa: parseInt(jumlah_siswa) || 0
  }, (err) => {
    if (err) {
      console.error(err);
      res.status(500).send('Terjadi kesalahan saat memperbarui data');
    } else {
      res.redirect('/kelas');
    }
  });
});

// Hapus kelas
router.get('/hapus/:id', (req, res) => {
  const id = req.params.id;
  
  Kelas.delete(id, (err) => {
    if (err) {
      console.error(err);
      res.status(500).send('Terjadi kesalahan saat menghapus data');
    } else {
      res.redirect('/kelas');
    }
  });
});

module.exports = router;