const db = require('./config/dbConfig');

console.log('🗑️  Menghapus tabel kurikulum dan jadwal_mengajar dari database...\n');

db.serialize(() => {
  // Drop tabel jadwal_mengajar terlebih dahulu (karena memiliki foreign keys)
  console.log('📋 Dropping table: jadwal_mengajar');
  db.run(`DROP TABLE IF EXISTS jadwal_mengajar`, (err) => {
    if (err) {
      console.error('   ❌ Error dropping jadwal_mengajar:', err.message);
    } else {
      console.log('   ✅ jadwal_mengajar table dropped successfully');
    }
  });

  // Drop tabel kurikulum
  console.log('📋 Dropping table: kurikulum');
  db.run(`DROP TABLE IF EXISTS kurikulum`, (err) => {
    if (err) {
      console.error('   ❌ Error dropping kurikulum:', err.message);
    } else {
      console.log('   ✅ kurikulum table dropped successfully');
    }
  });

  console.log('\n✅ Selesai! Kedua tabel telah dihapus dari database.');
  
  // Tutup koneksi database
  setTimeout(() => {
    db.close((err) => {
      if (err) {
        console.error('Error closing database:', err.message);
      } else {
        console.log('Database connection closed.');
      }
    });
  }, 1000);
});
