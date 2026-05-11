const db = require('../config/dbConfig');
const Kelas = require('./Kelas');

// Model Siswa
const Siswa = {
  getAll: (sortBy, search, callback) => {
    // Handle backward compatibility - jika search adalah function, berarti dipanggil tanpa search parameter
    if (typeof search === 'function') {
      callback = search;
      search = '';
    }
    
    let sql = `
      SELECT s.*, k.nama_kelas
      FROM siswa s
      LEFT JOIN kelas k ON s.kelas_id = k.id
    `;
    
    const params = [];
    
    // Add search filter if provided
    if (search && search.toString().trim() !== '') {
      sql += ` WHERE s.nama_siswa LIKE ? OR s.nis LIKE ? OR s.nisn LIKE ?`;
      const searchTerm = `%${search.toString().trim()}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }
    
    // Determine sort order
    if (sortBy === 'kelas') {
      sql += ` ORDER BY k.nama_kelas ASC, s.nama_siswa ASC`;
    } else {
      sql += ` ORDER BY s.nama_siswa ASC`;
    }
    
    db.all(sql, params, callback);
  },

  getAllByKelas: (kelasId, callback) => {
    const sql = `
      SELECT s.*, k.nama_kelas
      FROM siswa s
      LEFT JOIN kelas k ON s.kelas_id = k.id
      WHERE s.kelas_id = ? AND s.status = 'aktif'
      ORDER BY s.nama_siswa ASC
    `;
    db.all(sql, [kelasId], callback);
  },

  getById: (id, callback) => {
    const sql = `
      SELECT s.*, k.nama_kelas
      FROM siswa s
      LEFT JOIN kelas k ON s.kelas_id = k.id
      WHERE s.id = ?
    `;
    db.get(sql, [id], callback);
  },

  create: (data, callback) => {
    const { nis, nisn, nama_siswa, jenis_kelamin, tempat_lahir, tanggal_lahir, alamat, nomor_telepon, kelas_id, tahun_ajaran, status } = data;
    const sql = `INSERT INTO siswa (nis, nisn, nama_siswa, jenis_kelamin, tempat_lahir, tanggal_lahir, alamat, nomor_telepon, kelas_id, tahun_ajaran, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    db.run(sql, [
      nis || '', 
      nisn || '', 
      nama_siswa, 
      jenis_kelamin || '', 
      tempat_lahir || '', 
      tanggal_lahir || '', 
      alamat || '', 
      nomor_telepon || '', 
      kelas_id || null, 
      tahun_ajaran || '', 
      status || 'aktif'
    ], function(err) {
      if (err) {
        callback(err, null);
        return;
      }
      
      // Sync student count for the class
      if (kelas_id) {
        Kelas.updateJumlahSiswa(kelas_id, (syncErr) => {
          if (syncErr) {
            console.error('Error syncing student count:', syncErr);
          }
          callback(null, { id: this.lastID });
        });
      } else {
        callback(null, { id: this.lastID });
      }
    });
  },

  update: (id, data, callback) => {
    const { nis, nisn, nama_siswa, jenis_kelamin, tempat_lahir, tanggal_lahir, alamat, nomor_telepon, kelas_id, tahun_ajaran, status } = data;
    
    // Get old class_id before update
    Siswa.getById(id, (err, oldSiswa) => {
      if (err) {
        callback(err);
        return;
      }
      
      const oldKelasId = oldSiswa ? oldSiswa.kelas_id : null;
      const newKelasId = kelas_id || null;
      
      const sql = `UPDATE siswa SET nis = ?, nisn = ?, nama_siswa = ?, jenis_kelamin = ?, tempat_lahir = ?, tanggal_lahir = ?, alamat = ?, nomor_telepon = ?, kelas_id = ?, tahun_ajaran = ?, status = ? WHERE id = ?`;
      db.run(sql, [
        nis || '', 
        nisn || '', 
        nama_siswa, 
        jenis_kelamin || '', 
        tempat_lahir || '', 
        tanggal_lahir || '', 
        alamat || '', 
        nomor_telepon || '', 
        newKelasId, 
        tahun_ajaran || '', 
        status || 'aktif',
        id
      ], function(err) {
        if (err) {
          callback(err);
          return;
        }
        
        // Sync student counts for both old and new classes
        let syncCompleted = 0;
        const classesToSync = new Set();
        
        if (oldKelasId) classesToSync.add(oldKelasId);
        if (newKelasId) classesToSync.add(newKelasId);
        
        if (classesToSync.size === 0) {
          callback(null);
          return;
        }
        
        classesToSync.forEach(kelasId => {
          Kelas.updateJumlahSiswa(kelasId, (syncErr) => {
            if (syncErr) {
              console.error('Error syncing student count:', syncErr);
            }
            
            syncCompleted++;
            if (syncCompleted === classesToSync.size) {
              callback(null);
            }
          });
        });
      });
    });
  },

  delete: (id, callback) => {
    // Get student's class before deletion
    Siswa.getById(id, (err, siswa) => {
      if (err) {
        callback(err);
        return;
      }
      
      const kelasId = siswa ? siswa.kelas_id : null;
      
      const sql = `DELETE FROM siswa WHERE id = ?`;
      db.run(sql, [id], function(err) {
        if (err) {
          callback(err);
          return;
        }
        
        // Sync student count for the class
        if (kelasId) {
          Kelas.updateJumlahSiswa(kelasId, (syncErr) => {
            if (syncErr) {
              console.error('Error syncing student count:', syncErr);
            }
            callback(null);
          });
        } else {
          callback(null);
        }
      });
    });
  },

  getByKelasId: (kelas_id, callback) => {
    const sql = `
      SELECT s.*, k.nama_kelas
      FROM siswa s
      LEFT JOIN kelas k ON s.kelas_id = k.id
      WHERE s.kelas_id = ? AND s.status = 'aktif'
      ORDER BY s.nama_siswa ASC
    `;
    db.all(sql, [kelas_id], callback);
  }
};

module.exports = Siswa;
