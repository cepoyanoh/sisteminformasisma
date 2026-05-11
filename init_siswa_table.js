const db = require('./config/dbConfig');

// Script untuk membuat tabel siswa
const createSiswaTable = () => {
  const sql = `
    CREATE TABLE IF NOT EXISTS siswa (
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
    )
  `;
  
  db.run(sql, function(err) {
    if (err) {
      console.error('Error membuat tabel siswa:', err);
    } else {
      console.log('Tabel siswa berhasil dibuat atau sudah ada');
    }
  });
};

// Jalankan script
createSiswaTable();

module.exports = createSiswaTable;
