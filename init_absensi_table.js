const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'database.db');
const db = new sqlite3.Database(dbPath);

const createAbsensiTable = `
CREATE TABLE IF NOT EXISTS absensi (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  siswa_id INTEGER NOT NULL,
  kelas_id INTEGER NOT NULL,
  tanggal DATE NOT NULL,
  status_kehadiran TEXT NOT NULL DEFAULT 'hadir' CHECK(status_kehadiran IN ('hadir', 'sakit', 'izin', 'alpa', 'alpha', 'tidak_hadir')),
  keterangan TEXT,
  mapel_id INTEGER,
  guru_id INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (siswa_id) REFERENCES siswa(id),
  FOREIGN KEY (kelas_id) REFERENCES kelas(id),
  FOREIGN KEY (mapel_id) REFERENCES mata_pelajaran(id),
  FOREIGN KEY (guru_id) REFERENCES guru(id)
);
`;

db.serialize(() => {
  db.run(createAbsensiTable, function(err) {
    if (err) {
      console.error('❌ Error creating absensi table:', err.message);
    } else {
      console.log('✅ Tabel absensi berhasil dibuat/diperiksa');
    }
    db.close();
  });
});

console.log('🚀 Inisialisasi tabel absensi...');