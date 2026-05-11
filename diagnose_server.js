console.log(' Starting server diagnostic...\n');
console.log('='.repeat(60));

try {
  console.log('1. Loading environment...\n');
  require('dotenv').config();
  console.log('   ✅ dotenv loaded\n');

  console.log('2. Loading express...\n');
  const express = require('express');
  console.log('   ✅ express loaded\n');

  console.log('3. Loading models...\n');
  
  try {
    const Kelas = require('./models/Kelas');
    console.log('   ✅ Kelas loaded');
  } catch (e) {
    console.error('   ❌ Kelas failed:', e.message);
  }
  
  try {
    const MataPelajaran = require('./models/MataPelajaran');
    console.log('   ✅ MataPelajaran loaded');
  } catch (e) {
    console.error('   ❌ MataPelajaran failed:', e.message);
  }
  
  try {
    const Guru = require('./models/Guru');
    console.log('   ✅ Guru loaded');
  } catch (e) {
    console.error('   ❌ Guru failed:', e.message);
  }
  
  try {
    const JurnalGuru = require('./models/JurnalGuru');
    console.log('   ✅ JurnalGuru loaded');
  } catch (e) {
    console.error('   ❌ JurnalGuru failed:', e.message);
  }
  
  try {
    const Siswa = require('./models/Siswa');
    console.log('   ✅ Siswa loaded');
  } catch (e) {
    console.error('   ❌ Siswa failed:', e.message);
  }
  
  try {
    const Nilai = require('./models/Nilai');
    console.log('   ✅ Nilai loaded');
  } catch (e) {
    console.error('   ❌ Nilai failed:', e.message);
  }
  
  try {
    const Absensi = require('./models/Absensi');
    console.log('   ✅ Absensi loaded');
  } catch (e) {
    console.error('   ❌ Absensi failed:', e.message);
  }

  console.log('\n4. Loading routes...\n');
  
  try {
    require('./routes/mapel');
    console.log('   ✅ mapel routes loaded');
  } catch (e) {
    console.error('   ❌ mapel routes failed:', e.message);
  }
  
  try {
    require('./routes/kelas');
    console.log('   ✅ kelas routes loaded');
  } catch (e) {
    console.error('   ❌ kelas routes failed:', e.message);
  }
  
  try {
    require('./routes/guru');
    console.log('   ✅ guru routes loaded');
  } catch (e) {
    console.error('   ❌ guru routes failed:', e.message);
  }
  
  try {
    require('./routes/jurnal');
    console.log('   ✅ jurnal routes loaded');
  } catch (e) {
    console.error('   ❌ jurnal routes failed:', e.message);
  }
  
  try {
    require('./routes/siswa');
    console.log('   ✅ siswa routes loaded');
  } catch (e) {
    console.error('   ❌ siswa routes failed:', e.message);
  }
  
  try {
    require('./routes/nilai');
    console.log('   ✅ nilai routes loaded');
  } catch (e) {
    console.error('   ❌ nilai routes failed:', e.message);
  }
  
  try {
    require('./routes/absensi');
    console.log('   ✅ absensi routes loaded');
  } catch (e) {
    console.error('    absensi routes failed:', e.message);
    console.error('      Stack:', e.stack.split('\n').slice(0, 3).join('\n      '));
  }

  console.log('\n' + '='.repeat(60));
  console.log('✅ Diagnostic complete!\n');
  console.log('If all modules loaded successfully, try running:');
  console.log('   npm run dev\n');
  console.log('='.repeat(60));
  
} catch (error) {
  console.error('\n❌ CRITICAL ERROR:\n');
  console.error('   Message:', error.message);
  console.error('\n   Stack trace:');
  console.error(error.stack.split('\n').slice(0, 5).join('\n'));
  console.error('\n' + '='.repeat(60));
  console.error('This error is preventing the server from starting.');
  console.error('Please fix this before running the application.\n');
  console.error('='.repeat(60));
}

process.exit(0);