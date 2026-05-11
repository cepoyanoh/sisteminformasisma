const db = require('../config/dbConfig');

// Model Absensi
const Absensi = {
  getAll: (filters = {}, callback) => {
    let sql = `
      SELECT a.*, s.nama_siswa, s.nis, k.nama_kelas, 
             mp.nama_mapel, g.nama_guru
      FROM absensi a
      LEFT JOIN siswa s ON a.siswa_id = s.id
      LEFT JOIN kelas k ON a.kelas_id = k.id
      LEFT JOIN mata_pelajaran mp ON a.mapel_id = mp.id
      LEFT JOIN guru g ON a.guru_id = g.id
      WHERE 1=1
    `;
    
    const params = [];
    
    if (filters.tanggal) {
      sql += ' AND a.tanggal = ?';
      params.push(filters.tanggal);
    }
    
    if (filters.kelas_id) {
      sql += ' AND a.kelas_id = ?';
      params.push(filters.kelas_id);
    }
    
    if (filters.guru_id) {
      sql += ' AND a.guru_id = ?';
      params.push(filters.guru_id);
    }
    
    if (filters.mapel_id) {
      sql += ' AND a.mapel_id = ?';
      params.push(filters.mapel_id);
    }
    
    sql += ' ORDER BY a.tanggal DESC, k.nama_kelas ASC, s.nama_siswa ASC';
    
    db.all(sql, params, callback);
  },

  getById: (id, callback) => {
    const sql = `
      SELECT a.*, s.nama_siswa, s.nis, k.nama_kelas,
             mp.nama_mapel, g.nama_guru
      FROM absensi a
      LEFT JOIN siswa s ON a.siswa_id = s.id
      LEFT JOIN kelas k ON a.kelas_id = k.id
      LEFT JOIN mata_pelajaran mp ON a.mapel_id = mp.id
      LEFT JOIN guru g ON a.guru_id = g.id
      WHERE a.id = ?
    `;
    db.get(sql, [id], callback);
  },

  create: (data, callback) => {
    const { siswa_id, kelas_id, tanggal, mapel_id, guru_id, status_kehadiran, keterangan } = data;
    const sql = `INSERT INTO absensi (siswa_id, kelas_id, tanggal, mapel_id, guru_id, status_kehadiran, keterangan) VALUES (?, ?, ?, ?, ?, ?, ?)`;
    db.run(sql, [siswa_id, kelas_id, tanggal, mapel_id, guru_id, status_kehadiran, keterangan || null], function(err) {
      callback(err, { id: this.lastID });
    });
  },

  update: (id, data, callback) => {
    const { status_kehadiran, keterangan, mapel_id, guru_id } = data;
    const sql = `UPDATE absensi SET status_kehadiran = ?, keterangan = ?, mapel_id = ?, guru_id = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
    db.run(sql, [status_kehadiran, keterangan || null, mapel_id, guru_id, id], function(err) {
      callback(err, { changes: this.changes });
    });
  },

  delete: (id, callback) => {
    const sql = `DELETE FROM absensi WHERE id = ?`;
    db.run(sql, [id], function(err) {
      callback(err, { changes: this.changes });
    });
  },

  // Hitung total absensi untuk dashboard
  count: (callback) => {
    const sql = 'SELECT COUNT(*) as total FROM absensi';
    db.get(sql, [], (err, row) => {
      callback(err, row ? row.total : 0);
    });
  }
};

module.exports = Absensi;