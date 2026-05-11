const db = require('./config/dbConfig');

console.log('🔧 Fixing Alpha Status Issues...\n');

// Step 1: Check current status distribution
console.log('Step 1: Checking current status distribution...\n');

db.all('SELECT status_kehadiran, COUNT(*) as count FROM absensi GROUP BY status_kehadiran', [], (err, rows) => {
  if (err) {
    console.error('❌ Error:', err.message);
    db.close();
    return;
  }
  
  console.log('📊 Current Status Distribution:');
  rows.forEach(row => {
    console.log(`   ${row.status_kehadiran}: ${row.count}`);
  });
  console.log('');
  
  // Step 2: Fix typo 'alpa' -> 'alpha'
  console.log('Step 2: Fixing typo "alpa" to "alpha"...\n');
  
  db.run(`UPDATE absensi SET status_kehadiran = 'alpha' WHERE status_kehadiran = 'alpa'`, function(err) {
    if (err) {
      console.error(' Error fixing typo:', err.message);
      db.close();
      return;
    }
    
    console.log(`✅ Fixed ${this.changes} records from "alpa" to "alpha"\n`);
    
    // Step 3: Verify the fix
    console.log('Step 3: Verifying the fix...\n');
    
    db.all('SELECT status_kehadiran, COUNT(*) as count FROM absensi GROUP BY status_kehadiran ORDER BY status_kehadiran', [], (err, rows) => {
      if (err) {
        console.error('❌ Error:', err.message);
        db.close();
        return;
      }
      
      console.log('📊 Status Distribution After Fix:');
      rows.forEach(row => {
        console.log(`   ${row.status_kehadiran}: ${row.count}`);
      });
      console.log('');
      
      // Step 4: Show alpha students
      console.log('Step 4: Listing all students with Alpha status...\n');
      
      db.all(`
        SELECT a.id, s.nama_siswa, s.nis, k.nama_kelas, a.tanggal, a.mapel_id, a.guru_id
        FROM absensi a
        LEFT JOIN siswa s ON a.siswa_id = s.id
        LEFT JOIN kelas k ON a.kelas_id = k.id
        WHERE a.status_kehadiran = 'alpha'
        ORDER BY a.tanggal DESC, s.nama_siswa
      `, [], (err, alphaRecords) => {
        if (err) {
          console.error('❌ Error:', err.message);
          db.close();
          return;
        }
        
        if (alphaRecords.length === 0) {
          console.log('⚠️  No alpha records found in database!');
          console.log('   This means either:');
          console.log('   1. No students were saved with alpha status');
          console.log('   2. The data was not saved to database\n');
        } else {
          console.log(`✅ Found ${alphaRecords.length} alpha records:\n`);
          alphaRecords.forEach((record, index) => {
            console.log(`   ${index + 1}. ${record.nama_siswa} (NIS: ${record.nis})`);
            console.log(`      Kelas: ${record.nama_kelas || 'N/A'}`);
            console.log(`      Tanggal: ${record.tanggal}`);
            console.log(`      Mapel ID: ${record.mapel_id}, Guru ID: ${record.guru_id}\n`);
          });
        }
        
        console.log('✨ Fix complete! Please refresh your browser to see the changes.\n');
        db.close();
      });
    });
  });
});
