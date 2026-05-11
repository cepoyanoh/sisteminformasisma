const db = require('../config/dbConfig');

// Model MataPelajaran
const MataPelajaran = {
  getAll: (callback) => {
    const sql = `
      SELECT mp.*, g.nama_guru as guru_pengampu_nama
      FROM mata_pelajaran mp
      LEFT JOIN guru g ON mp.guru_pengampu = g.id
      ORDER BY mp.nama_mapel
    `;
    db.all(sql, [], callback);
  },

  // Get only elective subjects (mapel pilihan)
  getMapelPilihan: (callback) => {
    const sql = `
      SELECT mp.*, g.nama_guru as guru_pengampu_nama
      FROM mata_pelajaran mp
      LEFT JOIN guru g ON mp.guru_pengampu = g.id
      WHERE mp.is_mapel_pilihan = 1
      ORDER BY mp.nama_mapel
    `;
    db.all(sql, [], callback);
  },

  // Get only regular subjects (mapel wajib)
  getMapelWajib: (callback) => {
    const sql = `
      SELECT mp.*, g.nama_guru as guru_pengampu_nama
      FROM mata_pelajaran mp
      LEFT JOIN guru g ON mp.guru_pengampu = g.id
      WHERE mp.is_mapel_pilihan = 0
      ORDER BY mp.nama_mapel
    `;
    db.all(sql, [], callback);
  },

  getById: (id, callback) => {
    const sql = `
      SELECT mp.*, g.nama_guru as guru_pengampu_nama
      FROM mata_pelajaran mp
      LEFT JOIN guru g ON mp.guru_pengampu = g.id
      WHERE mp.id = ?
    `;
    db.get(sql, [id], callback);
  },

  create: (data, callback) => {
    const { kode_mapel, nama_mapel, kategori, kelas, jam_pembelajaran, guru_pengampu, is_mapel_pilihan } = data;
    const sql = `INSERT INTO mata_pelajaran (kode_mapel, nama_mapel, kategori, kelas, jam_pembelajaran, guru_pengampu, is_mapel_pilihan) VALUES (?, ?, ?, ?, ?, ?, ?)`;
    // Gunakan kode_mapel dari parameter atau generate dari nama_mapel
    const kodeMapel = kode_mapel || nama_mapel.substring(0, 3).toUpperCase();
    const isPilihan = is_mapel_pilihan || 0;
    db.run(sql, [kodeMapel, nama_mapel, kategori, kelas, jam_pembelajaran, guru_pengampu || null, isPilihan], function(err) {
      callback(err, { id: this.lastID });
    });
  },

  update: (id, data, callback) => {
    const { kode_mapel, nama_mapel, kategori, kelas, jam_pembelajaran, guru_pengampu, is_mapel_pilihan } = data;
    const sql = `UPDATE mata_pelajaran SET kode_mapel = ?, nama_mapel = ?, kategori = ?, kelas = ?, jam_pembelajaran = ?, guru_pengampu = ?, is_mapel_pilihan = ? WHERE id = ?`;
    // Gunakan kode_mapel dari parameter atau generate dari nama_mapel
    const kodeMapel = kode_mapel || nama_mapel.substring(0, 3).toUpperCase();
    const isPilihan = is_mapel_pilihan || 0;
    db.run(sql, [kodeMapel, nama_mapel, kategori, kelas, jam_pembelajaran, guru_pengampu || null, isPilihan, id], function(err) {
      callback(err);
    });
  },

  delete: (id, callback) => {
    const sql = `DELETE FROM mata_pelajaran WHERE id = ?`;
    db.run(sql, [id], function(err) {
      callback(err);
    });
  }
};

module.exports = MataPelajaran;