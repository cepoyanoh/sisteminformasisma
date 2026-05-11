/**
 * Script untuk generate akun untuk satu guru berdasarkan ID
 * Jalankan: node generate_guru_user.js <guru_id>
 * Contoh: node generate_guru_user.js 1
 */

const User = require('./models/User');

const guruId = process.argv[2];

if (!guruId) {
  console.error('❌ Usage: node generate_guru_user.js <guru_id>');
  console.error('   Example: node generate_guru_user.js 1');
  process.exit(1);
}

console.log(`🚀 Generating user account for Guru ID: ${guruId}...\n`);

User.createForGuru(parseInt(guruId), (err, result) => {
  if (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
  
  if (result.created) {
    console.log('✅ Account created successfully!');
    console.log(`   Name: ${result.nama}`);
    console.log(`   Username: ${result.username}`);
    console.log(`   Password: ${result.username} (same as username)`);
    console.log(`   Role: Guru\n`);
    console.log('⚠️  IMPORTANT: Advise teacher to change password after first login!\n');
  } else {
    console.log('ℹ️  Account already exists');
    console.log(`   Username: ${result.username}`);
    console.log(`   Message: ${result.message}\n`);
  }
  
  process.exit(0);
});