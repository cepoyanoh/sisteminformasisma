/**
 * Script untuk generate akun untuk satu siswa berdasarkan ID
 * Jalankan: node generate_siswa_user.js <siswa_id>
 * Contoh: node generate_siswa_user.js 1
 */

const User = require('./models/User');

const siswaId = process.argv[2];

if (!siswaId) {
  console.error(' Usage: node generate_siswa_user.js <siswa_id>');
  console.error('   Example: node generate_siswa_user.js 1');
  process.exit(1);
}

console.log(`🚀 Generating user account for Siswa ID: ${siswaId}...\n`);

User.createForSiswa(parseInt(siswaId), (err, result) => {
  if (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
  
  if (result.created) {
    console.log('✅ Account created successfully!');
    console.log(`   Name: ${result.nama}`);
    console.log(`   Username: ${result.username}`);
    console.log(`   Password: ${result.username} (same as username)`);
    console.log(`   Role: Siswa\n`);
    console.log('⚠️  IMPORTANT: Advise student to change password after first login!\n');
  } else {
    console.log('ℹ️  Account already exists');
    console.log(`   Username: ${result.username}`);
    console.log(`   Message: ${result.message}\n`);
  }
  
  process.exit(0);
});