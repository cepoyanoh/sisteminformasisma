const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'database.db');
const db = new sqlite3.Database(dbPath);

console.log('🚀 Initializing all database tables...\n');

db.serialize(() => {
  // 2. Tabel guru
  console.log('📋 Creating table: guru');
  db.run(`CREATE TABLE IF NOT EXISTS guru (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nip TEXT UNIQUE NOT NULL,
    nama_guru TEXT NOT NULL,
    jenis_kelamin TEXT CHECK(jenis_kelamin IN ('Laki-laki', 'Perempuan')),
    tanggal_lahir DATE,
    alamat TEXT,
    nomor_telepon TEXT,
    email TEXT UNIQUE
  )`, (err) => {
    if (err) console.error('   ❌ Error:', err.message);
    else console.log('   ✅ guru table created');
  });

  // 3. Tabel mata_pelajaran
  console.log('📋 Creating table: mata_pelajaran');
  db.run(`CREATE TABLE IF NOT EXISTS mata_pelajaran (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    kode_mapel TEXT UNIQUE NOT NULL,
    nama_mapel TEXT NOT NULL,
    kategori TEXT NOT NULL,
    kelas INTEGER NOT NULL,
    jam_pembelajaran INTEGER NOT NULL,
    kurikulum_id INTEGER,
    guru_pengampu INTEGER,
    is_mapel_pilihan INTEGER DEFAULT 0,
    FOREIGN KEY (guru_pengampu) REFERENCES guru(id)
  )`, (err) => {
    if (err) console.error('   ❌ Error:', err.message);
    else console.log('   ✅ mata_pelajaran table created');
  });

  // 4. Tabel kelas
  console.log('📋 Creating table: kelas');
  db.run(`CREATE TABLE IF NOT EXISTS kelas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nama_kelas TEXT NOT NULL,
    jurusan TEXT,
    wali_kelas INTEGER,
    tahun_pelajaran TEXT NOT NULL,
    jumlah_siswa INTEGER DEFAULT 0,
    FOREIGN KEY (wali_kelas) REFERENCES guru(id)
  )`, (err) => {
    if (err) console.error('   ❌ Error:', err.message);
    else console.log('   ✅ kelas table created');
  });

  // 5. Tabel siswa
  console.log('📋 Creating table: siswa');
  db.run(`CREATE TABLE IF NOT EXISTS siswa (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nis VARCHAR(20),
    nisn VARCHAR(20),
    nama_siswa VARCHAR(100) NOT NULL,
    jenis_kelamin VARCHAR(10),
    tempat_lahir VARCHAR(100),
    tanggal_lahir DATE,
    alamat TEXT,
    nomor_telepon VARCHAR(20),
    kelas_id INTEGER,
    tahun_ajaran VARCHAR(20),
    status VARCHAR(20) DEFAULT 'aktif',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (kelas_id) REFERENCES kelas(id)
  )`, (err) => {
    if (err) console.error('   ❌ Error:', err.message);
    else console.log('   ✅ siswa table created');
  });

  // 6. Tabel nilai
  console.log('📋 Creating table: nilai');
  db.run(`CREATE TABLE IF NOT EXISTS nilai (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    siswa_id INTEGER NOT NULL,
    mapel_id INTEGER NOT NULL,
    kelas_id INTEGER NOT NULL,
    jenis_nilai TEXT NOT NULL,
    nilai REAL NOT NULL,
    keterangan TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (siswa_id) REFERENCES siswa(id),
    FOREIGN KEY (mapel_id) REFERENCES mata_pelajaran(id),
    FOREIGN KEY (kelas_id) REFERENCES kelas(id)
  )`, (err) => {
    if (err) console.error('   ❌ Error:', err.message);
    else console.log('   ✅ nilai table created');
  });

  // 7. Tabel absensi
  console.log('📋 Creating table: absensi');
  db.run(`CREATE TABLE IF NOT EXISTS absensi (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    siswa_id INTEGER NOT NULL,
    kelas_id INTEGER NOT NULL,
    tanggal DATE NOT NULL,
    mapel_id INTEGER,
    guru_id INTEGER,
    status_kehadiran TEXT NOT NULL DEFAULT 'hadir' CHECK(status_kehadiran IN ('hadir', 'sakit', 'izin', 'alpa')),
    keterangan TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (siswa_id) REFERENCES siswa(id),
    FOREIGN KEY (kelas_id) REFERENCES kelas(id),
    FOREIGN KEY (mapel_id) REFERENCES mata_pelajaran(id),
    FOREIGN KEY (guru_id) REFERENCES guru(id)
  )`, (err) => {
    if (err) console.error('   ❌ Error:', err.message);
    else console.log('   ✅ absensi table created');
  });

  // 8. Tabel jurnal_guru
  console.log('📋 Creating table: jurnal_guru');
  db.run(`CREATE TABLE IF NOT EXISTS jurnal_guru (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    guru_id INTEGER NOT NULL,
    tanggal DATE NOT NULL,
    jam_ke INTEGER NOT NULL,
    kelas_id INTEGER NOT NULL,
    mapel_id INTEGER NOT NULL,
    materi TEXT NOT NULL,
    metode_pembelajaran TEXT,
    jumlah_siswa INTEGER,
    hadir INTEGER DEFAULT 0,
    sakit INTEGER DEFAULT 0,
    izin INTEGER DEFAULT 0,
    alpha INTEGER DEFAULT 0,
    catatan TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (guru_id) REFERENCES guru(id),
    FOREIGN KEY (kelas_id) REFERENCES kelas(id),
    FOREIGN KEY (mapel_id) REFERENCES mata_pelajaran(id)
  )`, (err) => {
    if (err) console.error('   ❌ Error:', err.message);
    else console.log('   ✅ jurnal_guru table created');
  });

  console.log('\n✅ All tables initialized successfully!');
  console.log('🎉 Database is ready to use.\n');
  
  // Close database after a short delay to ensure all operations complete
  setTimeout(() => {
    db.close((err) => {
      if (err) console.error('Error closing database:', err);
      else console.log('Database connection closed.');
      process.exit(0);
    });
  }, 1000);
});
