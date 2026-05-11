console.log('Testing file syntax...\n');

const filesToTest = [
  './models/Absensi.js',
  './routes/absensi.js',
  './app.js',
  './models/Siswa.js'
];

filesToTest.forEach(file => {
  try {
    console.log(`Loading ${file}...`);
    require(file);
    console.log(`  ✅ ${file} OK\n`);
  } catch (error) {
    console.error(`  ❌ ${file} ERROR:`);
    console.error(`     ${error.message}\n`);
  }
});

console.log('Done!\n');
process.exit(0);