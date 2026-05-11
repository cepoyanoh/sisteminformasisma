const db = require('./config/dbConfig');

console.log('═══════════════════════════════════════════════════════');
console.log('🔍 DIAGNOSTIC: Checking Alpha Data for 2026-05-08');
console.log('═══════════════════════════════════════════════════════\n');

// Check ALL records for the date
db.all(`
  SELECT a.*, s.nama_siswa, s.nis, k.nama_kelas, mp.nama_mapel, g.nama_guru
  FROM absensi a
  LEFT JOIN siswa s ON a.siswa_id = s.id
  LEFT JOIN kelas k ON a.kelas_id = k.id
  LEFT JOIN mata_pelajaran mp ON a.mapel_id = mp.id
  LEFT JOIN guru g ON a.guru_id = g.id
  WHERE a.tanggal = '2026-05-08'
  ORDER BY a.status_kehadiran, s.nama_siswa
`, [], (err, rows) => {
  if (err) {
    console.error('❌ Database Error:', err.message);
    db.close();
    return;
  }
  
  console.log(`📅 Date: 2026-05-08`);
  console.log(`📊 Total Records Found: ${rows.length}\n`);
  
  if (rows.length === 0) {
    console.log('️  NO RECORDS FOUND for this date!');
    console.log('   Possible reasons:');
    console.log('   1. Attendance was not saved yet');
    console.log('   2. Wrong date selected in filter');
    console.log('   3. Data saved to different date\n');
    db.close();
    return;
  }
  
  // Group by status
  const statusGroups = {
    hadir: rows.filter(r => r.status_kehadiran === 'hadir'),
    sakit: rows.filter(r => r.status_kehadiran === 'sakit'),
    izin: rows.filter(r => r.status_kehadiran === 'izin'),
    alpha: rows.filter(r => r.status_kehadiran === 'alpha'),
    alpa: rows.filter(r => r.status_kehadiran === 'alpa')
  };
  
  console.log('📈 STATUS BREAKDOWN:');
  console.log('─────────────────────────────────────────');
  console.log(`   ✅ Hadir:  ${statusGroups.hadir.length} students`);
  console.log(`   🤒 Sakit:  ${statusGroups.sakit.length} students`);
  console.log(`   📧 Izin:   ${statusGroups.izin.length} students`);
  console.log(`   ❌ Alpha:  ${statusGroups.alpha.length} students`);
  console.log(`   ⚠️  Alpa:   ${statusGroups.alpa.length} students (TYPO - needs fix)`);
  console.log('─────────────────────────────────────────\n');
  
  const totalAlpha = statusGroups.alpha.length + statusGroups.alpa.length;
  
  if (totalAlpha === 0) {
    console.log('❌ NO ALPHA STUDENTS in database!');
    console.log('   The UI showing "Alpha: 0" is CORRECT.\n');
    console.log('   Possible reasons:');
    console.log('   1. You did not click any Alpha button when inputting');
    console.log('   2. Form submission failed');
    console.log('   3. Data was saved with different date\n');
  } else {
    console.log(`✅ FOUND ${totalAlpha} ALPHA STUDENT(S):\n`);
    console.log('   ALPHA RECORDS:');
    console.log('   ─────────────────────────────────────────');
    
    [...statusGroups.alpha, ...statusGroups.alpa].forEach((record, index) => {
      const hasTypo = record.status_kehadiran === 'alpa';
      console.log(`   ${index + 1}. ${record.nama_siswa}`);
      console.log(`      NIS: ${record.nis}`);
      console.log(`      Kelas: ${record.nama_kelas}`);
      console.log(`      Mapel: ${record.nama_mapel || 'N/A'}`);
      console.log(`      Guru: ${record.nama_guru || 'N/A'}`);
      console.log(`      Status: "${record.status_kehadiran}" ${hasTypo ? '⚠️  TYPO!' : '✅'}`);
      console.log('');
    });
    
    // Fix typo if found
    if (statusGroups.alpa.length > 0) {
      console.log('🔧 AUTO-FIXING TYPO "alpa" -> "alpha"...\n');
      
      db.run(`UPDATE absensi SET status_kehadiran = 'alpha' WHERE status_kehadiran = 'alpa'`, function(err) {
        if (err) {
          console.error('❌ Error fixing:', err.message);
        } else {
          console.log(`✅ Fixed ${this.changes} record(s) from "alpa" to "alpha"\n`);
        }
        
        console.log('═══════════════════════════════════════════════════════');
        console.log('✨ DIAGNOSTIC COMPLETE');
        console.log('═══════════════════════════════════════════════════════');
        console.log('\n📌 Next Steps:');
        console.log('   1. Refresh your browser (Ctrl+F5)');
        console.log('   2. Check if Alpha count is now correct');
        console.log('   3. If still showing 0, check the date filter\n');
        
        db.close();
      });
    } else {
      console.log('═══════════════════════════════════════════════════════');
      console.log('✨ DIAGNOSTIC COMPLETE');
      console.log('═══════════════════════════════════════════════════════');
      console.log('\n📌 Status:');
      console.log('   - All alpha records are correctly stored as "alpha"');
      console.log('   - Refresh browser to see updated data\n');
      
      db.close();
    }
  }
});
