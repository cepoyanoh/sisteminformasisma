const sqlite3 = require('sqlite3').verbose();
const path = require('path');

console.log(' Diagnostic: Absensi Mapel & Guru\n');
console.log('='.repeat(70));

const dbPath = path.resolve(__dirname, 'database.db');
const db = new sqlite3.Database(dbPath);

// 1. Check total absensi records
db.get('SELECT COUNT(*) as total FROM absensi', (err, row) => {
  if (err) {
    console.error('❌ Error:', err.message);
    return db.close();
  }
  
  console.log(`📊 Total absensi records: ${row.total}\n`);
  
  // 2. Check records with and without mapel/guru
  db.get(`
    SELECT 
      COUNT(*) as total,
      SUM(CASE WHEN mapel_id IS NOT NULL THEN 1 ELSE 0 END) as with_mapel,
      SUM(CASE WHEN mapel_id IS NULL THEN 1 ELSE 0 END) as without_mapel,
      SUM(CASE WHEN guru_id IS NOT NULL THEN 1 ELSE 0 END) as with_guru,
      SUM(CASE WHEN guru_id IS NULL THEN 1 ELSE 0 END) as without_guru
    FROM absensi
  `, (err, row) => {
    if (err) {
      console.error('❌ Error:', err.message);
      return db.close();
    }
    
    console.log('📈 Breakdown:');
    console.log(`   With mapel_id: ${row.with_mapel} (${((row.with_mapel/row.total)*100).toFixed(1)}%)`);
    console.log(`   Without mapel_id: ${row.without_mapel} (${((row.without_mapel/row.total)*100).toFixed(1)}%)`);
    console.log(`   With guru_id: ${row.with_guru} (${((row.with_guru/row.total)*100).toFixed(1)}%)`);
    console.log(`   Without guru_id: ${row.without_guru} (${((row.without_guru/row.total)*100).toFixed(1)}%)\n`);
    
    // 3. Sample data
    console.log('📋 Sample data (first 3 records):\n');
    db.all(`
      SELECT a.id, a.siswa_id, a.mapel_id, a.guru_id, 
             mp.nama_mapel, g.nama_guru,
             s.nama_siswa, a.tanggal, a.status_kehadiran
      FROM absensi a
      LEFT JOIN mata_pelajaran mp ON a.mapel_id = mp.id
      LEFT JOIN guru g ON a.guru_id = g.id
      LEFT JOIN siswa s ON a.siswa_id = s.id
      ORDER BY a.id DESC
      LIMIT 3
    `, (err, rows) => {
      if (err) {
        console.error('❌ Error:', err.message);
      } else {
        rows.forEach((row, idx) => {
          console.log(`  Record #${row.id}:`);
          console.log(`    Siswa: ${row.nama_siswa}`);
          console.log(`    mapel_id: ${row.mapel_id} → nama_mapel: ${row.nama_mapel || '(NULL)'}`);
          console.log(`    guru_id: ${row.guru_id} → nama_guru: ${row.nama_guru || '(NULL)'}`);
          console.log(`    Status: ${row.status_kehadiran}\n`);
        });
      }
      
      console.log('='.repeat(70));
      
      if (row.without_mapel > 0 || row.without_guru > 0) {
        console.log('⚠️  ISSUE DETECTED: Some records missing mapel_id or guru_id\n');
        console.log('SOLUTION: Run one of these commands:\n');
        console.log('  1. Update old records with default values:');
        console.log('     node update_old_absensi.js\n');
        console.log('  2. Or input new absensi data with mapel & guru selected\n');
      } else {
        console.log('✅ All records have mapel_id and guru_id!\n');
        console.log('If names still not showing, check the route and view files.\n');
      }
      
      console.log('='.repeat(70));
      db.close();
      process.exit(0);
    });
  });
});