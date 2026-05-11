const db = require('./config/dbConfig');

console.log('\n' + '='.repeat(70));
console.log('🔄 MIGRATION: Mengubah Status "Alpha/Alpa" menjadi "Tidak Hadir"');
console.log('='.repeat(70) + '\n');

// Step 1: Check current status distribution
console.log('Step 1: Checking current status distribution...\n');

db.all('SELECT status_kehadiran, COUNT(*) as count FROM absensi GROUP BY status_kehadiran ORDER BY status_kehadiran', [], (err, rows) => {
  if (err) {
    console.error('❌ Error:', err.message);
    db.close();
    return;
  }
  
  console.log('📊 Current Status Distribution:');
  rows.forEach(row => {
    console.log(`   ${row.status_kehadiran}: ${row.count}`);
  });
  console.log('');
  
  // Count alpha/alpa records
  const alphaCount = rows.filter(r => r.status_kehadiran === 'alpha').length > 0 ? 
    rows.find(r => r.status_kehadiran === 'alpha').count : 0;
  const alpaCount = rows.filter(r => r.status_kehadiran === 'alpa').length > 0 ? 
    rows.find(r => r.status_kehadiran === 'alpa').count : 0;
  const totalToMigrate = alphaCount + alpaCount;
  
  if (totalToMigrate === 0) {
    console.log('✅ No records to migrate. All data is already using new format!\n');
    db.close();
    return;
  }
  
  console.log(`📋 Found ${totalToMigrate} records to migrate:`);
  console.log(`   - "alpha": ${alphaCount} records`);
  console.log(`   - "alpa": ${alpaCount} records\n`);
  
  // Step 2: Migrate alpha/alpa to tidak_hadir
  console.log('Step 2: Migrating "alpha" and "alpa" to "tidak_hadir"...\n');
  
  db.run(`UPDATE absensi SET status_kehadiran = 'tidak_hadir' WHERE status_kehadiran IN ('alpha', 'alpa')`, function(err) {
    if (err) {
      console.error('❌ Error migrating:', err.message);
      db.close();
      return;
    }
    
    console.log(`✅ Successfully migrated ${this.changes} records`);
    console.log('   - Changed: "alpha" → "tidak_hadir"');
    console.log('   - Changed: "alpa" → "tidak_hadir"\n');
    
    // Step 3: Verify the migration
    console.log('Step 3: Verifying the migration...\n');
    
    db.all('SELECT status_kehadiran, COUNT(*) as count FROM absensi GROUP BY status_kehadiran ORDER BY status_kehadiran', [], (err, rows) => {
      if (err) {
        console.error('❌ Error:', err.message);
        db.close();
        return;
      }
      
      console.log('📊 Status Distribution After Migration:');
      rows.forEach(row => {
        console.log(`   ${row.status_kehadiran}: ${row.count}`);
      });
      console.log('');
      
      // Step 4: Show sample migrated records
      console.log('Step 4: Sample migrated records...\n');
      
      db.all(`
        SELECT a.id, s.nama_siswa, s.nis, k.nama_kelas, a.tanggal, a.status_kehadiran
        FROM absensi a
        LEFT JOIN siswa s ON a.siswa_id = s.id
        LEFT JOIN kelas k ON a.kelas_id = k.id
        WHERE a.status_kehadiran = 'tidak_hadir'
        ORDER BY a.tanggal DESC
        LIMIT 5
      `, [], (err, sampleRecords) => {
        if (err) {
          console.error('❌ Error:', err.message);
          db.close();
          return;
        }
        
        if (sampleRecords.length > 0) {
          console.log(`✅ Sample of migrated records:\n`);
          sampleRecords.forEach((record, index) => {
            console.log(`   ${index + 1}. ${record.nama_siswa} (NIS: ${record.nis})`);
            console.log(`      Kelas: ${record.nama_kelas || 'N/A'}`);
            console.log(`      Tanggal: ${record.tanggal}`);
            console.log(`      Status: ${record.status_kehadiran}\n`);
          });
        }
        
        console.log('='.repeat(70));
        console.log('✨ MIGRATION COMPLETE!');
        console.log('='.repeat(70));
        console.log('\n Next Steps:');
        console.log('   1. Restart server: npm start');
        console.log('   2. Test input absensi with "Tidak Hadir" button');
        console.log('   3. Verify data is saved correctly\n');
        
        db.close();
      });
    });
  });
});
