const sqlite3 = require('sqlite3').verbose();
const path = require('path');

console.log(' Fix Typo: Mengubah "alpa" menjadi "alpha" di Data Absensi\n');
console.log('='.repeat(70));

const dbPath = path.resolve(__dirname, 'database.db');
const db = new sqlite3.Database(dbPath);

// Check how many records have 'alpa'
db.get("SELECT COUNT(*) as total FROM absensi WHERE status_kehadiran = 'alpa'", (err, row) => {
  if (err) {
    console.error('❌ Error checking data:', err.message);
    return db.close();
  }
  
  console.log(`📊 Found ${row.total} records with status 'alpa' (typo)\n`);
  
  if (row.total === 0) {
    console.log('✅ No records to fix. All data is correct!\n');
    console.log('='.repeat(70));
    return db.close();
  }
  
  // Update 'alpa' to 'alpha'
  const sql = `UPDATE absensi SET status_kehadiran = 'alpha' WHERE status_kehadiran = 'alpa'`;
  
  console.log('🔄 Updating records...\n');
  
  db.run(sql, [], function(err) {
    if (err) {
      console.error('❌ Error updating:', err.message);
      return db.close();
    }
    
    console.log(`✅ Successfully updated ${this.changes} records`);
    console.log('   - Changed: "alpa" → "alpha"\n');
    
    // Verify
    db.get("SELECT COUNT(*) as alpha FROM absensi WHERE status_kehadiran = 'alpha'", (err, row) => {
      if (err) {
        console.error('❌ Error verifying:', err.message);
      } else {
        console.log(`📈 Total records with status 'alpha': ${row.alpha}\n`);
      }
      
      console.log('='.repeat(70));
      console.log('✅ Typo fix complete!\n');
      console.log('All "alpa" statuses have been corrected to "alpha".');
      console.log('You can view them at: http://localhost:3000/absensi\n');
      console.log('='.repeat(70));
      
      db.close();
      process.exit(0);
    });
  });
});