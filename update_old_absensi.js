const sqlite3 = require('sqlite3').verbose();
const path = require('path');

console.log(' Update Data Absensi Lama dengan Mapel & Guru Default\n');
console.log('='.repeat(70));

const dbPath = path.resolve(__dirname, 'database.db');
const db = new sqlite3.Database(dbPath);

// Step 1: Get first available mapel and guru
db.get('SELECT id FROM mata_pelajaran ORDER BY id LIMIT 1', (err, mapel) => {
  if (err) {
    console.error('❌ Error getting mapel:', err.message);
    return db.close();
  }
  
  if (!mapel) {
    console.log('⚠️  Tidak ada data mapel. Silakan tambah mapel dulu.\n');
    return db.close();
  }
  
  console.log(`✅ Found default mapel ID: ${mapel.id}`);
  
  db.get('SELECT id FROM guru ORDER BY id LIMIT 1', (err, guru) => {
    if (err) {
      console.error('❌ Error getting guru:', err.message);
      return db.close();
    }
    
    if (!guru) {
      console.log('⚠️  Tidak ada data guru. Silakan tambah guru dulu.\n');
      return db.close();
    }
    
    console.log(`✅ Found default guru ID: ${guru.id}\n`);
    
    // Step 2: Update absensi records that have NULL mapel_id or guru_id
    const sql = `
      UPDATE absensi 
      SET mapel_id = ?, 
          guru_id = ?
      WHERE mapel_id IS NULL OR guru_id IS NULL
    `;
    
    console.log('📝 Updating absensi records...\n');
    
    db.run(sql, [mapel.id, guru.id], function(err) {
      if (err) {
        console.error('❌ Error updating:', err.message);
        return db.close();
      }
      
      console.log(`✅ Updated ${this.changes} absensi records`);
      console.log(`   - mapel_id: ${mapel.id}`);
      console.log(`   - guru_id: ${guru.id}\n`);
      
      // Step 3: Verify
      db.get('SELECT COUNT(*) as total FROM absensi WHERE mapel_id IS NULL OR guru_id IS NULL', (err, row) => {
        if (err) {
          console.error('❌ Error verifying:', err.message);
        } else {
          console.log(`📊 Remaining records without mapel/guru: ${row.total}\n`);
        }
        
        console.log('='.repeat(70));
        console.log('✅ Migration complete!\n');
        console.log('Old absensi records now have default mapel and guru.');
        console.log('You can view them at: http://localhost:3000/absensi\n');
        console.log('='.repeat(70));
        
        db.close();
        process.exit(0);
      });
    });
  });
});