const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

console.log(' ABSensi Table Diagnostic Tool\n');
console.log('='.repeat(60));

const dbPath = path.resolve(__dirname, 'database.db');

// Check if database file exists
if (!fs.existsSync(dbPath)) {
  console.error('❌ ERROR: Database file not found!');
  console.error(`   Expected path: ${dbPath}`);
  console.error('\n Make sure you have run the application at least once.');
  process.exit(1);
}

console.log(`✅ Database file found: ${dbPath}\n`);

const db = new sqlite3.Database(dbPath);

// 1. Check if absensi table exists
console.log('1. Checking if "absensi" table exists...\n');

db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='absensi'", (err, row) => {
  if (err) {
    console.error('❌ Error checking table:', err.message);
    db.close();
    process.exit(1);
  }
  
  if (!row) {
    console.log('❌ RESULT: Table "absensi" DOES NOT EXIST in database\n');
    console.log('='.repeat(60));
    console.log(' SOLUTION:\n');
    console.log('   Run the following command to create the table:');
    console.log('   node init_absensi_table.js\n');
    console.log('   Then restart your server:');
    console.log('   npm run dev\n');
    console.log('='.repeat(60));
    db.close();
    process.exit(1);
  }
  
  console.log('✅ RESULT: Table "absensi" EXISTS in database\n');
  
  // 2. Check table structure
  console.log('2. Checking table structure...\n');
  
  db.all("PRAGMA table_info(absensi)", (err, columns) => {
    if (err) {
      console.error('❌ Error reading columns:', err.message);
      db.close();
      process.exit(1);
    }
    
    console.log('📊 Table columns:');
    columns.forEach(col => {
      const isPK = col.pk ? ' 🔑 PRIMARY KEY' : '';
      const isNotNull = col.notnull ? ' NOT NULL' : '';
      const defaultVal = col.dflt_value ? ` DEFAULT ${col.dflt_value}` : '';
      console.log(`   - ${col.name} (${col.type})${isPK}${isNotNull}${defaultVal}`);
    });
    
    console.log('\n✅ Table structure looks good!\n');
    
    // 3. Count records
    console.log('3. Counting records...\n');
    
    db.get("SELECT COUNT(*) as total FROM absensi", (err, result) => {
      if (err) {
        console.error('❌ Error counting:', err.message);
        db.close();
        process.exit(1);
      }
      
      console.log(`📈 Total records: ${result.total}\n`);
      console.log('='.repeat(60));
      console.log('✅ ALL CHECKS PASSED!\n');
      console.log('The absensi table is ready to use.');
      console.log('You can now access: http://localhost:3000/absensi\n');
      console.log('='.repeat(60));
      
      db.close();
      process.exit(0);
    });
  });
});