const sqlite3 = require('sqlite3').verbose();
const path = require('path');

console.log(' Checking Latest Absensi Data\n');
console.log('='.repeat(70));

const dbPath = path.resolve(__dirname, 'database.db');
const db = new sqlite3.Database(dbPath);

// Get last 5 absensi records
db.all(`
  SELECT a.id, a.siswa_id, s.nama_siswa, a.tanggal, 
         a.status_kehadiran, a.mapel_id, mp.nama_mapel,
         a.guru_id, g.nama_guru
  FROM absensi a
  LEFT JOIN siswa s ON a.siswa_id = s.id
  LEFT JOIN mata_pelajaran mp ON a.mapel_id = mp.id
  LEFT JOIN guru g ON a.guru_id = g.id
  ORDER BY a.id DESC
  LIMIT 5
`, (err, rows) => {
  if (err) {
    console.error('❌ Error:', err.message);
    return db.close();
  }
  
  console.log('📋 Last 5 absensi records:\n');
  
  rows.forEach((row, idx) => {
    console.log(`  Record #${row.id}:`);
    console.log(`    Siswa: ${row.nama_siswa}`);
    console.log(`    Tanggal: ${row.tanggal}`);
    console.log(`    Status: ${row.status_kehadiran}`);
    
    // Check if status is correct
    if (row.status_kehadiran === 'alpha') {
      console.log(`    ✅ Status is CORRECT: "alpha"`);
    } else if (row.status_kehadiran === 'alpa') {
      console.log(`     Status has TYPO: "alpa" (should be "alpha")`);
      console.log(`       Run: node fix_typo_alpa.js`);
    } else {
      console.log(`    ℹ️  Status: "${row.status_kehadiran}"`);
    }
    
    console.log(`    Mapel: ${row.nama_mapel || '(not set)'}`);
    console.log(`    Guru: ${row.nama_guru || '(not set)'}\n`);
  });
  
  console.log('='.repeat(70));
  console.log('✅ Check complete!\n');
  console.log('If you see "alpa" (typo), run: node fix_typo_alpa.js\n');
  console.log('If status is correct but still shows wrong in UI:');
  console.log('  1. Hard refresh browser: Ctrl + Shift + R');
  console.log('  2. Clear browser cache');
  console.log('  3. Check browser console for JavaScript errors\n');
  console.log('='.repeat(70));
  
  db.close();
  process.exit(0);
});