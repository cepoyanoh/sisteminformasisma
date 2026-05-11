const db = require('../config/dbConfig');

// Model Kelas
const Kelas = {
  getAll: (callback) => {
    // Query dengan left join untuk mendapatkan data guru sebagai wali kelas
    // Kita perlu menangani kasus lama (wali_kelas sebagai string nama) dan baru (wali_kelas sebagai ID)
    const sql = `
      SELECT 
        k.*,
        CASE 
          WHEN g.id IS NOT NULL THEN g.nama_guru
          ELSE k.wali_kelas
        END AS wali_kelas_nama
      FROM kelas k
      LEFT JOIN guru g ON k.wali_kelas = g.id
      ORDER BY k.nama_kelas ASC
    `;
    db.all(sql, [], callback);
  },

  getById: (id, callback) => {
    const sql = `
      SELECT 
        k.*,
        CASE 
          WHEN g.id IS NOT NULL THEN g.nama_guru
          ELSE k.wali_kelas
        END AS wali_kelas_nama
      FROM kelas k
      LEFT JOIN guru g ON k.wali_kelas = g.id
      WHERE k.id = ?
    `;
    db.get(sql, [id], callback);
  },

  create: (data, callback) => {
    const { nama_kelas, jurusan, wali_kelas, tahun_pelajaran, jumlah_siswa } = data;
    const sql = `INSERT INTO kelas (nama_kelas, jurusan, wali_kelas, tahun_pelajaran, jumlah_siswa) VALUES (?, ?, ?, ?, ?)`;
    db.run(sql, [nama_kelas, jurusan || '', wali_kelas || null, tahun_pelajaran, jumlah_siswa || 0], function(err) {
      callback(err, { id: this.lastID });
    });
  },

  update: (id, data, callback) => {
    const { nama_kelas, jurusan, wali_kelas, tahun_pelajaran, jumlah_siswa } = data;
    const sql = `UPDATE kelas SET nama_kelas = ?, jurusan = ?, wali_kelas = ?, tahun_pelajaran = ?, jumlah_siswa = ? WHERE id = ?`;
    db.run(sql, [nama_kelas, jurusan || '', wali_kelas || null, tahun_pelajaran, jumlah_siswa || 0, id], function(err) {
      callback(err);
    });
  },

  delete: (id, callback) => {
    const sql = `DELETE FROM kelas WHERE id = ?`;
    db.run(sql, [id], function(err) {
      callback(err);
    });
  },

  // Helper method to update student count for a specific class
  updateJumlahSiswa: (kelas_id, callback) => {
    // Count active students in this class
    const countSql = `SELECT COUNT(*) as count FROM siswa WHERE kelas_id = ? AND status = 'aktif'`;
    db.get(countSql, [kelas_id], (err, row) => {
      if (err) {
        callback(err);
        return;
      }
      
      const newCount = row.count || 0;
      const updateSql = `UPDATE kelas SET jumlah_siswa = ? WHERE id = ?`;
      db.run(updateSql, [newCount, kelas_id], function(err) {
        callback(err);
      });
    });
  },

  // Helper method to recalculate all class student counts
  syncAllJumlahSiswa: (callback) => {
    // Get all classes
    const getKelasSql = `SELECT id FROM kelas`;
    db.all(getKelasSql, [], (err, kelasList) => {
      if (err) {
        callback(err);
        return;
      }
      
      if (!kelasList || kelasList.length === 0) {
        callback(null);
        return;
      }
      
      // Update each class
      let completed = 0;
      let hasError = false;
      
      kelasList.forEach(kelas => {
        Kelas.updateJumlahSiswa(kelas.id, (err) => {
          if (err && !hasError) {
            hasError = true;
            callback(err);
            return;
          }
          
          completed++;
          if (completed === kelasList.length && !hasError) {
            callback(null);
          }
        });
      });
    });
  }
};

module.exports = Kelas;