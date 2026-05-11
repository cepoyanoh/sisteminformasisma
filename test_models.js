// Script untuk test apakah semua model dapat di-load dengan benar
console.log('🔍 Testing model imports...\n');

try {
  console.log('1. Loading Kelas model...');
  const Kelas = require('./models/Kelas');
  console.log('   ✅ Kelas loaded\n');

  console.log('2. Loading MataPelajaran model...');
  const MataPelajaran = require('./models/MataPelajaran');
  console.log('   ✅ MataPelajaran loaded\n');

  console.log('3. Loading Guru model...');
  const Guru = require('./models/Guru');
  console.log('   ✅ Guru loaded\n');

  console.log('4. Loading JurnalGuru model...');
  const JurnalGuru = require('./models/JurnalGuru');
  console.log('   ✅ JurnalGuru loaded\n');

  console.log('5. Loading Siswa model...');
  const Siswa = require('./models/Siswa');
  console.log('   ✅ Siswa loaded\n');
  console.log('   Testing Siswa.getAllByKelas method...');
  if (typeof Siswa.getAllByKelas === 'function') {
    console.log('   ✅ Siswa.getAllByKelas exists\n');
  } else {
    console.log('   ❌ Siswa.getAllByKelas NOT FOUND!\n');
  }

  console.log('6. Loading Nilai model...');
  const Nilai = require('./models/Nilai');
  console.log('   ✅ Nilai loaded\n');

  console.log('8. Loading Absensi model...');
  const Absensi = require('./models/Absensi');
  console.log('   ✅ Absensi loaded\n');

  console.log('9. Testing database connection...\n');
  const db = require('./config/dbConfig');
  console.log('   ✅ Database connection OK\n');

  console.log('===========================================');
  console.log('✅ ALL MODELS LOADED SUCCESSFULLY!');
  console.log('===========================================\n');
  
  // Test database tables
  console.log(' Checking database tables...\n');
  
  db.all("SELECT name FROM sqlite_master WHERE type='table'", (err, tables) => {
    if (err) {
      console.error('❌ Error reading tables:', err.message);
    } else {
      console.log('Available tables:');
      tables.forEach(table => {
        console.log(`   - ${table.name}`);
      });
      console.log('\n✅ Database check complete!\n');
    }
    process.exit(0);
  });

} catch (error) {
  console.error('\n❌ ERROR LOADING MODELS:');
  console.error('   File:', error.stack.split('\n')[1]);
  console.error('   Message:', error.message);
  console.error('\n===========================================');
  console.error('❌ FIX THIS ERROR BEFORE STARTING SERVER');
  console.error('===========================================\n');
  process.exit(1);
}