/**
 * Script untuk generate akun otomatis untuk semua guru dan siswa
 * - Guru: Username & Password = NIP
 * - Siswa: Username & Password = NISN
 * 
 * Jalankan: node generate_all_users.js
 */

const User = require('./models/User');

console.log('🚀 Generating user accounts for all Guru and Siswa...\n');
console.log('📋 Credentials:');
console.log('   Guru: Username & Password = NIP');
console.log('   Siswa: Username & Password = NISN\n');

async function generateAllUsers() {
  try {
    console.log('📝 Generating Guru accounts...\n');
    
    const guruResults = await new Promise((resolve, reject) => {
      User.createAllGuruUsers((err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });
    
    console.log(`✅ Guru accounts:`);
    console.log(`   Total: ${guruResults.total}`);
    console.log(`   Created: ${guruResults.created}`);
    console.log(`   Skipped: ${guruResults.skipped}`);
    
    if (guruResults.details.length > 0) {
      console.log('\n   Details:');
      guruResults.details.forEach(detail => {
        if (detail.status === 'created') {
          console.log(`   ✅ ${detail.nama} - Username: ${detail.username}`);
        } else {
          console.log(`   ⏭️  ${detail.nama} - ${detail.message}`);
        }
      });
    }
    
    if (guruResults.errors.length > 0) {
      console.log('\n   Errors:');
      guruResults.errors.forEach(err => {
        console.log(`   ❌ ${err.nama}: ${err.error}`);
      });
    }
    
    console.log('\n' + '='.repeat(60) + '\n');
    console.log(' Generating Siswa accounts...\n');
    
    const siswaResults = await new Promise((resolve, reject) => {
      User.createAllSiswaUsers((err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });
    
    console.log(`✅ Siswa accounts:`);
    console.log(`   Total: ${siswaResults.total}`);
    console.log(`   Created: ${siswaResults.created}`);
    console.log(`   Skipped: ${siswaResults.skipped}`);
    
    if (siswaResults.details.length > 0) {
      console.log('\n   Details:');
      siswaResults.details.forEach(detail => {
        if (detail.status === 'created') {
          console.log(`   ✅ ${detail.nama} - Username: ${detail.username}`);
        } else {
          console.log(`   ⏭️  ${detail.nama} - ${detail.message}`);
        }
      });
    }
    
    if (siswaResults.errors.length > 0) {
      console.log('\n   Errors:');
      siswaResults.errors.forEach(err => {
        console.log(`   ❌ ${err.nama}: ${err.error}`);
      });
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('\n🎉 GENERATION COMPLETE!\n');
    console.log('📊 Summary:');
    console.log(`   Total accounts created: ${guruResults.created + siswaResults.created}`);
    console.log(`   - Guru: ${guruResults.created}`);
    console.log(`   - Siswa: ${siswaResults.created}`);
    console.log(`   Already exist: ${guruResults.skipped + siswaResults.skipped}`);
    console.log(`   Errors: ${guruResults.errors.length + siswaResults.errors.length}\n`);
    
    console.log('🔐 Login Instructions:');
    console.log('   Guru: Use NIP as username and password');
    console.log('   Siswa: Use NISN as username and password\n');
    
    console.log('⚠️  IMPORTANT:');
    console.log('   Advise all teachers and students to change their passwords after first login!\n');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

generateAllUsers();