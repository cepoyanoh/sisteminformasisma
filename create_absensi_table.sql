-- SQL untuk membuat tabel absensi
-- Jalankan di SQLite console atau aplikasi database viewer

CREATE TABLE IF NOT EXISTS absensi (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  siswa_id INTEGER NOT NULL,
  kelas_id INTEGER NOT NULL,
  tanggal DATE NOT NULL,
  status_kehadiran TEXT NOT NULL DEFAULT 'hadir' CHECK(status_kehadiran IN ('hadir', 'sakit', 'izin', 'alpa')),
  keterangan TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (siswa_id) REFERENCES siswa(id),
  FOREIGN KEY (kelas_id) REFERENCES kelas(id)
);

-- Index untuk performa query
CREATE INDEX IF NOT EXISTS idx_absensi_tanggal ON absensi(tanggal);
CREATE INDEX IF NOT EXISTS idx_absensi_kelas ON absensi(kelas_id);
CREATE INDEX IF NOT EXISTS idx_absensi_siswa ON absensi(siswa_id);