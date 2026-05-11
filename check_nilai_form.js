const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database.db');
const db = new sqlite3.Database(dbPath);

console.log('🔍 MEMERIKSA STATUS FORM TAMBAH NILAI...\n');

// Cek tabel yang dibutuhkan
const tablesToCheck = [
  'nilai',
  'siswa',
  'mata_pelajaran',
  'guru',
  'kelas'
];

let checkCount = 0;
const totalChecks = tablesToCheck.length + 1; // +1 untuk data count

function completeCheck() {
  checkCount++;
  if (checkCount === totalChecks) {
    console.log('\n✅ Pemeriksaan selesai!');
    db.close();
  }
}

// 1. Cek tabel nilai
console.log('1️⃣  Memeriksa tabel \'nilai\'...');
db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='nilai'", (err, row) => {
  if (err) {
    console.log('   ❌ Error:', err.message);
  } else if (row) {
    console.log('   ✅ Tabel nilai ADA');
    
    // Cek struktur tabel
    db.all("PRAGMA table_info(nilai)", (err, columns) => {
      if (err) {
        console.log('   ⚠️  Tidak dapat membaca struktur tabel');
      } else {
        console.log('    Kolom tabel:');
        columns.forEach(col => {
          console.log(`      - ${col.name} (${col.type})${col.notnull ? ' [REQUIRED]' : ''}`);
        });
      }
      completeCheck();
    });
  } else {
    console.log('   ❌ Tabel nilai TIDAK ADA');
    console.log('   💡 Solusi: Jalankan "node init_nilai_table.js"');
    completeCheck();
  }
});

// 2. Cek data master
const masterTables = [
  { name: 'siswa', label: 'Siswa' },
  { name: 'mata_pelajaran', label: 'Mata Pelajaran' },
  { name: 'guru', label: 'Guru' },
  { name: 'kelas', label: 'Kelas' }
];

let masterCheckCount = 0;

masterTables.forEach(table => {
  db.get(`SELECT COUNT(*) as count FROM ${table.name}`, (err, row) => {
    if (err) {
      console.log(`   ❌ Error cek ${table.label}:`, err.message);
    } else {
      const count = row ? row.count : 0;
      if (count > 0) {
        console.log(`   ✅ ${table.label}: ${count} record`);
      } else {
        console.log(`   ⚠️  ${table.label}: KOSONG (perlu ditambahkan minimal 1 data)`);
      }
    }
    masterCheckCount++;
    if (masterCheckCount === masterTables.length) {
      completeCheck();
    }
  });
});

console.log('\n2️⃣  Memeriksa data master...');
