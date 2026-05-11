const sqlite3 = require('sqlite3').verbose();
const path = require('path');

console.log(' Checking Master Data for Absensi\n');
console.log('='.repeat(60));

const dbPath = path.resolve(__dirname, 'database.db');
const db = new sqlite3.Database(dbPath);

let hasError = false;

// 1. Check Mata Pelajaran
console.log('1. Checking Mata Pelajaran...\n');
db.all('SELECT id, nama_mapel FROM mata_pelajaran', (err, rows) => {
  if (err) {
    console.error('   ❌ Error:', err.message);
    hasError = true;
  } else {
    console.log(`   ✅ Found ${rows.length} mata pelajaran:`);
    rows.forEach(row => {
      console.log(`      - ${row.id}: ${row.nama_mapel}`);
    });
  }
  
  console.log('');
  
  // 2. Check Guru
  console.log('2. Checking Guru...\n');
  db.all('SELECT id, nama_guru FROM guru', (err, rows) => {
    if (err) {
      console.error('   ❌ Error:', err.message);
      hasError = true;
    } else {
      console.log(`   ✅ Found ${rows.length} guru:`);
      rows.forEach(row => {
        console.log(`      - ${row.id}: ${row.nama_guru}`);
      });
    }
    
    console.log('');
    console.log('3. Checking Kelas...\n');
    db.all('SELECT id, nama_kelas FROM kelas', (err, rows) => {
      if (err) {
        console.error('   ❌ Error:', err.message);
        hasError = true;
      } else {
        console.log(`   ✅ Found ${rows.length} kelas:`);
        rows.forEach(row => {
          console.log(`      - ${row.id}: ${row.nama_kelas}`);
        });
      }
      
      console.log('');
      console.log('4. Checking Siswa...\n');
      db.all('SELECT COUNT(*) as total FROM siswa WHERE status = "aktif"', (err, row) => {
        if (err) {
          console.error('   ❌ Error:', err.message);
          hasError = true;
        } else {
          console.log(`   ✅ Found ${row.total} siswa aktif`);
        }
        
        console.log('\n' + '='.repeat(60));
        
        if (hasError) {
          console.log('❌ Some checks failed. Please fix the errors above.\n');
        } else {
          console.log('✅ All master data is ready!\n');
          console.log('You can now use the absensi input form.');
        }
        
        console.log('='.repeat(60));
        db.close();
        process.exit(0);
      });
    });
  });
});