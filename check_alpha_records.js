unceconst db = require('./config/dbConfig');
const fs = require('fs');

let output = [];
output.push('\n========================================');
output.push('  CHECK DATA ALPHA DI DATABASE');
output.push('========================================\n');

// Check total alpha records
db.get(`SELECT COUNT(*) as total FROM absensi WHERE status_kehadiran IN ('alpha', 'alpa')`, (err, row) => {
  if (err) {
    output.push('❌ Error: ' + err.message);
    saveAndExit();
    return;
  }

  output.push(`📊 Total Record Alpha: ${row.total}\n`);

  if (row.total === 0) {
    output.push('⚠️  TIDAK ADA DATA ALPHA DI DATABASE\n');
    output.push('Kemungkinan penyebab:');
    output.push('  1. Belum ada absensi yang diinput');
    output.push('  2. Semua siswa ditandai Hadir/Sakit/Izin');
    output.push('  3. Data belum tersimpan dengan benar\n');

    // Check total absensi
    db.get(`SELECT COUNT(*) as total FROM absensi`, (err, row2) => {
      if (!err) {
        output.push(`📋 Total Semua Absensi: ${row2.total}\n`);
      }

      saveAndExit();
    });
  } else {
    // Show alpha details
    output.push('📋 Detail Record Alpha:\n');

    db.all(`
      SELECT a.*, s.nama_siswa, k.nama_kelas, mp.nama_mapel, g.nama_guru
      FROM absensi a
      LEFT JOIN siswa s ON a.siswa_id = s.id
      LEFT JOIN kelas k ON a.kelas_id = k.id
      LEFT JOIN mata_pelajaran mp ON a.mapel_id = mp.id
      LEFT JOIN guru g ON a.guru_id = g.id
      WHERE a.status_kehadiran IN ('alpha', 'alpa')
      ORDER BY a.tanggal DESC
      LIMIT 20
    `, (err, rows) => {
      if (err) {
        output.push('❌ Error: ' + err.message);
      } else {
        rows.forEach((row, index) => {
          const typo = row.status_kehadiran === 'alpa' ? ' ⚠️ TYPO!' : '';
          output.push(`${index + 1}. ${row.nama_siswa}`);
          output.push(`   Kelas: ${row.nama_kelas || '-'}`);
          output.push(`   Mapel: ${row.nama_mapel || '-'}`);
          output.push(`   Guru: ${row.nama_guru || '-'}`);
          output.push(`   Tanggal: ${row.tanggal}`);
          output.push(`   Status: ${row.status_kehadiran}${typo}`);
          output.push('');
        });
      }

      // Check for typos
      db.get(`SELECT COUNT(*) as count FROM absensi WHERE status_kehadiran = 'alpa'`, (err, row) => {
        if (!err && row.count > 0) {
          output.push(`⚠️  Ditemukan ${row.count} record dengan typo "alpa" (seharusnya "alpha")\n`);
        }

        saveAndExit();
      });
    });
  }
});

function saveAndExit() {
  // Save to file
  const result = output.join('\n');
  fs.writeFileSync('ALPHA_CHECK_RESULT.txt', result, 'utf8');

  console.log(result);
  console.log('\n✅ Hasil juga disimpan ke file: ALPHA_CHECK_RESULT.txt\n');

  db.close();
}
