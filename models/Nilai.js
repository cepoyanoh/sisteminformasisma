const db = require('../config/dbConfig');

// Model Nilai
const Nilai = {
  getAll: (filters = {}, callback) => {
    let sql = `
      SELECT n.*, s.nama_siswa, s.nis, s.nisn, 
             mp.nama_mapel, g.nama_guru, k.nama_kelas
      FROM nilai n
      LEFT JOIN siswa s ON n.siswa_id = s.id
      LEFT JOIN mata_pelajaran mp ON n.mapel_id = mp.id
      LEFT JOIN guru g ON n.guru_id = g.id
      LEFT JOIN kelas k ON n.kelas_id = k.id
      WHERE 1=1
    `;
    
    const params = [];
    
    if (filters.siswa_id) {
      sql += ' AND n.siswa_id = ?';
      params.push(filters.siswa_id);
    }
    
    if (filters.mapel_id) {
      sql += ' AND n.mapel_id = ?';
      params.push(filters.mapel_id);
    }
    
    if (filters.guru_id) {
      sql += ' AND n.guru_id = ?';
      params.push(filters.guru_id);
    }
    
    if (filters.kelas_id) {
      sql += ' AND n.kelas_id = ?';
      params.push(filters.kelas_id);
    }
    
    if (filters.jenis_nilai) {
      sql += ' AND n.jenis_nilai = ?';
      params.push(filters.jenis_nilai);
    }
    
    sql += ' ORDER BY n.tanggal_penilaian DESC, n.created_at DESC';
    
    db.all(sql, params, callback);
  },

  getById: (id, callback) => {
    const sql = `
      SELECT n.*, s.nama_siswa, s.nis, s.nisn, 
             mp.nama_mapel, g.nama_guru, k.nama_kelas
      FROM nilai n
      LEFT JOIN siswa s ON n.siswa_id = s.id
      LEFT JOIN mata_pelajaran mp ON n.mapel_id = mp.id
      LEFT JOIN guru g ON n.guru_id = g.id
      LEFT JOIN kelas k ON n.kelas_id = k.id
      WHERE n.id = ?
    `;
    db.get(sql, [id], callback);
  },

  create: (data, callback) => {
    const { 
      siswa_id, mapel_id, guru_id, kelas_id, 
      jenis_nilai, kategori, nilai, keterangan, 
      tanggal_penilaian
    } = data;
    
    const sql = `INSERT INTO nilai 
      (siswa_id, mapel_id, guru_id, kelas_id, jenis_nilai, kategori, nilai, keterangan, tanggal_penilaian) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    
    db.run(sql, [
      siswa_id, mapel_id, guru_id, kelas_id,
      jenis_nilai, kategori, nilai, keterangan || null,
      tanggal_penilaian
    ], function(err) {
      callback(err, { id: this.lastID });
    });
  },

  update: (id, data, callback) => {
    const { 
      siswa_id, mapel_id, guru_id, kelas_id, 
      jenis_nilai, kategori, nilai, keterangan, 
      tanggal_penilaian
    } = data;
    
    const sql = `UPDATE nilai SET 
      siswa_id = ?, mapel_id = ?, guru_id = ?, kelas_id = ?,
      jenis_nilai = ?, kategori = ?, nilai = ?, keterangan = ?,
      tanggal_penilaian = ?
      WHERE id = ?`;
    
    db.run(sql, [
      siswa_id, mapel_id, guru_id, kelas_id,
      jenis_nilai, kategori, nilai, keterangan || null,
      tanggal_penilaian, id
    ], function(err) {
      callback(err);
    });
  },

  delete: (id, callback) => {
    const sql = `DELETE FROM nilai WHERE id = ?`;
    db.run(sql, [id], function(err) {
      callback(err);
    });
  },

  getRataRata: (filters = {}, callback) => {
    let sql = `
      SELECT AVG(nilai) as rata_rata, COUNT(id) as jumlah_nilai
      FROM nilai
      WHERE 1=1
    `;
    
    const params = [];
    
    if (filters.siswa_id) {
      sql += ' AND siswa_id = ?';
      params.push(filters.siswa_id);
    }
    
    if (filters.mapel_id) {
      sql += ' AND mapel_id = ?';
      params.push(filters.mapel_id);
    }
    
    if (filters.kelas_id) {
      sql += ' AND kelas_id = ?';
      params.push(filters.kelas_id);
    }
    
    if (filters.jenis_nilai) {
      sql += ' AND jenis_nilai = ?';
      params.push(filters.jenis_nilai);
    }
    
    db.get(sql, params, callback);
  },

  getByKelasAndMapel: (kelas_id, mapel_id, filters = {}, callback) => {
    let sql = `
      SELECT n.*, s.nama_siswa, s.nis, s.nisn
      FROM nilai n
      LEFT JOIN siswa s ON n.siswa_id = s.id
      WHERE n.kelas_id = ? AND n.mapel_id = ?
    `;
    
    const params = [kelas_id, mapel_id];
    
    if (filters.jenis_nilai) {
      sql += ' AND n.jenis_nilai = ?';
      params.push(filters.jenis_nilai);
    }
    
    sql += ' ORDER BY s.nama_siswa ASC, n.tanggal_penilaian DESC';
    
    db.all(sql, params, callback);
  }
};

module.exports = Nilai;
