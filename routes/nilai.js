const express = require('express');
const router = express.Router();
const Nilai = require('../models/Nilai');
const Siswa = require('../models/Siswa');
const MataPelajaran = require('../models/MataPelajaran');
const Guru = require('../models/Guru');
const Kelas = require('../models/Kelas');

// GET /nilai - Halaman daftar nilai
router.get('/', async (req, res) => {
  try {
    console.log('Accessing /nilai route');
    
    const filters = {};
    
    // Filter berdasarkan query parameters
    if (req.query.kelas_id) filters.kelas_id = req.query.kelas_id;
    if (req.query.mapel_id) filters.mapel_id = req.query.mapel_id;
    if (req.query.jenis_nilai) filters.jenis_nilai = req.query.jenis_nilai;
    
    // Jika siswa, filter berdasarkan siswa_id (hanya nilai siswa yang login)
    if (res.locals.user.role === 'siswa') {
      filters.siswa_id = res.locals.user.siswa_id;
      console.log('Filtering by siswa_id:', filters.siswa_id);
    }
    
    // Jika guru, filter berdasarkan guru_id
    if (res.locals.user.role === 'guru') {
      filters.guru_id = res.locals.user.id;
      console.log('Filtering by guru_id:', filters.guru_id);
    }
    
    console.log('Filters applied:', JSON.stringify(filters));
    
    // Ambil data untuk dropdown filter
    const [kelasList, mapelList] = await Promise.all([
      new Promise((resolve, reject) => {
        Kelas.getAll((err, list) => {
          if (err) reject(err);
          else resolve(list);
        });
      }),
      new Promise((resolve, reject) => {
        MataPelajaran.getAll((err, list) => {
          if (err) reject(err);
          else resolve(list);
        });
      })
    ]);
    
    // Ambil data nilai dengan error handling khusus untuk tabel tidak ada
    const nilaiList = await new Promise((resolve, reject) => {
      Nilai.getAll(filters, (err, list) => {
        if (err) {
          // Jika error karena tabel tidak ada
          if (err.message && err.message.includes('no such table')) {
            console.error('⚠️  Tabel nilai belum ada. Jalankan: node init_nilai_table.js');
            // Return empty array agar halaman tetap bisa ditampilkan
            resolve([]);
          } else {
            reject(err);
          }
        } else {
          resolve(list);
        }
      });
    });
    
    console.log('Nilai list loaded:', nilaiList ? nilaiList.length : 0, 'records');
    
    res.render('nilai/index', {
      title: 'Input Nilai - Sistem Informasi Akademik',
      user: res.locals.user,
      heading: res.locals.user.role === 'siswa' ? 'Nilai Saya' : 'Input Nilai Siswa',
      nilaiList,
      kelasList,
      mapelList,
      filters,
      success: req.flash('success'),
      error: req.flash('error'),
      showBackButton: true
    });
  } catch (error) {
    console.error('Error fetching nilai:', error);
    req.flash('error', 'Terjadi kesalahan saat memuat data nilai');
    res.redirect('/');
  }
});

// GET /nilai/create - Form tambah nilai
router.get('/create', async (req, res) => {
  try {
    console.log('Accessing /nilai/create route');
    
    // Siswa tidak bisa membuat nilai
    if (res.locals.user.role === 'siswa') {
      req.flash('error', 'Siswa tidak dapat menambahkan nilai');
      return res.redirect('/nilai');
    }
    
    // Ambil data untuk dropdown
    const [siswaList, mapelList, guruList, kelasList] = await Promise.all([
      new Promise((resolve, reject) => {
        Siswa.getAll('', '', (err, list) => {
          if (err) reject(err);
          else resolve(list || []);
        });
      }),
      new Promise((resolve, reject) => {
        MataPelajaran.getAll((err, list) => {
          if (err) reject(err);
          else resolve(list || []);
        });
      }),
      new Promise((resolve, reject) => {
        Guru.getAll((err, list) => {
          if (err) reject(err);
          else resolve(list || []);
        });
      }),
      new Promise((resolve, reject) => {
        Kelas.getAll((err, list) => {
          if (err) reject(err);
          else resolve(list || []);
        });
      })
    ]);
    
    console.log('All data loaded successfully, rendering view');
    
    res.render('nilai/create', {
      title: 'Tambah Nilai - Sistem Informasi Akademik',
      user: res.locals.user,
      heading: 'Tambah Nilai Baru',
      siswaList,
      mapelList,
      guruList,
      kelasList,
      errors: req.flash('errors'),
      showBackButton: true
    });
    
    console.log('View rendered successfully');
  } catch (error) {
    console.error('Error loading form:', error);
    req.flash('error', 'Terjadi kesalahan saat memuat form: ' + error.message);
    res.redirect('/nilai');
  }
});

// POST /nilai - Simpan nilai baru (multiple students)
router.post('/', async (req, res) => {
  try {
    const { 
      mapel_id, guru_id, kelas_id,
      jenis_nilai, kategori, keterangan,
      tanggal_penilaian,
      siswa_ids
    } = req.body;
    
    console.log('POST /nilai - Saving multiple values');
    console.log('Data received:', {
      mapel_id, guru_id, kelas_id, jenis_nilai, kategori, tanggal_penilaian,
      siswa_ids
    });
    
    // Validasi input dasar
    const errors = [];
    
    if (!mapel_id || !guru_id || !kelas_id) {
      errors.push('Mata Pelajaran, Guru, dan Kelas wajib dipilih');
    }
    
    if (!jenis_nilai || !['formatif', 'sumatif'].includes(jenis_nilai)) {
      errors.push('Jenis nilai harus formatif atau sumatif');
    }
    
    if (!kategori) {
      errors.push('Kategori nilai wajib diisi');
    }
    
    if (!tanggal_penilaian) {
      errors.push('Tanggal penilaian wajib diisi');
    }
    
    if (!siswa_ids || !Array.isArray(siswa_ids) || siswa_ids.length === 0) {
      errors.push('Tidak ada siswa yang dipilih');
    }
    
    if (errors.length > 0) {
      req.flash('errors', errors);
      return res.redirect('/nilai/create');
    }
    
    // Proses setiap siswa
    let successCount = 0;
    let failCount = 0;
    const failedStudents = [];
    
    for (const siswaId of siswa_ids) {
      const nilaiKey = `nilai_siswa_${siswaId}`;
      const nilai = req.body[nilaiKey];
      
      // Skip jika nilai kosong
      if (!nilai || nilai === '') {
        failCount++;
        failedStudents.push(`Siswa ID ${siswaId}: Nilai kosong`);
        continue;
      }
      
      // Validasi nilai
      if (isNaN(nilai) || parseFloat(nilai) < 0 || parseFloat(nilai) > 100) {
        failCount++;
        failedStudents.push(`Siswa ID ${siswaId}: Nilai tidak valid (${nilai})`);
        continue;
      }
      
      // Simpan ke database
      try {
        await new Promise((resolve, reject) => {
          Nilai.create({
            siswa_id: parseInt(siswaId),
            mapel_id: parseInt(mapel_id),
            guru_id: parseInt(guru_id),
            kelas_id: parseInt(kelas_id),
            jenis_nilai,
            kategori,
            nilai: parseFloat(nilai),
            keterangan: keterangan || null,
            tanggal_penilaian
          }, (err, result) => {
            if (err) reject(err);
            else resolve(result);
          });
        });
        successCount++;
      } catch (error) {
        console.error(`Error saving nilai for siswa ${siswaId}:`, error);
        failCount++;
        failedStudents.push(`Siswa ID ${siswaId}: ${error.message}`);
      }
    }
    
    // Feedback ke user
    if (successCount > 0) {
      let message = `Berhasil menyimpan ${successCount} nilai`;
      if (failCount > 0) {
        message += `. ${failCount} nilai gagal disimpan.`;
        if (failedStudents.length > 0) {
          message += ` Detail: ${failedStudents.join(', ')}`;
        }
      }
      req.flash('success', message);
    } else {
      req.flash('error', 'Gagal menyimpan semua nilai. Periksa kembali data yang diinput.');
    }
    
    res.redirect('/nilai');
  } catch (error) {
    console.error('Error creating nilai:', error);
    req.flash('error', 'Terjadi kesalahan saat menyimpan nilai: ' + error.message);
    res.redirect('/nilai/create');
  }
});

// GET /nilai/:id/edit - Form edit nilai
router.get('/:id/edit', async (req, res) => {
  try {
    console.log('📝 Accessing /nilai/:id/edit route for ID:', req.params.id);
    const id = req.params.id;
    
    // Ambil data nilai
    console.log('🔍 Fetching nilai data...');
    const nilai = await new Promise((resolve, reject) => {
      Nilai.getById(id, (err, data) => {
        if (err) {
          console.error('❌ Error getting nilai:', err);
          reject(err);
        } else {
          console.log('✅ Nilai data fetched:', data ? 'Found' : 'Not found');
          resolve(data);
        }
      });
    });
    
    if (!nilai) {
      console.log('⚠️  Nilai not found, redirecting to /nilai');
      req.flash('error', 'Data nilai tidak ditemukan');
      return res.redirect('/nilai');
    }
    
    // Cek otorisasi untuk guru
    if (res.locals.user && res.locals.user.role === 'guru' && nilai.guru_id !== res.locals.user.id) {
      console.log('🚫 Guru authorization failed');
      req.flash('error', 'Anda tidak memiliki izin untuk mengedit nilai ini');
      return res.redirect('/nilai');
    }
    
    // Ambil data untuk dropdown
    console.log('📊 Fetching dropdown data (siswa, mapel, guru, kelas)...');
    const [siswaList, mapelList, guruList, kelasList] = await Promise.all([
      new Promise((resolve, reject) => {
        Siswa.getAll('', '', (err, list) => {
          if (err) {
            console.error('❌ Error getting siswa:', err);
            reject(err);
          } else {
            console.log('✅ Siswa loaded:', list ? list.length : 0, 'records');
            resolve(list || []);
          }
        });
      }),
      new Promise((resolve, reject) => {
        MataPelajaran.getAll((err, list) => {
          if (err) {
            console.error('❌ Error getting mapel:', err);
            reject(err);
          } else {
            console.log('✅ Mapel loaded:', list ? list.length : 0, 'records');
            resolve(list || []);
          }
        });
      }),
      new Promise((resolve, reject) => {
        Guru.getAll((err, list) => {
          if (err) {
            console.error('❌ Error getting guru:', err);
            reject(err);
          } else {
            console.log('✅ Guru loaded:', list ? list.length : 0, 'records');
            resolve(list || []);
          }
        });
      }),
      new Promise((resolve, reject) => {
        Kelas.getAll((err, list) => {
          if (err) {
            console.error('❌ Error getting kelas:', err);
            reject(err);
          } else {
            console.log('✅ Kelas loaded:', list ? list.length : 0, 'records');
            resolve(list || []);
          }
        });
      })
    ]);
    
    console.log('🎨 All data loaded successfully, rendering view...');
    res.render('nilai/edit', {
      title: 'Edit Nilai - Sistem Informasi Akademik',
      user: res.locals.user || {},
      heading: 'Edit Nilai',
      nilai,
      siswaList,
      mapelList,
      guruList,
      kelasList,
      errors: req.flash('errors'),
      showBackButton: true
    });
    console.log('✅ View rendered successfully');
  } catch (error) {
    console.error('❌ Error loading edit form:', error);
    req.flash('error', 'Terjadi kesalahan saat memuat form: ' + error.message);
    res.redirect('/nilai');
  }
});

// PUT /nilai/:id - Update nilai
router.put('/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const { 
      siswa_id, mapel_id, guru_id, kelas_id,
      jenis_nilai, kategori, nilai, keterangan,
      tanggal_penilaian
    } = req.body;
    
    // Cek apakah data ada
    const existingNilai = await new Promise((resolve, reject) => {
      Nilai.getById(id, (err, data) => {
        if (err) reject(err);
        else resolve(data);
      });
    });
    
    if (!existingNilai) {
      req.flash('error', 'Data nilai tidak ditemukan');
      return res.redirect('/nilai');
    }
    
    // Validasi input
    const errors = [];
    
    if (!siswa_id || !mapel_id || !guru_id || !kelas_id) {
      errors.push('Semua field wajib diisi');
    }
    
    if (!jenis_nilai || !['formatif', 'sumatif'].includes(jenis_nilai)) {
      errors.push('Jenis nilai harus formatif atau sumatif');
    }
    
    if (!kategori) {
      errors.push('Kategori nilai wajib diisi');
    }
    
    if (!nilai || isNaN(nilai) || nilai < 0 || nilai > 100) {
      errors.push('Nilai harus berupa angka antara 0-100');
    }
    
    if (!tanggal_penilaian) {
      errors.push('Tanggal penilaian wajib diisi');
    }
    
    if (errors.length > 0) {
      req.flash('errors', errors);
      return res.redirect(`/nilai/${id}/edit`);
    }
    
    // Update database
    await new Promise((resolve, reject) => {
      Nilai.update(id, {
        siswa_id: parseInt(siswa_id),
        mapel_id: parseInt(mapel_id),
        guru_id: parseInt(guru_id),
        kelas_id: parseInt(kelas_id),
        jenis_nilai,
        kategori,
        nilai: parseFloat(nilai),
        keterangan: keterangan || null,
        tanggal_penilaian
      }, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    
    req.flash('success', 'Nilai berhasil diupdate');
    res.redirect('/nilai');
  } catch (error) {
    console.error('Error updating nilai:', error);
    req.flash('error', 'Terjadi kesalahan saat mengupdate nilai');
    res.redirect('/nilai');
  }
});

// DELETE /nilai/:id - Hapus nilai
router.delete('/:id', async (req, res) => {
  try {
    const id = req.params.id;
    
    // Cek apakah data ada
    const existingNilai = await new Promise((resolve, reject) => {
      Nilai.getById(id, (err, data) => {
        if (err) reject(err);
        else resolve(data);
      });
    });
    
    if (!existingNilai) {
      req.flash('error', 'Data nilai tidak ditemukan');
      return res.redirect('/nilai');
    }
    
    // Hapus dari database
    await new Promise((resolve, reject) => {
      Nilai.delete(id, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    
    req.flash('success', 'Nilai berhasil dihapus');
    res.redirect('/nilai');
  } catch (error) {
    console.error('Error deleting nilai:', error);
    req.flash('error', 'Terjadi kesalahan saat menghapus nilai');
    res.redirect('/nilai');
  }
});

module.exports = router;
