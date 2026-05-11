const express = require('express');
const router = express.Router();
const Absensi = require('../models/Absensi');
const Siswa = require('../models/Siswa');
const Kelas = require('../models/Kelas');
const MataPelajaran = require('../models/MataPelajaran');
const Guru = require('../models/Guru');
const db = require('../config/dbConfig');

// Helper function untuk query database dengan Promise
const queryDB = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

const runDB = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) reject(err);
      else resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
};

// GET /absensi - Daftar absensi
router.get('/', async (req, res) => {
  try {
    console.log(' Accessing /absensi route');
    
    const { tanggal, kelas_id, guru_id, mapel_id, status } = req.query;
    
    console.log('    Query parameters:', { tanggal, kelas_id, guru_id, mapel_id, status });
    console.log('    🔍 Checking date filter:', tanggal || 'NO DATE FILTER');
    
    // Query absensi dengan join ke siswa, kelas, mata_pelajaran, dan guru
    let sql = `
      SELECT a.*, s.nama_siswa, s.nis, k.nama_kelas, 
             mp.nama_mapel, g.nama_guru
      FROM absensi a
      LEFT JOIN siswa s ON a.siswa_id = s.id
      LEFT JOIN kelas k ON a.kelas_id = k.id
      LEFT JOIN mata_pelajaran mp ON a.mapel_id = mp.id
      LEFT JOIN guru g ON a.guru_id = g.id
      WHERE 1=1
    `;
    const params = [];
    
    if (tanggal) {
      sql += ' AND a.tanggal = ?';
      params.push(tanggal);
      console.log('     Filtering by date:', tanggal);
    }
    
    if (kelas_id) {
      sql += ' AND a.kelas_id = ?';
      params.push(kelas_id);
    }
    
    if (guru_id) {
      sql += ' AND a.guru_id = ?';
      params.push(guru_id);
    }
    
    if (mapel_id) {
      sql += ' AND a.mapel_id = ?';
      params.push(mapel_id);
    }
    
    // Filter by status (normalize old values to 'tidak_hadir')
    if (status) {
      const normalizedStatus = (status === 'alpa' || status === 'alpha') ? 'tidak_hadir' : status;
      sql += ' AND a.status_kehadiran = ?';
      params.push(normalizedStatus);
    }
    
    sql += ' ORDER BY a.tanggal DESC, k.nama_kelas ASC, s.nama_siswa ASC';
    
    console.log('   🔍 SQL Query:', sql);
    console.log('   📝 Parameters:', params);
    
    let absensiList = [];
    try {
      absensiList = await queryDB(sql, params);
      console.log(`✅ Absensi loaded: ${absensiList.length} records`);
      console.log('   Filters:', { tanggal, kelas_id, guru_id, mapel_id, status });
      
      // CRITICAL FIX: Normalize all old status values to 'tidak_hadir' in the result
      let normalizationCount = 0;
      absensiList.forEach(record => {
        if (record.status_kehadiran === 'alpa' || record.status_kehadiran === 'alpha') {
          record.status_kehadiran = 'tidak_hadir';
          normalizationCount++;
        }
      });
      
      if (normalizationCount > 0) {
        console.log(`   🔧 Normalized ${normalizationCount} record(s) from "alpha/alpa" to "tidak_hadir"`);
      }
      
      // Debug: Show status breakdown
      if (absensiList.length > 0) {
        const statusBreakdown = {
          hadir: absensiList.filter(a => a.status_kehadiran === 'hadir').length,
          sakit: absensiList.filter(a => a.status_kehadiran === 'sakit').length,
          izin: absensiList.filter(a => a.status_kehadiran === 'izin').length,
          tidak_hadir: absensiList.filter(a => a.status_kehadiran === 'tidak_hadir').length
        };
        console.log('   📊 Status breakdown:', statusBreakdown);
        
        if (statusBreakdown.tidak_hadir > 0) {
          console.log(`   ✅ Found ${statusBreakdown.tidak_hadir} "tidak_hadir" record(s)!`);
        } else {
          console.log('   ℹ️  No "tidak_hadir" records in query result');
          console.log('   This means either:');
          console.log('     - No students were marked as alpha');
          console.log('     - Data was saved with wrong date');
          console.log('     - Data was not saved to database');
        }
        
        console.log('   Sample records:');
        absensiList.slice(0, 3).forEach((a, i) => {
          console.log(`      ${i+1}. ${a.nama_siswa} - ${a.nama_mapel} - Status: ${a.status_kehadiran}`);
        });
      } else {
        console.log('   ⚠️  No records found for the selected filters');
        if (tanggal) {
          console.log(`   Date filter: ${tanggal}`);
        }
        if (kelas_id) {
          console.log(`   Class filter: ${kelas_id}`);
        }
      }
    } catch (dbError) {
      console.error('❌ Database error:', dbError.message);
      if (dbError.message.includes('no such table')) {
        req.flash('error', 'Tabel absensi belum dibuat. Hubungi administrator.');
        return res.redirect('/');
      }
      throw dbError;
    }
    
    // Ambil data kelas untuk filter
    const kelasList = await new Promise((resolve, reject) => {
      Kelas.getAll((err, list) => {
        if (err) reject(err);
        else resolve(list || []);
      });
    });
    
    // Ambil data guru untuk filter
    const guruList = await new Promise((resolve, reject) => {
      Guru.getAll((err, list) => {
        if (err) reject(err);
        else resolve(list || []);
      });
    });
    
    // Ambil data mapel untuk filter
    const mapelList = await new Promise((resolve, reject) => {
      MataPelajaran.getAll((err, list) => {
        if (err) reject(err);
        else resolve(list || []);
      });
    });
    
    res.render('absensi/index', {
      title: 'Absensi Siswa - Sistem Informasi Akademik',
      heading: 'Absensi Siswa',
      absensiList,
      kelasList,
      guruList,
      mapelList,
      selectedTanggal: tanggal || new Date().toISOString().split('T')[0],
      selectedKelas: kelas_id || '',
      selectedGuru: guru_id || '',
      selectedMapel: mapel_id || '',
      selectedStatus: status || '',
      success: req.flash('success'),
      error: req.flash('error'),
      showBackButton: false
    });
  } catch (error) {
    console.error('❌ Error loading absensi:', error);
    console.error('   Stack:', error.stack);
    req.flash('error', `Terjadi kesalahan saat memuat data absensi: ${error.message}`);
    res.redirect('/');
  }
});

// GET /absensi/input - Form input absensi
router.get('/input', async (req, res) => {
  try {
    console.log('📝 Accessing /absensi/input route');
    console.log('   Query params:', req.query);
    
    const { tanggal, kelas_id } = req.query;
    
    if (!kelas_id) {
      console.log('   No kelas_id, showing select-class form');
      // Jika belum pilih kelas, tampilkan form pilihan
      const kelasList = await new Promise((resolve, reject) => {
        Kelas.getAll((err, list) => {
          if (err) reject(err);
          else resolve(list || []);
        });
      });
      
      return res.render('absensi/select-class', {
        title: 'Pilih Kelas - Absensi',
        heading: 'Input Absensi Siswa',
        kelasList,
        selectedTanggal: tanggal || new Date().toISOString().split('T')[0],
        showBackButton: true
      });
    }
    
    console.log('   Loading class and student data...');
    
    // Ambil data kelas dan siswa
    const kelas = await new Promise((resolve, reject) => {
      Kelas.getById(kelas_id, (err, data) => {
        if (err) reject(err);
        else resolve(data);
      });
    });
    
    console.log('   Kelas loaded:', kelas?.nama_kelas);
    
    const siswaList = await new Promise((resolve, reject) => {
      Siswa.getAllByKelas(kelas_id, (err, list) => {
        if (err) reject(err);
        else resolve(list || []);
      });
    });
    
    console.log('   Siswa loaded:', siswaList.length);
    
    // Ambil data mapel untuk dropdown
    console.log('   Loading mapel data...');
    const mapelList = await new Promise((resolve, reject) => {
      MataPelajaran.getAll((err, list) => {
        if (err) reject(err);
        else resolve(list || []);
      });
    });
    
    console.log('   Mapel loaded:', mapelList.length);
    
    // Ambil data guru untuk dropdown
    console.log('   Loading guru data...');
    const guruList = await new Promise((resolve, reject) => {
      Guru.getAll((err, list) => {
        if (err) reject(err);
        else resolve(list || []);
      });
    });
    
    console.log('   Guru loaded:', guruList.length);
    
    // Ambil absensi yang sudah ada untuk tanggal tersebut
    console.log('   Loading existing absensi...');
    const existingAbsensi = await queryDB(
      'SELECT * FROM absensi WHERE kelas_id = ? AND tanggal = ?',
      [kelas_id, tanggal || new Date().toISOString().split('T')[0]]
    );
    
    // Map existing absensi by siswa_id
    const absensiMap = {};
    existingAbsensi.forEach(a => {
      absensiMap[a.siswa_id] = a;
    });
    
    console.log(`✅ All data loaded successfully`);
    console.log(`   Kelas: ${kelas?.nama_kelas}, Siswa: ${siswaList.length}, Mapel: ${mapelList.length}, Guru: ${guruList.length}, Existing: ${existingAbsensi.length}`);
    
    console.log('   Rendering view...');
    res.render('absensi/input', {
      title: 'Input Absensi - Sistem Informasi Akademik',
      heading: `Input Absensi - ${kelas?.nama_kelas}`,
      kelas,
      siswaList,
      mapelList,
      guruList,
      absensiMap,
      tanggal: tanggal || new Date().toISOString().split('T')[0],
      success: req.flash('success'),
      error: req.flash('error'),
      showBackButton: true
    });
    console.log('   ✅ View rendered successfully');
  } catch (error) {
    console.error('❌ Error loading input form:', error);
    console.error('   Error message:', error.message);
    console.error('   Error stack:', error.stack);
    req.flash('error', `Terjadi kesalahan saat memuat form: ${error.message}`);
    res.redirect('/absensi');
  }
});

// POST /absensi - Simpan absensi
router.post('/', async (req, res) => {
  try {
    console.log(' POST /absensi - Saving attendance');
    console.log('   Request body:', {
      tanggal: req.body.tanggal,
      kelas_id: req.body.kelas_id,
      mapel_id: req.body.mapel_id,
      guru_id: req.body.guru_id,
      absensi_data_type: typeof req.body.absensi_data
    });
    
    const { tanggal, kelas_id, mapel_id, guru_id, absensi_data } = req.body;

    if (!tanggal || !kelas_id || !mapel_id || !guru_id || !absensi_data) {
      console.error('   ❌ Validation failed: Missing required fields');
      req.flash('error', 'Data tidak lengkap. Pastikan memilih mapel dan guru.');
      return res.redirect(`/absensi/input?tanggal=${tanggal}&kelas_id=${kelas_id}`);
    }

    const absensiArray = typeof absensi_data === 'string' ? JSON.parse(absensi_data) : absensi_data;
    console.log(`\n📥 Parsed ${absensiArray.length} attendance records`);
    console.log('   Raw data sample (first 5):');
    absensiArray.slice(0, 5).forEach((item, i) => {
      console.log(`     ${i+1}. siswa_id: ${item.siswa_id}, status: ${item.status_kehadiran}`);
    });
    
    // CRITICAL FIX: Normalize old status values to new standard
    let normalizationCount = 0;
    absensiArray.forEach(item => {
      // Convert old 'alpha' or 'alpa' to 'tidak_hadir'
      if (item.status_kehadiran === 'alpha' || item.status_kehadiran === 'alpa') {
        console.log(`   🔄 Converting "${item.status_kehadiran}" to "tidak_hadir" for siswa ${item.siswa_id}`);
        item.status_kehadiran = 'tidak_hadir';
        normalizationCount++;
      }
    });
    
    if (normalizationCount > 0) {
      console.log(`   ✅ Normalized ${normalizationCount} record(s) to "tidak_hadir"`);
    }

    // Log semua status yang akan disimpan
    const statusCounts = {
      hadir: absensiArray.filter(a => a.status_kehadiran === 'hadir').length,
      sakit: absensiArray.filter(a => a.status_kehadiran === 'sakit').length,
      izin: absensiArray.filter(a => a.status_kehadiran === 'izin').length,
      tidak_hadir: absensiArray.filter(a => a.status_kehadiran === 'tidak_hadir').length
    };
    
    console.log('\n📊 Status Breakdown (from received data):');
    console.log(`   ✅ Hadir:         ${statusCounts.hadir}`);
    console.log(`   🤒 Sakit:         ${statusCounts.sakit}`);
    console.log(`   📧 Izin:          ${statusCounts.izin}`);
    console.log(`   ❌ Tidak Hadir:   ${statusCounts.tidak_hadir}`);
    console.log(`   📌 Total:         ${absensiArray.length}\n`);

    // Log sample data
    if (absensiArray.length > 0) {
      console.log('   📋 Sample record:', absensiArray[0]);
      
      // Tampilkan semua record yang tidak_hadir
      const tidakHadirRecords = absensiArray.filter(a => a.status_kehadiran === 'tidak_hadir');
      if (tidakHadirRecords.length > 0) {
        console.log(`\n   ❌ Tidak Hadir records: ${tidakHadirRecords.length}`);
        tidakHadirRecords.forEach(r => console.log(`      - siswa_id: ${r.siswa_id}, status: ${r.status_kehadiran}`));
        console.log('');
      } else {
        console.log('   ℹ️  No "tidak_hadir" records in submitted data\n');
      }
    }
    
    let successCount = 0;
    let failCount = 0;
    let tidakHadirSaved = 0;
    let tidakHadirFailed = 0;
    
    for (const item of absensiArray) {
      const { siswa_id, status_kehadiran, keterangan } = item;
      
      // Log tidak_hadir processing
      if (status_kehadiran === 'tidak_hadir') {
        console.log(`   ❌ Processing TIDAK HADIR for siswa ${siswa_id}: status=${status_kehadiran}`);
      }
      
      try {
        // Cek apakah sudah ada absensi untuk siswa ini di tanggal yang sama UNTUK MAPEL DAN GURU YANG SAMA
        const existing = await queryDB(
          'SELECT id FROM absensi WHERE siswa_id = ? AND tanggal = ? AND mapel_id = ? AND guru_id = ?',
          [siswa_id, tanggal, mapel_id, guru_id]
        );
        
        if (existing.length > 0) {
          // Update existing (untuk mapel dan guru yang sama)
          console.log(`   ✏️  Updating existing record for siswa ${siswa_id} (mapel: ${mapel_id}, guru: ${guru_id})`);
          await runDB(
            'UPDATE absensi SET status_kehadiran = ?, keterangan = ?, updated_at = CURRENT_TIMESTAMP WHERE siswa_id = ? AND tanggal = ? AND mapel_id = ? AND guru_id = ?',
            [status_kehadiran, keterangan || null, siswa_id, tanggal, mapel_id, guru_id]
          );
          
          if (status_kehadiran === 'tidak_hadir') {
            tidakHadirSaved++;
            console.log(`   ✅ Tidak Hadir record updated for siswa ${siswa_id}`);
          }
        } else {
          // Insert new (untuk kombinasi mapel dan guru yang baru)
          console.log(`   ➕ Inserting new record for siswa ${siswa_id} (mapel: ${mapel_id}, guru: ${guru_id})`);
          await runDB(
            'INSERT INTO absensi (siswa_id, kelas_id, tanggal, mapel_id, guru_id, status_kehadiran, keterangan) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [siswa_id, kelas_id, tanggal, mapel_id, guru_id, status_kehadiran, keterangan || null]
          );
          
          if (status_kehadiran === 'tidak_hadir') {
            tidakHadirSaved++;
            console.log(`   ✅ Tidak Hadir record inserted for siswa ${siswa_id}`);
          }
        }
        successCount++;
      } catch (error) {
        console.error(`   ❌ Error saving absensi for siswa ${siswa_id}:`, error.message);
        failCount++;
        
        if (status_kehadiran === 'tidak_hadir') {
          tidakHadirFailed++;
          console.error(`   ❌ Tidak Hadir record FAILED for siswa ${siswa_id}`);
        }
      }
    }
    
    console.log(`\n✅ Save complete:`);
    console.log(`   ✅ Success: ${successCount} records`);
    console.log(`   ❌ Failed: ${failCount} records`);
    
    if (tidakHadirSaved > 0 || tidakHadirFailed > 0) {
      console.log(`\n   ❌ TIDAK HADIR SUMMARY:`);
      console.log(`      ✅ Saved: ${tidakHadirSaved}`);
      console.log(`      ❌ Failed: ${tidakHadirFailed}`);
    }
    
    if (successCount > 0) {
      req.flash('success', `Berhasil menyimpan absensi untuk ${successCount} siswa`);
    } else {
      req.flash('error', 'Gagal menyimpan absensi');
    }
    
    console.log('\n✅ Redirecting to absensi page...\n');
    res.redirect(`/absensi?tanggal=${tanggal}&kelas_id=${kelas_id}`);
  } catch (error) {
    console.error('❌ Error saving absensi:', error);
    req.flash('error', `Terjadi kesalahan: ${error.message}`);
    res.redirect('/absensi');
  }
});

// GET /absensi/rekap - Rekap absensi per kelas per bulan
router.get('/rekap', async (req, res) => {
  try {
    console.log('📊 Accessing /absensi/rekap route');
    
    const { kelas_id, bulan, tahun } = req.query;
    
    // Ambil data kelas untuk filter
    const kelasList = await new Promise((resolve, reject) => {
      Kelas.getAll((err, list) => {
        if (err) reject(err);
        else resolve(list || []);
      });
    });
    
    if (!kelas_id || !bulan || !tahun) {
      return res.render('absensi/rekap', {
        title: 'Rekap Bulanan Absensi - Sistem Informasi Akademik',
        heading: 'Rekap Bulanan Absensi Siswa',
        rekapData: [],
        summary: null,
        kelasList,
        selectedKelas: '',
        selectedBulan: bulan || new Date().getMonth() + 1,
        selectedTahun: tahun || new Date().getFullYear(),
        showBackButton: true
      });
    }
    
    console.log(`   Loading monthly recap for: ${bulan}/${tahun}, class: ${kelas_id}`);
    
    // Get class info
    const kelas = await new Promise((resolve, reject) => {
      Kelas.getById(kelas_id, (err, data) => {
        if (err) reject(err);
        else resolve(data);
      });
    });
    
    // Get all unique siswa in this class
    const siswaList = await queryDB(
      'SELECT id, nis, nama_siswa FROM siswa WHERE kelas_id = ? ORDER BY nama_siswa',
      [kelas_id]
    );
    
    console.log(`   Found ${siswaList.length} students in class ${kelas_id}`);
    
    // Get rekap for each student
    const rekapData = [];
    let totalHadir = 0, totalSakit = 0, totalIzin = 0, totalAlpha = 0, totalRecords = 0;
    
    for (const siswa of siswaList) {
      // Get all attendance records for this student in the month
      const records = await queryDB(`
        SELECT 
          a.status_kehadiran,
          mp.nama_mapel,
          g.nama_guru,
          a.tanggal
        FROM absensi a
        LEFT JOIN mata_pelajaran mp ON a.mapel_id = mp.id
        LEFT JOIN guru g ON a.guru_id = g.id
        WHERE a.siswa_id = ? 
          AND strftime('%m', a.tanggal) = ?
          AND strftime('%Y', a.tanggal) = ?
        ORDER BY a.tanggal, mp.nama_mapel
      `, [siswa.id, bulan.padStart(2, '0'), tahun]);
      
      // Normalize status: convert 'alpa' to 'alpha' for consistency
      const normalizedRecords = records.map(r => {
        let status = r.status_kehadiran;
        if (status === 'alpa' || status === 'tidak_hadir') {
          status = 'alpha';
        }
        return {
          ...r,
          status_kehadiran: status
        };
      });
      
      // Count by status
      const hadir = normalizedRecords.filter(r => r.status_kehadiran === 'hadir').length;
      const sakit = normalizedRecords.filter(r => r.status_kehadiran === 'sakit').length;
      const izin = normalizedRecords.filter(r => r.status_kehadiran === 'izin').length;
      const alpha = normalizedRecords.filter(r => r.status_kehadiran === 'alpha').length;
      const total = hadir + sakit + izin + alpha;
      const persentaseHadir = total > 0 ? ((hadir / total) * 100).toFixed(1) : 0;
      
      // Update totals
      totalHadir += hadir;
      totalSakit += sakit;
      totalIzin += izin;
      totalAlpha += alpha;
      totalRecords += total;
      
      rekapData.push({
        siswa_id: siswa.id,
        nis: siswa.nis,
        nama_siswa: siswa.nama_siswa,
        hadir,
        sakit,
        izin,
        alpha,
        total,
        persentaseHadir,
        records // Store detailed records for drill-down
      });
    }
    
    // Sort by persentase kehadiran (descending)
    rekapData.sort((a, b) => b.persentaseHadir - a.persentaseHadir);
    
    // Add ranking
    rekapData.forEach((item, index) => {
      item.ranking = index + 1;
    });
    
    console.log(`   Generated rekap for ${rekapData.length} students`);
    
    // Calculate summary statistics
    const summary = {
      totalSiswa: siswaList.length,
      totalRecords,
      totalHadir,
      totalSakit,
      totalIzin,
      totalAlpha,
      rataRataHadir: totalRecords > 0 ? ((totalHadir / totalRecords) * 100).toFixed(1) : 0,
      siswaTerbaik: rekapData.length > 0 ? rekapData[0] : null,
      siswaTerendah: rekapData.length > 0 ? rekapData[rekapData.length - 1] : null
    };
    
    console.log(`   Summary: ${JSON.stringify(summary)}`);
    
    res.render('absensi/rekap', {
      title: `Rekap Bulanan - ${kelas?.nama_kelas}`,
      heading: `Rekap Bulanan Absensi`,
      rekapData,
      summary,
      kelas,
      kelasList,
      selectedKelas: kelas_id,
      selectedBulan: bulan,
      selectedTahun: tahun,
      showBackButton: true
    });
  } catch (error) {
    console.error('❌ Error loading rekap:', error);
    req.flash('error', `Terjadi kesalahan saat memuat rekap: ${error.message}`);
    res.redirect('/absensi');
  }
});

// GET /absensi/rekap/export - Export rekap bulanan ke Excel
router.get('/rekap/export', async (req, res) => {
  try {
    console.log('📥 Exporting monthly recap to Excel');
    
    const { kelas_id, bulan, tahun } = req.query;
    
    if (!kelas_id || !bulan || !tahun) {
      req.flash('error', 'Pilih kelas, bulan, dan tahun terlebih dahulu');
      return res.redirect('/absensi/rekap');
    }
    
    const XLSX = require('xlsx');
    
    // Get class info
    const kelas = await new Promise((resolve, reject) => {
      Kelas.getById(kelas_id, (err, data) => {
        if (err) reject(err);
        else resolve(data);
      });
    });
    
    // Get all students in this class
    const siswaList = await queryDB(
      'SELECT id, nis, nama_siswa FROM siswa WHERE kelas_id = ? ORDER BY nama_siswa',
      [kelas_id]
    );
    
    // Prepare data for Excel
    const excelData = [];
    
    // Header
    excelData.push(['REKAP ABSENSI BULANAN']);
    excelData.push([`Kelas: ${kelas.nama_kelas}`]);
    excelData.push([`Periode: ${new Date(tahun, bulan-1, 1).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}`]);
    excelData.push([]); // Empty row
    
    // Table header
    excelData.push(['No', 'NIS', 'Nama Siswa', 'Hadir', 'Sakit', 'Izin', 'Alpha', 'Total', '% Kehadiran', 'Ranking']);
    
    let totalHadir = 0, totalSakit = 0, totalIzin = 0, totalAlpha = 0, totalRecords = 0;
    
    // Student data
    siswaList.forEach((siswa, index) => {
      // Get attendance records
      queryDB(`
        SELECT status_kehadiran
        FROM absensi
        WHERE siswa_id = ? 
          AND strftime('%m', tanggal) = ?
          AND strftime('%Y', tanggal) = ?
      `, [siswa.id, bulan.padStart(2, '0'), tahun]).then(records => {
        // Normalize status: convert 'alpa' to 'alpha' for consistency
        const normalizedRecords = records.map(r => ({
          status_kehadiran: r.status_kehadiran === 'alpa' ? 'alpha' : r.status_kehadiran
        }));
        
        const hadir = normalizedRecords.filter(r => r.status_kehadiran === 'hadir').length;
        const sakit = normalizedRecords.filter(r => r.status_kehadiran === 'sakit').length;
        const izin = normalizedRecords.filter(r => r.status_kehadiran === 'izin').length;
        const alpha = normalizedRecords.filter(r => r.status_kehadiran === 'alpha').length;
        const total = hadir + sakit + izin + alpha;
        const persentase = total > 0 ? ((hadir / total) * 100).toFixed(1) : 0;
        
        totalHadir += hadir;
        totalSakit += sakit;
        totalIzin += izin;
        totalAlpha += alpha;
        totalRecords += total;
        
        excelData.push([
          index + 1,
          siswa.nis,
          siswa.nama_siswa,
          hadir,
          sakit,
          izin,
          alpha,
          total,
          `${persentase}%`,
          index + 1
        ]);
        
        // If this is the last student, add summary and send file
        if (index === siswaList.length - 1) {
          const rataRata = totalRecords > 0 ? ((totalHadir / totalRecords) * 100).toFixed(1) : 0;
          
          // Summary row
          excelData.push([]);
          excelData.push(['RINGKASAN']);
          excelData.push(['Total Siswa', siswaList.length]);
          excelData.push(['Total Hadir', totalHadir]);
          excelData.push(['Total Sakit', totalSakit]);
          excelData.push(['Total Izin', totalIzin]);
          excelData.push(['Total Alpha', totalAlpha]);
          excelData.push(['Rata-rata Kehadiran', `${rataRata}%`]);
          
          // Create workbook and worksheet
          const wb = XLSX.utils.book_new();
          const ws = XLSX.utils.aoa_to_sheet(excelData);
          
          // Set column widths
          ws['!cols'] = [
            { wch: 5 },  // No
            { wch: 15 }, // NIS
            { wch: 30 }, // Nama
            { wch: 10 }, // Hadir
            { wch: 10 }, // Sakit
            { wch: 10 }, // Izin
            { wch: 10 }, // Alpha
            { wch: 10 }, // Total
            { wch: 15 }, // % Kehadiran
            { wch: 10 }  // Ranking
          ];
          
          XLSX.utils.book_append_sheet(wb, ws, 'Rekap Absensi');
          
          // Generate filename
          const bulanNama = new Date(tahun, bulan-1, 1).toLocaleDateString('id-ID', { month: 'long' });
          const filename = `Rekap_Absensi_${kelas.nama_kelas.replace(/\s+/g, '_')}_${bulanNama}_${tahun}.xlsx`;
          
          // Send file
          res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
          res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
          res.write(XLSX.write(wb, { bookType: 'xlsx', type: 'buffer' }));
          res.end();
          
          console.log(`✅ Excel file exported: ${filename}`);
        }
      });
    });
  } catch (error) {
    console.error('❌ Error exporting Excel:', error);
    req.flash('error', `Gagal export Excel: ${error.message}`);
    res.redirect('/absensi/rekap');
  }
});

// GET /absensi/rekap-harian - Rekap absensi harian per tanggal
router.get('/rekap-harian', async (req, res) => {
  try {
    console.log('📅 Accessing /absensi/rekap-harian route');
    
    const { tanggal, kelas_id } = req.query;
    
    // Ambil data kelas untuk filter
    const kelasList = await new Promise((resolve, reject) => {
      Kelas.getAll((err, list) => {
        if (err) reject(err);
        else resolve(list || []);
      });
    });
    
    if (!tanggal || !kelas_id) {
      return res.render('absensi/rekap-harian', {
        title: 'Rekap Harian Absensi - Sistem Informasi Akademik',
        heading: 'Rekap Harian Absensi Siswa',
        rekapHarian: null,
        summary: null,
        kelasList,
        selectedTanggal: tanggal || new Date().toISOString().split('T')[0],
        selectedKelas: '',
        showBackButton: true
      });
    }
    
    console.log(`   Loading daily recap for date: ${tanggal}, class: ${kelas_id}`);
    
    // Get class info
    const kelas = await new Promise((resolve, reject) => {
      Kelas.getById(kelas_id, (err, data) => {
        if (err) reject(err);
        else resolve(data);
      });
    });
    
    // Get all students in this class
    const siswaList = await new Promise((resolve, reject) => {
      Siswa.getAllByKelas(kelas_id, (err, list) => {
        if (err) reject(err);
        else resolve(list || []);
      });
    });
    
    console.log(`   Found ${siswaList.length} students in class ${kelas_id}`);
    
    // Get all attendance records for this class on this date
    const absensiRecords = await queryDB(`
      SELECT a.*, s.nama_siswa, s.nis, mp.nama_mapel, g.nama_guru
      FROM absensi a
      LEFT JOIN siswa s ON a.siswa_id = s.id
      LEFT JOIN mata_pelajaran mp ON a.mapel_id = mp.id
      LEFT JOIN guru g ON a.guru_id = g.id
      WHERE a.kelas_id = ? AND a.tanggal = ?
      ORDER BY s.nama_siswa, mp.nama_mapel
    `, [kelas_id, tanggal]);
    
    console.log(`   Found ${absensiRecords.length} attendance records`);
    
    // Group by student
    const rekapBySiswa = {};
    siswaList.forEach(siswa => {
      rekapBySiswa[siswa.id] = {
        siswa_id: siswa.id,
        nis: siswa.nis,
        nama_siswa: siswa.nama_siswa,
        records: [],
        hadir: 0,
        sakit: 0,
        izin: 0,
        alpha: 0
      };
    });
    
    // Fill in attendance records
    absensiRecords.forEach(record => {
      if (rekapBySiswa[record.siswa_id]) {
        // CRITICAL FIX: Normalize 'alpa' to 'alpha'
        const originalStatus = record.status_kehadiran;
        const status = record.status_kehadiran === 'alpa' ? 'alpha' : record.status_kehadiran;
        
        // Debug logging for alpha status
        if (status === 'alpha') {
          console.log(`   ✅ Found ALPHA record for student ${record.nama_siswa} (${record.nis}) - Mapel: ${record.nama_mapel}`);
        }
        
        // Debug logging for typo
        if (originalStatus === 'alpa') {
          console.log(`   ⚠️  Found 'alpa' (typo) for student ${record.nama_siswa}, converting to 'alpha'`);
        }
        
        rekapBySiswa[record.siswa_id].records.push({
          mapel: record.nama_mapel,
          guru: record.nama_guru,
          status: status,
          keterangan: record.keterangan
        });
        
        // Count by status - also include 'tidak_hadir' as alpha equivalent
        if (status === 'hadir') rekapBySiswa[record.siswa_id].hadir++;
        else if (status === 'sakit') rekapBySiswa[record.siswa_id].sakit++;
        else if (status === 'izin') rekapBySiswa[record.siswa_id].izin++;
        else if (status === 'alpha' || status === 'alpa' || status === 'tidak_hadir') {
          rekapBySiswa[record.siswa_id].alpha++; // Keep using alpha property to track all non-attendance statuses
        }
      }
    });
    
    // Log summary of students with alpha
    const studentsWithAlpha = Object.values(rekapBySiswa).filter(s => s.alpha > 0);
    if (studentsWithAlpha.length > 0) {
      console.log(`   🔴 Students with Non-Attendance status: ${studentsWithAlpha.length}`);
      studentsWithAlpha.forEach(s => {
        console.log(`      - ${s.nama_siswa}: ${s.alpha} non-attendance record(s)`);
      });
    }
    
    // Convert to array and sort by name
    const rekapHarian = Object.values(rekapBySiswa).sort((a, b) => 
      a.nama_siswa.localeCompare(b.nama_siswa)
    );
    
    // Calculate summary
    const summary = {
      totalSiswa: siswaList.length,
      totalRecords: absensiRecords.length,
      totalHadir: rekapHarian.reduce((sum, r) => sum + r.hadir, 0),
      totalSakit: rekapHarian.reduce((sum, r) => sum + r.sakit, 0),
      totalIzin: rekapHarian.reduce((sum, r) => sum + r.izin, 0),
      totalAlpha: rekapHarian.reduce((sum, r) => sum + r.alpha, 0)  // This now includes tidak_hadir
    };
    
    console.log(`   Summary: ${JSON.stringify(summary)}`);
    
    res.render('absensi/rekap-harian', {
      title: `Rekap Harian - ${kelas?.nama_kelas}`,
      heading: `Rekap Harian Absensi`,
      rekapHarian,
      summary,
      kelas,
      kelasList,
      selectedTanggal: tanggal,
      selectedKelas: kelas_id,
      showBackButton: true
    });
  } catch (error) {
    console.error('❌ Error loading rekap harian:', error);
    req.flash('error', `Terjadi kesalahan saat memuat rekap harian: ${error.message}`);
    res.redirect('/absensi');
  }
});

// GET /absensi/rekap-harian/export - Export rekap harian ke Excel
router.get('/rekap-harian/export', async (req, res) => {
  try {
    console.log('📥 Exporting daily recap to Excel');
    
    const { tanggal, kelas_id } = req.query;
    
    if (!tanggal || !kelas_id) {
      req.flash('error', 'Pilih tanggal dan kelas terlebih dahulu');
      return res.redirect('/absensi/rekap-harian');
    }
    
    const XLSX = require('xlsx');
    
    // Get class info
    const kelas = await new Promise((resolve, reject) => {
      Kelas.getById(kelas_id, (err, data) => {
        if (err) reject(err);
        else resolve(data);
      });
    });
    
    // Get all students in this class
    const siswaList = await queryDB(
      'SELECT id, nis, nama_siswa FROM siswa WHERE kelas_id = ? ORDER BY nama_siswa',
      [kelas_id]
    );
    
    // Get attendance records for the selected date
    const absensiRecords = await queryDB(`
      SELECT a.*, s.nama_siswa, s.nis, k.nama_kelas, 
             mp.nama_mapel, g.nama_guru
      FROM absensi a
      LEFT JOIN siswa s ON a.siswa_id = s.id
      LEFT JOIN kelas k ON a.kelas_id = k.id
      LEFT JOIN mata_pelajaran mp ON a.mapel_id = mp.id
      LEFT JOIN guru g ON a.guru_id = g.id
      WHERE a.tanggal = ? AND a.kelas_id = ?
      ORDER BY s.nama_siswa, mp.nama_mapel
    `, [tanggal, kelas_id]);
    
    // Group records by student
    const rekapBySiswa = {};
    
    siswaList.forEach(siswa => {
      rekapBySiswa[siswa.id] = {
        nis: siswa.nis,
        nama_siswa: siswa.nama_siswa,
        records: []
      };
    });
    
    absensiRecords.forEach(record => {
      // Normalize status: convert 'alpa' to 'alpha'
      const status = (record.status_kehadiran === 'alpa' || record.status_kehadiran === 'alpha') ? 'tidak_hadir' : record.status_kehadiran;
      
      if (rekapBySiswa[record.siswa_id]) {
        rekapBySiswa[record.siswa_id].records.push({
          mapel: record.nama_mapel,
          guru: record.nama_guru,
          status: status,
          keterangan: record.keterangan
        });
      }
    });
    
    // Convert to array and sort by name
    const rekapHarian = Object.values(rekapBySiswa).sort((a, b) => 
      a.nama_siswa.localeCompare(b.nama_siswa)
    );
    
    // Prepare data for Excel
    const excelData = [];
    
    // Header
    excelData.push(['REKAP ABSENSI HARIAN']);
    excelData.push([`Kelas: ${kelas.nama_kelas}`]);
    excelData.push([`Tanggal: ${new Date(tanggal).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}`]);
    excelData.push([]); // Empty row
    
    // Table header
    excelData.push(['No', 'NIS', 'Nama Siswa', 'Mata Pelajaran', 'Guru', 'Status', 'Keterangan']);
    
    // Student data
    rekapHarian.forEach((rekap, index) => {
      if (rekap.records.length > 0) {
        // Add each subject record
        rekap.records.forEach(record => {
          excelData.push([
            index + 1,
            rekap.nis,
            rekap.nama_siswa,
            record.mapel || '-',
            record.guru || '-',
            record.status === 'tidak_hadir' ? 'Tidak Hadir' : record.status.charAt(0).toUpperCase() + record.status.slice(1),
            (record.keterangan && record.keterangan.trim() !== '') ? record.keterangan : '-'
          ]);
        });
      } else {
        // If no subject records, add student with default values
        excelData.push([
          index + 1,
          rekap.nis,
          rekap.nama_siswa,
          '-',
          '-',
          'Hadir', // Assuming present if no records exist
          '-'
        ]);
      }
    });
    
    // Create workbook and worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(excelData);
    
    // Set column widths
    ws['!cols'] = [
      { wch: 5 },  // No
      { wch: 15 }, // NIS
      { wch: 25 }, // Nama
      { wch: 20 }, // Mapel
      { wch: 25 }, // Guru
      { wch: 15 }, // Status
      { wch: 30 }  // Keterangan
    ];
    
    XLSX.utils.book_append_sheet(wb, ws, 'Rekap Harian');
    
    // Generate filename
    const tanggalFormatted = new Date(tanggal).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }).replace(/ /g, '_');
    const filename = `Rekap_Absensi_Harian_${kelas.nama_kelas.replace(/\s+/g, '_')}_${tanggalFormatted}.xlsx`;
    
    // Send file
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.write(XLSX.write(wb, { bookType: 'xlsx', type: 'buffer' }));
    res.end();
    
    console.log(`✅ Excel file exported: ${filename}`);
  } catch (error) {
    console.error('❌ Error exporting Excel:', error);
    req.flash('error', `Gagal export Excel: ${error.message}`);
    res.redirect('/absensi/rekap-harian');
  }
});

// GET /absensi/check-alpha - Diagnostic page untuk cek data alpha
router.get('/check-alpha', async (req, res) => {
  try {
    console.log('🔍 Diagnostic: Checking alpha status data');
    
    // Get ALL alpha records (no filter) - show everything
    const allAlphaRecords = await queryDB(`
      SELECT a.status_kehadiran, a.tanggal, s.nama_siswa, s.nis, k.nama_kelas, 
             mp.nama_mapel, g.nama_guru
      FROM absensi a
      LEFT JOIN siswa s ON a.siswa_id = s.id
      LEFT JOIN kelas k ON a.kelas_id = k.id
      LEFT JOIN mata_pelajaran mp ON a.mapel_id = mp.id
      LEFT JOIN guru g ON a.guru_id = g.id
      WHERE a.status_kehadiran IN ('alpha', 'alpa')
      ORDER BY a.tanggal DESC, s.nama_siswa
    `);
    
    // Get alpha records for today
    const today = new Date().toISOString().split('T')[0];
    const todayAlphaRecords = await queryDB(`
      SELECT a.status_kehadiran, a.tanggal, s.nama_siswa, s.nis, k.nama_kelas, 
             mp.nama_mapel, g.nama_guru
      FROM absensi a
      LEFT JOIN siswa s ON a.siswa_id = s.id
      LEFT JOIN kelas k ON a.kelas_id = k.id
      LEFT JOIN mata_pelajaran mp ON a.mapel_id = mp.id
      LEFT JOIN guru g ON a.guru_id = g.id
      WHERE a.tanggal = ? AND a.status_kehadiran IN ('alpha', 'alpa')
      ORDER BY s.nama_siswa
    `, [today]);
    
    // Get unique status values
    const uniqueStatus = await queryDB('SELECT DISTINCT status_kehadiran FROM absensi');
    
    // Get status distribution
    const statusDist = await queryDB('SELECT status_kehadiran, COUNT(*) as count FROM absensi GROUP BY status_kehadiran');
    
    // Get total count
    const totalCount = await queryDB('SELECT COUNT(*) as total FROM absensi');
    
    console.log('    Total records in database:', totalCount[0].total);
    console.log('    Total alpha records (all time):', allAlphaRecords.length);
    console.log('   🔴 Alpha records today:', todayAlphaRecords.length);
    console.log('   Unique status:', uniqueStatus.map(s => s.status_kehadiran));
    
    res.render('check-alpha', {
      title: 'Database Diagnostic - Alpha Status',
      allAlphaRecords,
      todayAlphaRecords,
      today,
      uniqueStatus,
      statusDist,
      totalCount: totalCount[0].total,
      success: req.flash('success'),
      error: req.flash('error')
    });
  } catch (error) {
    console.error('❌ Error checking alpha status:', error);
    res.send('<h1>Error</h1><pre>' + error.message + '</pre>');
  }
});

// GET /absensi/fix-alpha - Fix 'alpa' typo to 'alpha'
router.get('/fix-alpha', async (req, res) => {
  try {
    console.log('🔧 Fixing alpa typo to alpha...');
    
    const result = await runDB(
      'UPDATE absensi SET status_kehadiran = ? WHERE status_kehadiran = ?',
      ['alpha', 'alpa']
    );
    
    console.log(`    Updated ${result.changes} records`);
    
    req.flash('success', `Successfully fixed ${result.changes} records from 'alpa' to 'alpha'`);
    res.redirect('/absensi/check-alpha');
  } catch (error) {
    console.error('❌ Error fixing alpha:', error);
    res.send('<h1>Error</h1><pre>' + error.message + '</pre>');
  }
});

// GET /absensi/insert-test-alpha - Insert test alpha records
router.get('/insert-test-alpha', async (req, res) => {
  try {
    console.log('🧪 Inserting test alpha records...');
    
    // Get first 5 students
    const students = await queryDB('SELECT id, nama_siswa, nis, kelas_id FROM siswa LIMIT 5');
    
    if (students.length === 0) {
      req.flash('error', 'Tidak ada data siswa di database!');
      return res.redirect('/absensi/check-alpha');
    }
    
    // Get first mapel and guru
    const mapel = await queryDB('SELECT id FROM mata_pelajaran LIMIT 1');
    const guru = await queryDB('SELECT id FROM guru LIMIT 1');
    
    if (!mapel[0] || !guru[0]) {
      req.flash('error', 'Data mapel atau guru tidak ditemukan!');
      return res.redirect('/absensi/check-alpha');
    }
    
    const today = new Date().toISOString().split('T')[0];
    const kelas_id = students[0].kelas_id;
    const mapel_id = mapel[0].id;
    const guru_id = guru[0].id;
    
    console.log(`    Will insert alpha for ${students.length} students`);
    console.log(`    Date: ${today}, Kelas: ${kelas_id}, Mapel: ${mapel_id}, Guru: ${guru_id}`);
    
    let inserted = 0;
    let failed = 0;
    
    for (const student of students) {
      try {
        await runDB(
          'INSERT INTO absensi (siswa_id, kelas_id, tanggal, mapel_id, guru_id, status_kehadiran, keterangan) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [student.id, kelas_id, today, mapel_id, guru_id, 'alpha', 'Test alpha record - Auto inserted']
        );
        console.log(`    ✅ Inserted alpha for ${student.nama_siswa}`);
        inserted++;
      } catch (error) {
        console.error(`    ❌ Failed for ${student.nama_siswa}:`, error.message);
        failed++;
      }
    }
    
    req.flash('success', `✅ Test alpha inserted: ${inserted} success, ${failed} failed. Refresh halaman absensi!`);
    res.redirect('/absensi/check-alpha');
  } catch (error) {
    console.error('❌ Error inserting test alpha:', error);
    res.send('<h1>Error</h1><pre>' + error.message + '</pre>');
  }
});

// GET /absensi/diagnostic - Halaman diagnostic lengkap
router.get('/diagnostic', async (req, res) => {
  try {
    console.log('🔧 Accessing /absensi/diagnostic');
    
    const results = {};
    
    // 1. Total Alpha Records
    const alphaCount = await new Promise((resolve, reject) => {
      db.get(`SELECT COUNT(*) as total FROM absensi WHERE status_kehadiran IN ('alpha', 'alpa')`, (err, row) => {
        if (err) reject(err);
        else resolve(row.total);
      });
    });
    results.alphaCount = alphaCount;
    
    // 2. Total Semua Absensi
    const totalAbsensi = await new Promise((resolve, reject) => {
      db.get(`SELECT COUNT(*) as total FROM absensi`, (err, row) => {
        if (err) reject(err);
        else resolve(row.total);
      });
    });
    results.totalAbsensi = totalAbsensi;
    
    // 3. Typo Check
    const typoCount = await new Promise((resolve, reject) => {
      db.get(`SELECT COUNT(*) as count FROM absensi WHERE status_kehadiran = 'alpa'`, (err, row) => {
        if (err) reject(err);
        else resolve(row.count);
      });
    });
    results.typoCount = typoCount;
    
    // 4. Recent Alpha Records
    const recentAlpha = await queryDB(`
      SELECT a.*, s.nama_siswa, k.nama_kelas, mp.nama_mapel, g.nama_guru
      FROM absensi a
      LEFT JOIN siswa s ON a.siswa_id = s.id
      LEFT JOIN kelas k ON a.kelas_id = k.id
      LEFT JOIN mata_pelajaran mp ON a.mapel_id = mp.id
      LEFT JOIN guru g ON a.guru_id = g.id
      WHERE a.status_kehadiran IN ('alpha', 'alpa')
      ORDER BY a.tanggal DESC
      LIMIT 10
    `);
    results.recentAlpha = recentAlpha;
    
    // 5. Today's Absensi Breakdown
    const today = new Date().toISOString().split('T')[0];
    const todayBreakdown = await queryDB(`
      SELECT status_kehadiran, COUNT(*) as count
      FROM absensi
      WHERE tanggal = ?
      GROUP BY status_kehadiran
    `, [today]);
    results.todayBreakdown = todayBreakdown;
    results.today = today;
    
    // 6. Status Distribution Overall
    const statusDistribution = await queryDB(`
      SELECT status_kehadiran, COUNT(*) as count
      FROM absensi
      GROUP BY status_kehadiran
      ORDER BY count DESC
    `);
    results.statusDistribution = statusDistribution;
    
    res.render('absensi/diagnostic', {
      title: 'Diagnostic - Absensi',
      heading: 'Diagnostic Tool - Cek Data Alpha',
      results,
      showBackButton: true
    });
  } catch (error) {
    console.error('❌ Error in diagnostic:', error);
    res.send(`<h1>Error</h1><pre>${error.message}</pre>`);
  }
});

module.exports = router;