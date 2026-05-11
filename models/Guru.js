const db = require('../config/dbConfig');

// Model Guru
const Guru = {
  getAll: (callback) => {
    const sql = `SELECT * FROM guru ORDER BY nama_guru`;
    db.all(sql, [], callback);
  },

  getById: (id, callback) => {
    const sql = `SELECT * FROM guru WHERE id = ?`;
    db.get(sql, [id], callback);
  },

  create: (data, callback) => {
    const { nip, nama_guru, jenis_kelamin, tanggal_lahir, alamat, nomor_telepon, email } = data;
    const sql = `INSERT INTO guru (nip, nama_guru, jenis_kelamin, tanggal_lahir, alamat, nomor_telepon, email) VALUES (?, ?, ?, ?, ?, ?, ?)`;
    db.run(sql, [nip, nama_guru, jenis_kelamin, tanggal_lahir, alamat, nomor_telepon, email], function(err) {
      callback(err, { id: this.lastID });
    });
  },

  update: (id, data, callback) => {
    const { nip, nama_guru, jenis_kelamin, tanggal_lahir, alamat, nomor_telepon, email } = data;
    const sql = `UPDATE guru SET nip = ?, nama_guru = ?, jenis_kelamin = ?, tanggal_lahir = ?, alamat = ?, nomor_telepon = ?, email = ? WHERE id = ?`;
    db.run(sql, [nip, nama_guru, jenis_kelamin, tanggal_lahir, alamat, nomor_telepon, email, id], function(err) {
      callback(err);
    });
  },

  delete: (id, callback) => {
    const sql = `DELETE FROM guru WHERE id = ?`;
    db.run(sql, [id], function(err) {
      callback(err);
    });
  }
};

module.exports = Guru;