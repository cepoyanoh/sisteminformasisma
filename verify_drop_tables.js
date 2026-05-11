const db = require('./config/dbConfig');

console.log('🔍 Memverifikasi penghapusan tabel kurikulum dan jadwal_mengajar...\n');

db.serialize(() => {
  // Cek apakah tabel kurikulum masih ada
  console.log('📋 Checking table: kurikulum');
  db.get(`SELECT name FROM sqlite_master WHERE type='table' AND name='kurikulum'`, (err, row) => {
    if (err) {
      console.error('   ❌ Error checking kurikulum:', err.message);
    } else if (row) {
      console.log('   ⚠️  WARNING: Table kurikulum masih ada!');
    } else {
      console.log('   ✅ Table kurikulum berhasil dihapus');
    }
  });

  // Cek apakah tabel jadwal_mengajar masih ada
  console.log('📋 Checking table: jadwal_mengajar');
  db.get(`SELECT name FROM sqlite_master WHERE type='table' AND name='jadwal_mengajar'`, (err, row) => {
    if (err) {
      console.error('   ❌ Error checking jadwal_mengajar:', err.message);
    } else if (row) {
      console.log('   ⚠️  WARNING: Table jadwal_mengajar masih ada!');
    } else {
      console.log('   ✅ Table jadwal_mengajar berhasil dihapus');
    }
  });

  // Tampilkan semua tabel yang tersisa
  console.log('\n📊 Daftar tabel yang tersisa dalam database:');
  db.all(`SELECT name FROM sqlite_master WHERE type='table' ORDER BY name`, (err, rows) => {
    if (err) {
      console.error('❌ Error listing tables:', err.message);
    } else {
      rows.forEach((row, index) => {
        console.log(`   ${index + 1}. ${row.name}`);
      });
      console.log(`\n✅ Total: ${rows.length} tabel`);
    }
    
    // Tutup koneksi database
    setTimeout(() => {
      db.close((err) => {
        if (err) {
          console.error('Error closing database:', err.message);
        } else {
          console.log('\nDatabase connection closed.');
        }
      });
    }, 500);
  });
});
