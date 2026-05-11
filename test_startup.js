console.log('🧪 Testing basic app startup...\n');

try {
  console.log('1. Loading dotenv...');
  require('dotenv').config();
  console.log('   ✅ OK\n');

  console.log('2. Loading express...');
  const express = require('express');
  console.log('   ✅ OK\n');

  console.log('3. Loading database config...');
  const db = require('./config/dbConfig');
  console.log('   ✅ OK\n');

  console.log('4. Testing database connection...');
  db.get('SELECT 1 as test', (err, row) => {
    if (err) {
      console.error('   ❌ Database error:', err.message);
    } else {
      console.log('   ✅ Database connected');
      console.log('   Test result:', row);
    }
    
    console.log('\n5. Loading models...');
    try {
      require('./models/Kelas');
      console.log('   ✅ Kelas');
    } catch (e) {
      console.error('   ❌ Kelas:', e.message);
    }
    
    try {
      require('./models/Guru');
      console.log('   ✅ Guru');
    } catch (e) {
      console.error('   ❌ Guru:', e.message);
    }
    
    try {
      require('./models/Siswa');
      console.log('   ✅ Siswa');
    } catch (e) {
      console.error('   ❌ Siswa:', e.message);
    }
    
    try {
      require('./models/Nilai');
      console.log('   ✅ Nilai');
    } catch (e) {
      console.error('   ❌ Nilai:', e.message);
    }
    
    try {
      require('./models/Absensi');
      console.log('   ✅ Absensi');
    } catch (e) {
      console.error('   ❌ Absensi:', e.message);
    }
    
    console.log('\n✅ Basic tests completed!');
    console.log('💡 If all checks passed, try: npm start');
    
    process.exit(0);
  });
} catch (error) {
  console.error('\n❌ CRITICAL ERROR:', error.message);
  console.error('Stack:', error.stack);
  process.exit(1);
}
