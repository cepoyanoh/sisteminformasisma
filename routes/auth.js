const express = require('express');
const router = express.Router();
const User = require('../models/User');
const db = require('../config/dbConfig');
const bcrypt = require('bcryptjs');

// Authentication middleware
const requireAuth = (req, res, next) => {
  if (!req.session.user) {
    req.flash('error', 'Silakan login terlebih dahulu');
    return res.redirect('/login');
  }
  next();
};

// Role-based access control middleware
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.session.user) {
      req.flash('error', 'Silakan login terlebih dahulu');
      return res.redirect('/login');
    }
    
    if (!roles.includes(req.session.user.role)) {
      req.flash('error', 'Anda tidak memiliki akses ke halaman ini');
      return res.redirect('/');
    }
    
    next();
  };
};

// Middleware untuk set user di response locals
const setUserLocals = (req, res, next) => {
  res.locals.user = req.session.user || null;
  next();
};

// GET /login - Tampilkan halaman login
router.get('/login', (req, res) => {
  if (req.session.user) {
    return res.redirect('/');
  }
  res.render('auth/login', {
    title: 'Login - Sistem Informasi Akademik',
    error: req.flash('error')
  });
});

// POST /login - Proses login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  
  try {
    // Cari user berdasarkan username
    User.findByUsername(username, async (err, user) => {
      if (err) {
        console.error('Login error:', err);
        req.flash('error', 'Terjadi kesalahan sistem');
        return res.redirect('/login');
      }
      
      if (!user) {
        req.flash('error', 'Username atau password salah');
        return res.redirect('/login');
      }
      
      // Verifikasi password
      const isValid = await User.verifyPassword(password, user.password);
      
      if (!isValid) {
        req.flash('error', 'Username atau password salah');
        return res.redirect('/login');
      }
      
      // Set session
      req.session.user = {
        id: user.id,
        username: user.username,
        role: user.role,
        nama: user.nama_guru || user.nama_siswa || user.username,
        guru_id: user.guru_id,
        siswa_id: user.siswa_id
      };
      
      req.flash('success', `Selamat datang, ${req.session.user.nama}!`);
      res.redirect('/');
    });
  } catch (error) {
    console.error('Login error:', error);
    req.flash('error', 'Terjadi kesalahan sistem');
    res.redirect('/login');
  }
});

// GET /logout - Logout
router.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Logout error:', err);
    }
    res.redirect('/login');
  });
});

// GET /users - List semua user (super_admin dan admin only)
router.get('/users', requireAuth, requireRole('super_admin', 'admin'), async (req, res) => {
  try {
    const filterRole = req.query.role || '';
    
    let users;
    if (filterRole) {
      // Filter berdasarkan role
      users = await new Promise((resolve, reject) => {
        User.getByRole(filterRole, (err, list) => {
          if (err) reject(err);
          else resolve(list || []);
        });
      });
    } else {
      // Ambil semua user
      users = await new Promise((resolve, reject) => {
        User.getAll((err, list) => {
          if (err) reject(err);
          else resolve(list || []);
        });
      });
    }
    
    res.render('auth/users/index', {
      title: 'Manajemen User',
      users,
      filterRole,
      success: req.flash('success'),
      error: req.flash('error')
    });
  } catch (error) {
    console.error('Error loading users:', error);
    req.flash('error', 'Gagal memuat data user');
    res.redirect('/');
  }
});

// GET /users/create - Form tambah user
router.get('/users/create', requireAuth, requireRole('super_admin', 'admin'), async (req, res) => {
  try {
    const Guru = require('../models/Guru');
    const Siswa = require('../models/Siswa');
    const Kelas = require('../models/Kelas');
    
    // Super admin bisa create user untuk guru dan siswa
    // Admin hanya bisa create user untuk guru
    const teachers = await new Promise((resolve, reject) => {
      Guru.getAll((err, list) => {
        if (err) reject(err);
        else resolve(list || []);
      });
    });
    
    let students = [];
    if (req.session.user.role === 'super_admin') {
      students = await new Promise((resolve, reject) => {
        Siswa.getAll('', '', (err, list) => {
          if (err) reject(err);
          else resolve(list || []);
        });
      });
    }
    
    const classes = await new Promise((resolve, reject) => {
      Kelas.getAll((err, list) => {
        if (err) reject(err);
        else resolve(list || []);
      });
    });
    
    res.render('auth/users/create', {
      title: 'Tambah User Baru',
      teachers,
      students,
      classes,
      error: req.flash('error')
    });
  } catch (error) {
    console.error('Error loading create form:', error);
    req.flash('error', 'Gagal memuat form');
    res.redirect('/users');
  }
});

// POST /users/create - Simpan user baru
router.post('/users/create', requireAuth, requireRole('super_admin', 'admin'), async (req, res) => {
  const { username, password, role, guru_id, siswa_id } = req.body;
  
  try {
    // Validasi
    if (!username || !password || !role) {
      req.flash('error', 'Username, password, dan role wajib diisi');
      return res.redirect('/users/create');
    }
    
    // Admin hanya bisa membuat user untuk guru
    if (req.session.user.role === 'admin' && role !== 'guru') {
      req.flash('error', 'Admin hanya dapat membuat akun untuk guru');
      return res.redirect('/users/create');
    }
    
    // Cek apakah username sudah ada
    const exists = await new Promise((resolve, reject) => {
      User.usernameExists(username, null, (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });
    
    if (exists) {
      req.flash('error', 'Username sudah digunakan');
      return res.redirect('/users/create');
    }
    
    // Simpan user baru
    await new Promise((resolve, reject) => {
      User.create({ username, password, role, guru_id, siswa_id }, (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });
    
    req.flash('success', 'User berhasil ditambahkan');
    res.redirect('/users');
  } catch (error) {
    console.error('Error creating user:', error);
    req.flash('error', 'Gagal menambahkan user');
    res.redirect('/users/create');
  }
});

// GET /users/edit/:id - Form edit user
router.get('/users/edit/:id', requireAuth, requireRole('super_admin', 'admin'), async (req, res) => {
  try {
    const user = await new Promise((resolve, reject) => {
      User.findById(req.params.id, (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });
    
    if (!user) {
      req.flash('error', 'User tidak ditemukan');
      return res.redirect('/users');
    }
    
    const Guru = require('../models/Guru');
    const Siswa = require('../models/Siswa');
    
    const teachers = await new Promise((resolve, reject) => {
      Guru.getAll((err, list) => {
        if (err) reject(err);
        else resolve(list || []);
      });
    });
    
    let students = [];
    if (req.session.user.role === 'super_admin') {
      students = await new Promise((resolve, reject) => {
        Siswa.getAll('', '', (err, list) => {
          if (err) reject(err);
          else resolve(list || []);
        });
      });
    }
    
    res.render('auth/users/edit', {
      title: 'Edit User',
      user,
      teachers,
      students,
      error: req.flash('error')
    });
  } catch (error) {
    console.error('Error loading edit form:', error);
    req.flash('error', 'Gagal memuat form');
    res.redirect('/users');
  }
});

// POST /users/edit/:id - Update user
router.post('/users/edit/:id', requireAuth, requireRole('super_admin', 'admin'), async (req, res) => {
  const { username, password, role, is_active } = req.body;
  
  try {
    // Admin hanya bisa edit user guru
    if (req.session.user.role === 'admin') {
      const user = await new Promise((resolve, reject) => {
        User.findById(req.params.id, (err, result) => {
          if (err) reject(err);
          else resolve(result);
        });
      });
      
      if (user.role !== 'guru') {
        req.flash('error', 'Admin hanya dapat mengedit akun guru');
        return res.redirect('/users');
      }
    }
    
    // Update user
    await new Promise((resolve, reject) => {
      User.update(req.params.id, { username, password, role, is_active }, (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });
    
    req.flash('success', 'User berhasil diperbarui');
    res.redirect('/users');
  } catch (error) {
    console.error('Error updating user:', error);
    req.flash('error', 'Gagal memperbarui user');
    res.redirect(`/users/edit/${req.params.id}`);
  }
});

// POST /users/delete/:id - Hapus user
router.post('/users/delete/:id', requireAuth, requireRole('super_admin', 'admin'), async (req, res) => {
  try {
    // Admin hanya bisa hapus user guru
    if (req.session.user.role === 'admin') {
      const user = await new Promise((resolve, reject) => {
        User.findById(req.params.id, (err, result) => {
          if (err) reject(err);
          else resolve(result);
        });
      });
      
      if (user.role !== 'guru') {
        req.flash('error', 'Admin hanya dapat menghapus akun guru');
        return res.redirect('/users');
      }
    }
    
    await new Promise((resolve, reject) => {
      User.delete(req.params.id, (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });
    
    req.flash('success', 'User berhasil dihapus');
    res.redirect('/users');
  } catch (error) {
    console.error('Error deleting user:', error);
    req.flash('error', 'Gagal menghapus user');
    res.redirect('/users');
  }
});

// GET /users/generate/guru - Generate akun untuk semua guru
router.get('/users/generate/guru', requireAuth, requireRole('super_admin'), async (req, res) => {
  try {
    const results = await new Promise((resolve, reject) => {
      User.createAllGuruUsers((err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });
    
    let message = `Berhasil membuat ${results.created} akun guru baru`;
    if (results.skipped > 0) {
      message += `. ${results.skipped} guru sudah memiliki akun`;
    }
    if (results.errors.length > 0) {
      message += `. ${results.errors.length} error.`;
    }
    
    req.flash('success', message);
    res.redirect('/users');
  } catch (error) {
    console.error('Error generating guru users:', error);
    req.flash('error', 'Gagal generate akun guru: ' + error.message);
    res.redirect('/users');
  }
});

// GET /users/generate/siswa - Generate akun untuk semua siswa
router.get('/users/generate/siswa', requireAuth, requireRole('super_admin'), async (req, res) => {
  try {
    const results = await new Promise((resolve, reject) => {
      User.createAllSiswaUsers((err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });
    
    let message = `Berhasil membuat ${results.created} akun siswa baru`;
    if (results.skipped > 0) {
      message += `. ${results.skipped} siswa sudah memiliki akun`;
    }
    if (results.errors.length > 0) {
      message += `. ${results.errors.length} error.`;
    }
    
    req.flash('success', message);
    res.redirect('/users');
  } catch (error) {
    console.error('Error generating siswa users:', error);
    req.flash('error', 'Gagal generate akun siswa: ' + error.message);
    res.redirect('/users');
  }
});

// GET /users/generate/all - Generate akun untuk semua guru dan siswa
router.get('/users/generate/all', requireAuth, requireRole('super_admin'), async (req, res) => {
  try {
    // Generate guru
    const guruResults = await new Promise((resolve, reject) => {
      User.createAllGuruUsers((err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });
    
    // Generate siswa
    const siswaResults = await new Promise((resolve, reject) => {
      User.createAllSiswaUsers((err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });
    
    const totalCreated = guruResults.created + siswaResults.created;
    const totalSkipped = guruResults.skipped + siswaResults.skipped;
    const totalErrors = guruResults.errors.length + siswaResults.errors.length;
    
    let message = `Berhasil membuat ${totalCreated} akun baru (${guruResults.created} guru, ${siswaResults.created} siswa)`;
    if (totalSkipped > 0) {
      message += `. ${totalSkipped} sudah memiliki akun`;
    }
    if (totalErrors > 0) {
      message += `. ${totalErrors} error.`;
    }
    
    req.flash('success', message);
    res.redirect('/users');
  } catch (error) {
    console.error('Error generating all users:', error);
    req.flash('error', 'Gagal generate akun: ' + error.message);
    res.redirect('/users');
  }
});

// POST /users/delete-batch - Hapus multiple users
router.post('/users/delete-batch', requireAuth, requireRole('super_admin', 'admin'), async (req, res) => {
  try {
    const userIds = req.body.user_ids || [];
    
    if (!Array.isArray(userIds) || userIds.length === 0) {
      req.flash('error', 'Tidak ada user yang dipilih');
      return res.redirect('/users');
    }
    
    // Admin hanya bisa hapus user guru
    if (req.session.user.role === 'admin') {
      const usersToDelete = await new Promise((resolve, reject) => {
        const sql = `SELECT * FROM users WHERE id IN (${userIds.map(() => '?').join(',')})`;
        db.all(sql, userIds, (err, results) => {
          if (err) reject(err);
          else resolve(results || []);
        });
      });
      
      // Cek apakah ada user non-guru
      const hasNonGuru = usersToDelete.some(user => user.role !== 'guru');
      if (hasNonGuru) {
        req.flash('error', 'Admin hanya dapat menghapus akun guru. Hapus hanya user dengan role Guru.');
        return res.redirect('/users');
      }
      
      // Cek apakah ada super_admin atau admin yang terpilih
      const hasProtectedRole = usersToDelete.some(user => user.role === 'super_admin' || user.role === 'admin');
      if (hasProtectedRole) {
        req.flash('error', 'Tidak dapat menghapus user dengan role Super Admin atau Admin');
        return res.redirect('/users');
      }
    }
    
    // Super admin tidak bisa menghapus dirinya sendiri
    if (req.session.user.role === 'super_admin' && userIds.includes(req.session.user.id.toString())) {
      req.flash('error', 'Anda tidak dapat menghapus akun Anda sendiri');
      return res.redirect('/users');
    }
    
    let successCount = 0;
    let failCount = 0;
    
    for (const userId of userIds) {
      try {
        // Cek apakah user adalah diri sendiri (super_admin)
        if (req.session.user.role === 'super_admin' && userId === req.session.user.id.toString()) {
          failCount++;
          continue;
        }
        
        await new Promise((resolve, reject) => {
          User.delete(userId, (err, result) => {
            if (err) reject(err);
            else resolve(result);
          });
        });
        successCount++;
      } catch (error) {
        console.error(`Error deleting user ${userId}:`, error);
        failCount++;
      }
    }
    
    let message = `Berhasil menghapus ${successCount} user`;
    if (failCount > 0) {
      message += `. ${failCount} gagal dihapus`;
    }
    
    req.flash('success', message);
    res.redirect('/users');
  } catch (error) {
    console.error('Error deleting batch users:', error);
    req.flash('error', 'Gagal menghapus user: ' + error.message);
    res.redirect('/users');
  }
});

module.exports = {
  router,
  requireAuth,
  requireRole,
  setUserLocals
};