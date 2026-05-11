const db = require('./config/dbConfig');

// Script untuk menghapus kolom tahun_ajaran dan semester dari tabel nilai
const migrateNilaiTable = () => {
  console.log('🔄 Memulai migrasi tabel nilai...');
  
  // Langkah 1: Cek apakah tabel nilai ada
  db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='nilai'", (err, row) => {
    if (err) {
      console.error('❌ Error checking table:', err);
      return;
    }
    
    if (!row) {
      console.log('⚠️  Tabel nilai tidak ditemukan. Membuat tabel baru...');
      createNewTable();
      return;
    }
    
    console.log('✅ Tabel nilai ditemukan');
    
    // Langkah 2: Cek struktur tabel
    db.all("PRAGMA table_info(nilai)", (err, columns) => {
      if (err) {
        console.error('❌ Error getting table info:', err);
        return;
      }
      
      const hasTahunAjaran = columns.some(col => col.name === 'tahun_ajaran');
      const hasSemester = columns.some(col => col.name === 'semester');
      
      if (!hasTahunAjaran && !hasSemester) {
        console.log('✅ Kolom tahun_ajaran dan semester sudah tidak ada. Tidak perlu migrasi.');
        process.exit(0);
        return;
      }
      
      console.log('📋 Struktur tabel saat ini:');
      columns.forEach(col => {
        console.log(`   - ${col.name} (${col.type})${col.notnull ? ' NOT NULL' : ''}`);
      });
      
      // Langkah 3: Buat tabel baru tanpa kolom tahun_ajaran dan semester
      console.log('\n🔄 Membuat tabel nilai baru...');
      createNewTableWithMigration(columns);
    });
  });
};

const createNewTableWithMigration = (oldColumns) => {
  const sql = `
    CREATE TABLE IF NOT EXISTS nilai_new (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      siswa_id INTEGER NOT NULL,
      mapel_id INTEGER NOT NULL,
      guru_id INTEGER NOT NULL,
      kelas_id INTEGER NOT NULL,
      jenis_nilai VARCHAR(20) NOT NULL CHECK(jenis_nilai IN ('formatif', 'sumatif')),
      kategori VARCHAR(50) NOT NULL,
      nilai DECIMAL(5,2) NOT NULL CHECK(nilai >= 0 AND nilai <= 100),
      keterangan TEXT,
      tanggal_penilaian DATE NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (siswa_id) REFERENCES siswa(id) ON DELETE CASCADE,
      FOREIGN KEY (mapel_id) REFERENCES mata_pelajaran(id) ON DELETE CASCADE,
      FOREIGN KEY (guru_id) REFERENCES guru(id) ON DELETE CASCADE,
      FOREIGN KEY (kelas_id) REFERENCES kelas(id) ON DELETE CASCADE
    )
  `;
  
  db.run(sql, (err) => {
    if (err) {
      console.error('❌ Error creating new table:', err);
      return;
    }
    
    console.log('✅ Tabel nilai_new berhasil dibuat');
    
    // Langkah 4: Copy data dari tabel lama ke tabel baru
    console.log('🔄 Memindahkan data...');
    db.all("SELECT * FROM nilai", (err, rows) => {
      if (err) {
        console.error('❌ Error reading old data:', err);
        return;
      }
      
      console.log(`📊 Ditemukan ${rows.length} record untuk dipindahkan`);
      
      if (rows.length === 0) {
        finalizeMigration();
        return;
      }
      
      // Insert data satu per satu
      let inserted = 0;
      const insertStmt = db.prepare(`
        INSERT INTO nilai_new 
        (id, siswa_id, mapel_id, guru_id, kelas_id, jenis_nilai, kategori, nilai, keterangan, tanggal_penilaian, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      
      rows.forEach(row => {
        insertStmt.run(
          row.id,
          row.siswa_id,
          row.mapel_id,
          row.guru_id,
          row.kelas_id,
          row.jenis_nilai,
          row.kategori,
          row.nilai,
          row.keterangan || null,
          row.tanggal_penilaian,
          row.created_at || new Date().toISOString(),
          row.updated_at || new Date().toISOString(),
          (err) => {
            if (err) {
              console.error(`❌ Error inserting row ${row.id}:`, err);
            } else {
              inserted++;
              if (inserted === rows.length) {
                insertStmt.finalize(() => {
                  console.log(`✅ Berhasil memindahkan ${inserted} record`);
                  finalizeMigration();
                });
              }
            }
          }
        );
      });
    });
  });
};

const finalizeMigration = () => {
  // Langkah 5: Hapus tabel lama dan rename tabel baru
  console.log('🔄 Finalisasi migrasi...');
  
  db.run("DROP TABLE nilai", (err) => {
    if (err) {
      console.error('❌ Error dropping old table:', err);
      return;
    }
    
    console.log('✅ Tabel lama dihapus');
    
    db.run("ALTER TABLE nilai_new RENAME TO nilai", (err) => {
      if (err) {
        console.error('❌ Error renaming table:', err);
        return;
      }
      
      console.log('✅ Tabel baru diganti nama menjadi "nilai"');
      
      // Verifikasi
      verifyMigration();
    });
  });
};

const verifyMigration = () => {
  db.all("PRAGMA table_info(nilai)", (err, columns) => {
    if (err) {
      console.error('❌ Error verifying table:', err);
      return;
    }
    
    console.log('\n✅ Struktur tabel setelah migrasi:');
    columns.forEach(col => {
      console.log(`   - ${col.name} (${col.type})${col.notnull ? ' NOT NULL' : ''}`);
    });
    
    const hasTahunAjaran = columns.some(col => col.name === 'tahun_ajaran');
    const hasSemester = columns.some(col => col.name === 'semester');
    
    if (!hasTahunAjaran && !hasSemester) {
      console.log('\n✅✅✅ MIGRASI BERHASIL!');
      console.log('Kolom tahun_ajaran dan semester telah dihapus dari database.');
    } else {
      console.log('\n⚠️  Peringatan: Masih ada kolom yang seharusnya dihapus');
    }
    
    db.get("SELECT COUNT(*) as count FROM nilai", (err, row) => {
      if (err) {
        console.error('❌ Error counting records:', err);
      } else {
        console.log(`📊 Total record di tabel nilai: ${row.count}`);
      }
      console.log('\n✅ Proses migrasi selesai');
      process.exit(0);
    });
  });
};

const createNewTable = () => {
  const sql = `
    CREATE TABLE IF NOT EXISTS nilai (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      siswa_id INTEGER NOT NULL,
      mapel_id INTEGER NOT NULL,
      guru_id INTEGER NOT NULL,
      kelas_id INTEGER NOT NULL,
      jenis_nilai VARCHAR(20) NOT NULL CHECK(jenis_nilai IN ('formatif', 'sumatif')),
      kategori VARCHAR(50) NOT NULL,
      nilai DECIMAL(5,2) NOT NULL CHECK(nilai >= 0 AND nilai <= 100),
      keterangan TEXT,
      tanggal_penilaian DATE NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (siswa_id) REFERENCES siswa(id) ON DELETE CASCADE,
      FOREIGN KEY (mapel_id) REFERENCES mata_pelajaran(id) ON DELETE CASCADE,
      FOREIGN KEY (guru_id) REFERENCES guru(id) ON DELETE CASCADE,
      FOREIGN KEY (kelas_id) REFERENCES kelas(id) ON DELETE CASCADE
    )
  `;
  
  db.run(sql, (err) => {
    if (err) {
      console.error('❌ Error creating nilai table:', err);
    } else {
      console.log('✅ Tabel nilai berhasil dibuat');
    }
    process.exit(0);
  });
};

console.log('🚀 Memulai migrasi database untuk menghapus kolom tahun_ajaran dan semester...\n');
migrateNilaiTable();
