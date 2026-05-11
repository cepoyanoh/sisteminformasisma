const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'database.db');
const db = new sqlite3.Database(dbPath);

console.log('Fixing typo: alpa → alpha\n');

db.run("UPDATE absensi SET status_kehadiran = 'alpha' WHERE status_kehadiran = 'alpa'", function(err) {
  if (err) {
    console.error('❌ Error:', err.message);
  } else {
    console.log(`✅ Fixed ${this.changes} records\n`);
  }
  
  db.get("SELECT COUNT(*) as alpha FROM absensi WHERE status_kehadiran = 'alpha'", (err, row) => {
    if (err) {
      console.error('❌ Error:', err.message);
    } else {
      console.log(`Total alpha records: ${row.alpha}`);
    }
    
    console.log('\n✅ Done! Refresh browser to see changes.');
    db.close();
    process.exit(0);
  });
});