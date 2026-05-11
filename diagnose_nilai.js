const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database.db');
const db = new sqlite3.Database(dbPath);

console.log('\n🔍 DIAGNOSTIC FORM NILAI - CHECKING DATABASE...\n');

// Check if tables exist
const tables = ['nilai', 'siswa', 'mata_pelajaran', 'guru', 'kelas'];

let completed = 0;
const total = tables.length;

tables.forEach(tableName => {
  db.get(`SELECT name FROM sqlite_master WHERE type='table' AND name=?`, [tableName], (err, row) => {
    if (err) {
      console.log(`❌ Error checking ${tableName}:`, err.message);
    } else if (row) {
      // Table exists, check record count
      db.get(`SELECT COUNT(*) as count FROM ${tableName}`, (err, result) => {
        if (err) {
          console.log(`⚠️  ${tableName}: EXISTS but error counting - ${err.message}`);
        } else {
          const count = result.count;
          if (count > 0) {
            console.log(`✅ ${tableName}: EXISTS (${count} records)`);
          } else {
            console.log(`⚠️  ${tableName}: EXISTS but EMPTY (need at least 1 record)`);
          }
        }
        completed++;
        if (completed === total) {
          console.log('\n📋 SUMMARY:');
          console.log('- If any table shows "TIDAK ADA", run: node init_nilai_table.js');
          console.log('- If any table is EMPTY, add data through the respective menu');
          console.log('- After fixing, restart server and try accessing /nilai/create\n');
          db.close();
        }
      });
    } else {
      console.log(`❌ ${tableName}: TIDAK ADA`);
      completed++;
      if (completed === total) {
        console.log('\n💡 SOLUTION: Run "node init_nilai_table.js" to create missing tables');
        console.log('Then restart your server with: npm run dev\n');
        db.close();
      }
    }
  });
});
