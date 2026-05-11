const db = require('./config/dbConfig');

console.log('🔍 Memverifikasi penghapusan tabel pilihan_siswa...\n');

db.serialize(() => {
  // Cek apakah tabel pilihan_siswa masih ada
  console.log('📋 Checking table: pilihan_siswa');
  db.get(`SELECT name FROM sqlite_master WHERE type='table' AND name='pilihan_siswa'`, (err, row) => {
    if (err) {
      console.error('   ❌ Error checking pilihan_siswa:', err.message);
    } else if (row) {
      console.log('   ⚠️  WARNING: Table pilihan_siswa masih ada!');
    } else {
      console.log('   ✅ Table pilihan_siswa berhasil dihapus');
    }
    
    // Show all remaining tables
    console.log('\n All tables in database:');
    db.all(`SELECT name FROM sqlite_master WHERE type='table' ORDER BY name`, (err, rows) => {
      if (err) {
        console.error('   ❌ Error:', err.message);
      } else {
        rows.forEach((row, index) => {
          console.log(`   ${index + 1}. ${row.name}`);
        });
      }
      
      console.log('\n✅ Verifikasi selesai!\n');
      
      // Close database
      db.close((err) => {
        if (err) {
          console.error('Error closing database:', err.message);
        }
      });
    });
  });
});
