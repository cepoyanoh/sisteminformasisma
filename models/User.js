const db = require('../config/dbConfig');
const bcrypt = require('bcryptjs');

// Model User untuk Authentication
const User = {
  // Find user by username
  findByUsername: (username, callback) => {
    const sql = `
      SELECT u.*, g.nama_guru, s.nama_siswa 
      FROM users u
      LEFT JOIN guru g ON u.guru_id = g.id
      LEFT JOIN siswa s ON u.siswa_id = s.id
      WHERE u.username = ? AND u.is_active = 1
    `;
    db.get(sql, [username], callback);
  },

  // Find user by ID (include suspended users for editing)
  findById: (id, callback) => {
    const sql = `
      SELECT u.*, g.nama_guru, s.nama_siswa 
      FROM users u
      LEFT JOIN guru g ON u.guru_id = g.id
      LEFT JOIN siswa s ON u.siswa_id = s.id
      WHERE u.id = ?
    `;
    db.get(sql, [id], callback);
  },

  // Create new user
  create: async (data, callback) => {
    const { username, password, role, guru_id, siswa_id } = data;
    
    try {
      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      
      const sql = `INSERT INTO users (username, password, role, guru_id, siswa_id) VALUES (?, ?, ?, ?, ?)`;
      db.run(sql, [username, hashedPassword, role, guru_id || null, siswa_id || null], function(err) {
        callback(err, { id: this.lastID });
      });
    } catch (error) {
      callback(error, null);
    }
  },

  // Update user
  update: async (id, data, callback) => {
    const { username, password, role, is_active } = data;
    
    try {
      if (password) {
        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const sql = `UPDATE users SET username = ?, password = ?, role = ?, is_active = ? WHERE id = ?`;
        db.run(sql, [username, hashedPassword, role, is_active !== undefined ? is_active : 1, id], function(err) {
          callback(err, { changes: this.changes });
        });
      } else {
        const sql = `UPDATE users SET username = ?, role = ?, is_active = ? WHERE id = ?`;
        db.run(sql, [username, role, is_active !== undefined ? is_active : 1, id], function(err) {
          callback(err, { changes: this.changes });
        });
      }
    } catch (error) {
      callback(error, null);
    }
  },

  // Update password only
  updatePassword: async (id, newPassword, callback) => {
    try {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);
      const sql = `UPDATE users SET password = ? WHERE id = ?`;
      db.run(sql, [hashedPassword, id], function(err) {
        callback(err, { changes: this.changes });
      });
    } catch (error) {
      callback(error, null);
    }
  },

  // Verify password
  verifyPassword: async (password, hashedPassword) => {
    return await bcrypt.compare(password, hashedPassword);
  },

  // Get all users
  getAll: (callback) => {
    const sql = `
      SELECT u.*, g.nama_guru, s.nama_siswa, k.nama_kelas
      FROM users u
      LEFT JOIN guru g ON u.guru_id = g.id
      LEFT JOIN siswa s ON u.siswa_id = s.id
      LEFT JOIN kelas k ON s.kelas_id = k.id
      ORDER BY u.role ASC, u.username ASC
    `;
    db.all(sql, [], callback);
  },

  // Get users by role
  getByRole: (role, callback) => {
    const sql = `
      SELECT u.*, g.nama_guru, s.nama_siswa, k.nama_kelas
      FROM users u
      LEFT JOIN guru g ON u.guru_id = g.id
      LEFT JOIN siswa s ON u.siswa_id = s.id
      LEFT JOIN kelas k ON s.kelas_id = k.id
      WHERE u.role = ? AND u.is_active = 1
      ORDER BY u.username ASC
    `;
    db.all(sql, [role], callback);
  },

  // Delete user (hard delete - permanently remove from database)
  delete: (id, callback) => {
    const sql = `DELETE FROM users WHERE id = ?`;
    db.run(sql, [id], function(err) {
      callback(err, { changes: this.changes });
    });
  },

  // Check if username exists
  usernameExists: (username, excludeId, callback) => {
    let sql = `SELECT COUNT(*) as count FROM users WHERE username = ?`;
    const params = [username];
    
    if (excludeId) {
      sql += ' AND id != ?';
      params.push(excludeId);
    }
    
    db.get(sql, params, (err, row) => {
      callback(err, row ? row.count > 0 : false);
    });
  },

  // Create user for Guru (username & password = NIP)
  createForGuru: async (guruId, callback) => {
    try {
      // Get guru data
      const guru = await new Promise((resolve, reject) => {
        require('./Guru').getById(guruId, (err, data) => {
          if (err) reject(err);
          else resolve(data);
        });
      });

      if (!guru) {
        return callback(new Error('Guru tidak ditemukan'), null);
      }

      if (!guru.nip) {
        return callback(new Error(`Guru ${guru.nama_guru} tidak memiliki NIP`), null);
      }

      // Check if user already exists for this guru
      const existingUser = await new Promise((resolve, reject) => {
        const sql = `SELECT * FROM users WHERE guru_id = ?`;
        db.get(sql, [guruId], (err, result) => {
          if (err) reject(err);
          else resolve(result);
        });
      });

      if (existingUser) {
        return callback(null, { created: false, message: 'User sudah ada untuk guru ini', username: existingUser.username });
      }

      // Create user with NIP as username and password
      const username = guru.nip.toString();
      const password = guru.nip.toString();

      await new Promise((resolve, reject) => {
        User.create({ username, password, role: 'guru', guru_id: guruId }, (err, result) => {
          if (err) reject(err);
          else resolve(result);
        });
      });

      callback(null, { created: true, username, nama: guru.nama_guru });
    } catch (error) {
      callback(error, null);
    }
  },

  // Create user for Siswa (username & password = NISN)
  createForSiswa: async (siswaId, callback) => {
    try {
      // Get siswa data
      const siswa = await new Promise((resolve, reject) => {
        require('./Siswa').getById(siswaId, (err, data) => {
          if (err) reject(err);
          else resolve(data);
        });
      });

      if (!siswa) {
        return callback(new Error('Siswa tidak ditemukan'), null);
      }

      if (!siswa.nisn) {
        return callback(new Error(`Siswa ${siswa.nama_siswa} tidak memiliki NISN`), null);
      }

      // Check if user already exists for this siswa
      const existingUser = await new Promise((resolve, reject) => {
        const sql = `SELECT * FROM users WHERE siswa_id = ?`;
        db.get(sql, [siswaId], (err, result) => {
          if (err) reject(err);
          else resolve(result);
        });
      });

      if (existingUser) {
        return callback(null, { created: false, message: 'User sudah ada untuk siswa ini', username: existingUser.username });
      }

      // Create user with NISN as username and password
      const username = siswa.nisn.toString();
      const password = siswa.nisn.toString();

      await new Promise((resolve, reject) => {
        User.create({ username, password, role: 'siswa', siswa_id: siswaId }, (err, result) => {
          if (err) reject(err);
          else resolve(result);
        });
      });

      callback(null, { created: true, username, nama: siswa.nama_siswa });
    } catch (error) {
      callback(error, null);
    }
  },

  // Create users for all Guru without accounts
  createAllGuruUsers: async (callback) => {
    try {
      // Get all guru
      const allGuru = await new Promise((resolve, reject) => {
        require('./Guru').getAll((err, list) => {
          if (err) reject(err);
          else resolve(list || []);
        });
      });

      const results = {
        total: allGuru.length,
        created: 0,
        skipped: 0,
        errors: [],
        details: []
      };

      for (const guru of allGuru) {
        try {
          const result = await new Promise((resolve, reject) => {
            User.createForGuru(guru.id, (err, res) => {
              if (err) reject(err);
              else resolve(res);
            });
          });

          if (result.created) {
            results.created++;
            results.details.push({
              status: 'created',
              nama: result.nama,
              username: result.username
            });
          } else {
            results.skipped++;
            results.details.push({
              status: 'skipped',
              nama: guru.nama_guru,
              message: result.message
            });
          }
        } catch (error) {
          results.errors.push({
            nama: guru.nama_guru,
            error: error.message
          });
        }
      }

      callback(null, results);
    } catch (error) {
      callback(error, null);
    }
  },

  // Create users for all Siswa without accounts
  createAllSiswaUsers: async (callback) => {
    try {
      // Get all siswa
      const allSiswa = await new Promise((resolve, reject) => {
        require('./Siswa').getAll('', '', (err, list) => {
          if (err) reject(err);
          else resolve(list || []);
        });
      });

      const results = {
        total: allSiswa.length,
        created: 0,
        skipped: 0,
        errors: [],
        details: []
      };

      for (const siswa of allSiswa) {
        try {
          const result = await new Promise((resolve, reject) => {
            User.createForSiswa(siswa.id, (err, res) => {
              if (err) reject(err);
              else resolve(res);
            });
          });

          if (result.created) {
            results.created++;
            results.details.push({
              status: 'created',
              nama: result.nama,
              username: result.username
            });
          } else {
            results.skipped++;
            results.details.push({
              status: 'skipped',
              nama: siswa.nama_siswa,
              message: result.message
            });
          }
        } catch (error) {
          results.errors.push({
            nama: siswa.nama_siswa,
            error: error.message
          });
        }
      }

      callback(null, results);
    } catch (error) {
      callback(error, null);
    }
  }
};

module.exports = User;