const db = require('./config/dbConfig');

console.log('🧪 Testing insert nilai...\n');

// Test data
const testData = {
  siswa_id: 1,
  mapel_id: 1,
  guru_id: 1,
  kelas_id: 1,
  jenis_nilai: 'formatif',
  kategori: 'UH1',
  nilai: 85.50,
  keterangan: 'Test nilai setelah migrasi',
  tanggal_penilaian: new Date().toISOString().split('T')[0]
};

// First, check if we have the required reference data
console.log('📋 Checking reference data...');

db.get("SELECT COUNT(*) as count FROM siswa", (err, row) => {
  if (err) {
    console.error('❌ Error checking siswa:', err);
    return;
  }
  console.log(`   Siswa records: ${row.count}`);
});

db.get("SELECT COUNT(*) as count FROM mata_pelajaran", (err, row) => {
  if (err) {
    console.error('❌ Error checking mata_pelajaran:', err);
    return;
  }
  console.log(`   Mata Pelajaran records: ${row.count}`);
});

db.get("SELECT COUNT(*) as count FROM guru", (err, row) => {
  if (err) {
    console.error('❌ Error checking guru:', err);
    return;
  }
  console.log(`   Guru records: ${row.count}`);
});

db.get("SELECT COUNT(*) as count FROM kelas", (err, row) => {
  if (err) {
    console.error('❌ Error checking kelas:', err);
    return;
  }
  console.log(`   Kelas records: ${row.count}\n`);
  
  // Check table structure
  console.log('📊 Checking nilai table structure...');
  db.all("PRAGMA table_info(nilai)", (err, columns) => {
    if (err) {
      console.error('❌ Error checking table structure:', err);
      return;
    }
    
    console.log('   Columns in nilai table:');
    columns.forEach(col => {
      console.log(`     - ${col.name} (${col.type})${col.notnull ? ' NOT NULL' : ''}`);
    });
    
    const hasTahunAjaran = columns.some(col => col.name === 'tahun_ajaran');
    const hasSemester = columns.some(col => col.name === 'semester');
    
    if (hasTahunAjaran || hasSemester) {
      console.log('\n⚠️  WARNING: Table still has tahun_ajaran or semester columns!');
      console.log('Please run: node init_nilai_table.js\n');
      process.exit(1);
    }
    
    console.log('\n✅ Table structure is correct (no tahun_ajaran/semester)\n');
    
    // Try to insert test data
    console.log('🧪 Attempting to insert test nilai...');
    
    const sql = `INSERT INTO nilai 
      (siswa_id, mapel_id, guru_id, kelas_id, jenis_nilai, kategori, nilai, keterangan, tanggal_penilaian) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    
    db.run(sql, [
      testData.siswa_id,
      testData.mapel_id,
      testData.guru_id,
      testData.kelas_id,
      testData.jenis_nilai,
      testData.kategori,
      testData.nilai,
      testData.keterangan,
      testData.tanggal_penilaian
    ], function(err) {
      if (err) {
        console.error('\n❌ INSERT FAILED!');
        console.error('Error:', err.message);
        console.error('\nThis might be because:');
        console.error('1. Reference data (siswa, mapel, guru, kelas) does not exist');
        console.error('2. Foreign key constraint violation');
        console.error('3. Other database constraints\n');
        process.exit(1);
      } else {
        console.log('✅ INSERT SUCCESSFUL!');
        console.log(`   New record ID: ${this.lastID}\n`);
        
        // Verify the inserted data
        db.get("SELECT * FROM nilai WHERE id = ?", [this.lastID], (err, row) => {
          if (err) {
            console.error('❌ Error verifying data:', err);
          } else {
            console.log('📄 Inserted data:');
            console.log(`   ID: ${row.id}`);
            console.log(`   Siswa ID: ${row.siswa_id}`);
            console.log(`   Mapel ID: ${row.mapel_id}`);
            console.log(`   Guru ID: ${row.guru_id}`);
            console.log(`   Kelas ID: ${row.kelas_id}`);
            console.log(`   Jenis Nilai: ${row.jenis_nilai}`);
            console.log(`   Kategori: ${row.kategori}`);
            console.log(`   Nilai: ${row.nilai}`);
            console.log(`   Tanggal: ${row.tanggal_penilaian}`);
            console.log(`   Keterangan: ${row.keterangan}\n`);
            
            // Clean up test data
            console.log('🗑️  Cleaning up test data...');
            db.run("DELETE FROM nilai WHERE id = ?", [this.lastID], (err) => {
              if (err) {
                console.error('⚠️  Could not delete test data:', err.message);
              } else {
                console.log('✅ Test data cleaned up\n');
              }
              
              console.log('✅✅✅ ALL TESTS PASSED!');
              console.log('The nilai input feature should now work correctly.\n');
              process.exit(0);
            });
          }
        });
      }
    });
  });
});
