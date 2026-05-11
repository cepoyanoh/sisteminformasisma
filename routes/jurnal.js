const express = require('express');
const router = express.Router();
const JurnalGuru = require('../models/JurnalGuru');
const Guru = require('../models/Guru');
const Kelas = require('../models/Kelas');
const MataPelajaran = require('../models/MataPelajaran');

// Halaman utama - daftar jurnal guru
router.get('/', (req, res) => {
  JurnalGuru.getAll((err, rows) => {
    if (err) {
      console.error(err);
      res.status(500).send('Terjadi kesalahan pada server');
    } else {
      res.render('jurnal/index', { 
        title: 'Jurnal Guru - SMA Negeri 12 Pontianak',
        jurnalList: rows,
        showBackButton: true
      });
    }
  });
});

// Form tambah jurnal guru
router.get('/tambah', (req, res) => {
  // Ambil semua guru, kelas, dan mata pelajaran untuk ditampilkan di form
  Guru.getAll((err, guruRows) => {
    if (err) {
      console.error(err);
      res.status(500).send('Terjadi kesalahan saat mengambil data guru');
    } else {
      Kelas.getAll((err, kelasRows) => {
        if (err) {
          console.error(err);
          res.status(500).send('Terjadi kesalahan saat mengambil data kelas');
        } else {
          MataPelajaran.getAll((err, mapelRows) => {
            if (err) {
              console.error(err);
              res.status(500).send('Terjadi kesalahan saat mengambil data mata pelajaran');
            } else {
              res.render('jurnal/tambah', { 
                title: 'Tambah Jurnal Guru - SMA Negeri 12 Pontianak',
                guruList: guruRows,
                kelasList: kelasRows,
                mapelList: mapelRows,
                showBackButton: true
              });
            }
          });
        }
      });
    }
  });
});

// Proses tambah jurnal guru
router.post('/tambah', (req, res) => {
  const { guru_id, tanggal, jam_ke, kelas_id, mapel_id, materi, metode_pembelajaran, jumlah_siswa, hadir, sakit, izin, alpha, catatan } = req.body;
  
  JurnalGuru.create({
    guru_id: parseInt(guru_id),
    tanggal,
    jam_ke: parseInt(jam_ke),
    kelas_id: parseInt(kelas_id),
    mapel_id: parseInt(mapel_id),
    materi,
    metode_pembelajaran,
    jumlah_siswa: Math.max(0, parseInt(jumlah_siswa) || 0), // Pastikan jumlah_siswa tidak bernilai negatif
    hadir: parseInt(hadir) || 0,
    sakit: parseInt(sakit) || 0,
    izin: parseInt(izin) || 0,
    alpha: parseInt(alpha) || 0,
    catatan
  }, (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).send('Terjadi kesalahan saat menyimpan data');
    } else {
      res.redirect('/jurnal'); // Kembali ke halaman daftar jurnal guru
    }
  });
});

// Form edit jurnal guru
router.get('/edit/:id', (req, res) => {
  const id = req.params.id;
  
  // Ambil data jurnal guru dan referensi lainnya
  JurnalGuru.getById(id, (err, row) => {
    if (err) {
      console.error(err);
      res.status(500).send('Terjadi kesalahan pada server');
    } else if (!row) {
      res.status(404).send('Data jurnal guru tidak ditemukan');
    } else {
      Guru.getAll((err, guruRows) => {
        if (err) {
          console.error(err);
          res.status(500).send('Terjadi kesalahan saat mengambil data guru');
        } else {
          Kelas.getAll((err, kelasRows) => {
            if (err) {
              console.error(err);
              res.status(500).send('Terjadi kesalahan saat mengambil data kelas');
            } else {
              MataPelajaran.getAll((err, mapelRows) => {
                if (err) {
                  console.error(err);
                  res.status(500).send('Terjadi kesalahan saat mengambil data mata pelajaran');
                } else {
                  res.render('jurnal/edit', { 
                    title: 'Edit Jurnal Guru - SMA Negeri 12 Pontianak',
                    jurnal: row,
                    guruList: guruRows,
                    kelasList: kelasRows,
                    mapelList: mapelRows,
                    showBackButton: true
                  });
                }
              });
            }
          });
        }
      });
    }
  });
});

// Proses update jurnal guru
router.post('/edit/:id', (req, res) => {
  const id = req.params.id;
  const { guru_id, tanggal, jam_ke, kelas_id, mapel_id, materi, metode_pembelajaran, jumlah_siswa, hadir, sakit, izin, alpha, catatan } = req.body;
  
  JurnalGuru.update(id, {
    guru_id: parseInt(guru_id),
    tanggal,
    jam_ke: parseInt(jam_ke),
    kelas_id: parseInt(kelas_id),
    mapel_id: parseInt(mapel_id),
    materi,
    metode_pembelajaran,
    jumlah_siswa: Math.max(0, parseInt(jumlah_siswa) || 0), // Validasi jumlah_siswa tidak boleh negatif
    hadir: parseInt(hadir) || 0,
    sakit: parseInt(sakit) || 0,
    izin: parseInt(izin) || 0,
    alpha: parseInt(alpha) || 0,
    catatan
  }, (err) => {
    if (err) {
      console.error(err);
      res.status(500).send('Terjadi kesalahan saat memperbarui data');
    } else {
      res.redirect('/jurnal');
    }
  });
});

// Hapus jurnal guru
router.get('/hapus/:id', (req, res) => {
  const id = req.params.id;
  
  JurnalGuru.delete(id, (err) => {
    if (err) {
      console.error(err);
      req.flash('error', 'Gagal menghapus jurnal guru');
      res.redirect('/jurnal');
    } else {
      req.flash('success', 'Jurnal guru berhasil dihapus');
      res.redirect('/jurnal');
    }
  });
});

module.exports = router;