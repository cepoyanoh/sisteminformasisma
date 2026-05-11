// Migration script untuk menambahkan kolom mapel_id dan guru_id ke tabel absensi
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'database.db');
const db = new sqlite3.Database(dbPath);

console.log(' Adding mapel_id and guru_id columns to absensi table...\n');

db.serialize(() => {
  // Add mapel_id column
  db.run(`ALTER TABLE absensi ADD COLUMN mapel_id INTEGER`, (err) => {
    if (err && !err.message.includes('duplicate column')) {
      console.error('❌ Error adding mapel_id:', err.message);
    } else if (!err) {
      console.log('✅ Added mapel_id column');
    }
  });

  // Add guru_id column
  db.run(`ALTER TABLE absensi ADD COLUMN guru_id INTEGER`, (err) => {
    if (err && !err.message.includes('duplicate column')) {
      console.error('❌ Error adding guru_id:', err.message);
    } else if (!err) {
      console.log('✅ Added guru_id column');
    }
  });

  // Add foreign key constraints (SQLite doesn't enforce by default, but good for documentation)
  setTimeout(() => {
    console.log('\n✅ Migration complete!');
    console.log('   - mapel_id column added');
    console.log('   - guru_id column added');
    db.close();
  }, 500);
});