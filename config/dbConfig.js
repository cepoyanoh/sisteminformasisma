const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');

// Buat instance database
const dbPath = path.resolve(__dirname, '../database.db');
const db = new sqlite3.Database(dbPath);

// Inisialisasi database
db.serialize(() => {
  // Tabel users untuk authentication
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT CHECK(role IN ('super_admin', 'admin', 'guru', 'siswa')) NOT NULL,
    guru_id INTEGER,
    siswa_id INTEGER,
    is_active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (guru_id) REFERENCES guru (id),
    FOREIGN KEY (siswa_id) REFERENCES siswa (id)
  )`);

  // Tabel guru
  db.run(`CREATE TABLE IF NOT EXISTS guru (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nip TEXT UNIQUE NOT NULL,
    nama_guru TEXT NOT NULL,
    jenis_kelamin TEXT CHECK( jenis_kelamin IN ('Laki-laki', 'Perempuan') ),
    tanggal_lahir DATE,
    alamat TEXT,
    nomor_telepon TEXT,
    email TEXT UNIQUE
  )`);

  // Tabel mata pelajaran (diperbarui untuk menambahkan kolom guru_pengampu dan is_mapel_pilihan)
  db.run(`CREATE TABLE IF NOT EXISTS mata_pelajaran (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    kode_mapel TEXT UNIQUE NOT NULL,
    nama_mapel TEXT NOT NULL,
    kategori TEXT NOT NULL,
    kelas INTEGER NOT NULL,
    jam_pembelajaran INTEGER NOT NULL,
    guru_pengampu INTEGER,
    is_mapel_pilihan INTEGER DEFAULT 0,
    FOREIGN KEY (guru_pengampu) REFERENCES guru (id)
  )`);

  // Add column if it doesn't exist (for existing databases)
  db.run(`ALTER TABLE mata_pelajaran ADD COLUMN is_mapel_pilihan INTEGER DEFAULT 0`, (err) => {
    if (err && !err.message.includes('duplicate column')) {
      console.error('Error adding is_mapel_pilihan column:', err);
    }
  });

  // Tabel kelas (diperbarui untuk menghubungkan wali_kelas ke ID guru)
  db.run(`CREATE TABLE IF NOT EXISTS kelas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nama_kelas TEXT NOT NULL,
    jurusan TEXT,
    wali_kelas INTEGER,
    tahun_pelajaran TEXT NOT NULL,
    jumlah_siswa INTEGER DEFAULT 0,
    FOREIGN KEY (wali_kelas) REFERENCES guru (id)
  )`);

  // Tabel jurnal guru
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
    FOREIGN KEY (guru_id) REFERENCES guru (id),
    FOREIGN KEY (kelas_id) REFERENCES kelas (id),
    FOREIGN KEY (mapel_id) REFERENCES mata_pelajaran (id)
  )`);
});

module.exports = db;