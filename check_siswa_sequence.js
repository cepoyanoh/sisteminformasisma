const db = require('./config/dbConfig');

console.log('\n========================================');
console.log('  ANALISIS SEQUENCE SISWA');
console.log('========================================\n');

// 1. Check sequence value
db.get(`SELECT seq FROM sqlite_sequence WHERE name='siswa'`, (err, row) => {
  if (err) {
    console.error('❌ Error:', err.message);
    return;
  }
  
  console.log('📊 Sequence Table (sqlite_sequence):');
  console.log(`   Siswa sequence: ${row.seq}\n`);
  
  // 2. Check actual active students count
  db.get(`SELECT COUNT(*) as total FROM siswa`, (err, row2) => {
    if (err) {
      console.error('❌ Error:', err.message);
      return;
    }
    
    console.log('📋 Active Students Count:');
    console.log(`   Total siswa aktif: ${row2.total}\n`);
    
    // 3. Check max ID
    db.get(`SELECT MAX(id) as max_id FROM siswa`, (err, row3) => {
      if (err) {
        console.error('❌ Error:', err.message);
        return;
      }
      
      console.log('🔢 ID Analysis:');
      console.log(`   Highest ID: ${row3.max_id}`);
      console.log(`   Gap between sequence and max ID: ${row.seq - row3.max_id}\n`);
      
      // 4. Explanation
      console.log('💡 PENJELASAN:');
      console.log('   - Sequence (1201) = Jumlah total INSERT yang pernah dilakukan');
      console.log('   - Active students = Siswa yang masih ada di database');
      console.log('   - Selisih = Data yang sudah dihapus (testing, import, dll)');
      console.log('   - INI NORMAL di SQLite!\n');
      
      // 5. Status by class
      console.log(' Distribution per Kelas:\n');
      db.all(`
        SELECT k.nama_kelas, COUNT(s.id) as jumlah
        FROM siswa s
        LEFT JOIN kelas k ON s.kelas_id = k.id
        GROUP BY s.kelas_id
        ORDER BY jumlah DESC
      `, (err, rows) => {
        if (err) {
          console.error('❌ Error:', err.message);
        } else {
          rows.forEach(row => {
            console.log(`   ${row.nama_kelas || 'Unknown'}: ${row.jumlah} siswa`);
          });
        }
        
        console.log('\n✅ Analisis Selesai!\n');
        console.log('📝 Kesimpulan:');
        console.log('   Sequence 1201 berarti ada 1201 data siswa yang pernah dibuat');
        console.log('   Tapi yang aktif saat ini hanya', row2.total, 'siswa');
        console.log('   Sisa', (row.seq - row2.total), 'data sudah dihapus\n');
        
        // Close database
        db.close();
      });
    });
  });
});
