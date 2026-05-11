const db = require('../config/dbConfig');

// Model JurnalGuru
const JurnalGuru = {
  getAll: (callback) => {
    const sql = `
      SELECT jg.*, g.nama_guru, k.nama_kelas, k.jumlah_siswa as kelas_jumlah_siswa, mp.nama_mapel 
      FROM jurnal_guru jg
      LEFT JOIN guru g ON jg.guru_id = g.id
      LEFT JOIN kelas k ON jg.kelas_id = k.id
      LEFT JOIN mata_pelajaran mp ON jg.mapel_id = mp.id
      ORDER BY jg.tanggal DESC, jg.jam_ke ASC
    `;
    db.all(sql, [], callback);
  },

  getById: (id, callback) => {
    const sql = `
      SELECT jg.*, g.nama_guru, k.nama_kelas, k.jumlah_siswa as kelas_jumlah_siswa, mp.nama_mapel 
      FROM jurnal_guru jg
      LEFT JOIN guru g ON jg.guru_id = g.id
      LEFT JOIN kelas k ON jg.kelas_id = k.id
      LEFT JOIN mata_pelajaran mp ON jg.mapel_id = mp.id
      WHERE jg.id = ?
    `;
    db.get(sql, [id], callback);
  },

  create: (data, callback) => {
    const { guru_id, tanggal, jam_ke, kelas_id, mapel_id, materi, metode_pembelajaran, jumlah_siswa, hadir, sakit, izin, alpha, catatan } = data;
    
    // Ambil jumlah siswa dari kelas jika tidak disediakan
    if (!jumlah_siswa || jumlah_siswa === 0) {
      const getJumlahSiswaSql = `SELECT jumlah_siswa FROM kelas WHERE id = ?`;
      db.get(getJumlahSiswaSql, [kelas_id], (err, kelas) => {
        if (err) {
          callback(err, null);
        } else {
          const finalJumlahSiswa = kelas ? kelas.jumlah_siswa : 0;
          const sql = `INSERT INTO jurnal_guru (guru_id, tanggal, jam_ke, kelas_id, mapel_id, materi, metode_pembelajaran, jumlah_siswa, hadir, sakit, izin, alpha, catatan) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
          db.run(sql, [guru_id, tanggal, jam_ke, kelas_id, mapel_id, materi, metode_pembelajaran, finalJumlahSiswa, hadir, sakit, izin, alpha, catatan], function(err) {
            callback(err, { id: this.lastID });
          });
        }
      });
    } else {
      const sql = `INSERT INTO jurnal_guru (guru_id, tanggal, jam_ke, kelas_id, mapel_id, materi, metode_pembelajaran, jumlah_siswa, hadir, sakit, izin, alpha, catatan) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
      db.run(sql, [guru_id, tanggal, jam_ke, kelas_id, mapel_id, materi, metode_pembelajaran, jumlah_siswa, hadir, sakit, izin, alpha, catatan], function(err) {
        callback(err, { id: this.lastID });
      });
    }
  },

  update: (id, data, callback) => {
    const { guru_id, tanggal, jam_ke, kelas_id, mapel_id, materi, metode_pembelajaran, jumlah_siswa, hadir, sakit, izin, alpha, catatan } = data;
    
    // Ambil jumlah siswa dari kelas jika tidak disediakan
    if (!jumlah_siswa || jumlah_siswa === 0) {
      const getJumlahSiswaSql = `SELECT jumlah_siswa FROM kelas WHERE id = ?`;
      db.get(getJumlahSiswaSql, [kelas_id], (err, kelas) => {
        if (err) {
          callback(err);
        } else {
          const finalJumlahSiswa = kelas ? kelas.jumlah_siswa : 0;
          const sql = `UPDATE jurnal_guru SET guru_id = ?, tanggal = ?, jam_ke = ?, kelas_id = ?, mapel_id = ?, materi = ?, metode_pembelajaran = ?, jumlah_siswa = ?, hadir = ?, sakit = ?, izin = ?, alpha = ?, catatan = ? WHERE id = ?`;
          db.run(sql, [guru_id, tanggal, jam_ke, kelas_id, mapel_id, materi, metode_pembelajaran, finalJumlahSiswa, hadir, sakit, izin, alpha, catatan, id], function(err) {
            callback(err);
          });
        }
      });
    } else {
      const sql = `UPDATE jurnal_guru SET guru_id = ?, tanggal = ?, jam_ke = ?, kelas_id = ?, mapel_id = ?, materi = ?, metode_pembelajaran = ?, jumlah_siswa = ?, hadir = ?, sakit = ?, izin = ?, alpha = ?, catatan = ? WHERE id = ?`;
      db.run(sql, [guru_id, tanggal, jam_ke, kelas_id, mapel_id, materi, metode_pembelajaran, jumlah_siswa, hadir, sakit, izin, alpha, catatan, id], function(err) {
        callback(err);
      });
    }
  },

  delete: (id, callback) => {
    const sql = `DELETE FROM jurnal_guru WHERE id = ?`;
    db.run(sql, [id], function(err) {
      callback(err);
    });
  },

  getByGuruId: (guruId, callback) => {
    const sql = `
      SELECT jg.*, g.nama_guru, k.nama_kelas, k.jumlah_siswa as kelas_jumlah_siswa, mp.nama_mapel 
      FROM jurnal_guru jg
      LEFT JOIN guru g ON jg.guru_id = g.id
      LEFT JOIN kelas k ON jg.kelas_id = k.id
      LEFT JOIN mata_pelajaran mp ON jg.mapel_id = mp.id
      WHERE jg.guru_id = ?
      ORDER BY jg.tanggal DESC, jg.jam_ke ASC
    `;
    db.all(sql, [guruId], callback);
  }
};

module.exports = JurnalGuru;