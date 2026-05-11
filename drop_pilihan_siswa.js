const db = require('./config/dbConfig');

console.log('🗑️  Menghapus tabel pilihan_siswa dari database...\n');

db.serialize(() => {
  // Drop tabel pilihan_siswa
  console.log('📋 Dropping table: pilihan_siswa');
  db.run(`DROP TABLE IF EXISTS pilihan_siswa`, (err) => {
    if (err) {
      console.error('   ❌ Error dropping pilihan_siswa:', err.message);
    } else {
      console.log('   ✅ pilihan_siswa table dropped successfully');
    }
    
    // Verify the table is dropped
    console.log('\n🔍 Verifying table removal...');
    db.get(`SELECT name FROM sqlite_master WHERE type='table' AND name='pilihan_siswa'`, (err, row) => {
      if (err) {
        console.error('   ❌ Error verifying:', err.message);
      } else if (row) {
        console.log('   ⚠️  WARNING: Table pilihan_siswa masih ada!');
      } else {
        console.log('   ✅ Table pilihan_siswa berhasil dihapus dari database');
      }
      
      // Show remaining tables
      console.log('\n📊 Remaining tables in database:');
      db.all(`SELECT name FROM sqlite_master WHERE type='table' ORDER BY name`, (err, rows) => {
        if (err) {
          console.error('   ❌ Error:', err.message);
        } else {
          rows.forEach((row, index) => {
            console.log(`   ${index + 1}. ${row.name}`);
          });
        }
        
        console.log('\n✅ Penghapusan tabel pilihan_siswa selesai!\n');
        
        // Close database
        db.close((err) => {
          if (err) {
            console.error('Error closing database:', err.message);
          }
        });
      });
    });
  });
});
