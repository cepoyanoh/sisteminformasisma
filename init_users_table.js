/**
 * Script untuk inisialisasi tabel users dan membuat super admin default
 * Jalankan: node init_users_table.js
 */

const db = require('./config/dbConfig');
const bcrypt = require('bcryptjs');

console.log('🚀 Initializing users table and creating default super admin...\n');

// Create users table if not exists
const createTableSQL = `
  CREATE TABLE IF NOT EXISTS users (
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
  )
`;

db.run(createTableSQL, async (err) => {
  if (err) {
    console.error('❌ Error creating users table:', err.message);
    process.exit(1);
  }
  
  console.log('✅ Users table created/verified successfully\n');
  
  // Create default super admin
  const username = 'tatausaha';
  const password = 'admin123'; // Default password
  const role = 'super_admin';
  
  try {
    // Check if super admin already exists
    db.get('SELECT COUNT(*) as count FROM users WHERE username = ?', [username], async (err, row) => {
      if (err) {
        console.error(' Error checking existing user:', err.message);
        process.exit(1);
      }
      
      if (row.count > 0) {
        console.log('ℹ️  Super admin user already exists');
        console.log('\n✅ Database initialization complete!\n');
        console.log('📋 Default Login Credentials:');
        console.log('   Username: tatausaha');
        console.log('   Password: admin123');
        console.log('   Role: Tata Usaha (Super Admin)');
        console.log('\n⚠️  IMPORTANT: Change the default password after first login!\n');
        process.exit(0);
      }
      
      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      
      // Insert super admin
      const insertSQL = `INSERT INTO users (username, password, role) VALUES (?, ?, ?)`;
      
      db.run(insertSQL, [username, hashedPassword, role], function(err) {
        if (err) {
          console.error('❌ Error creating super admin:', err.message);
          process.exit(1);
        }
        
        console.log('✅ Default super admin created successfully!\n');
        console.log('📋 Login Credentials:');
        console.log('   Username: tatausaha');
        console.log('   Password: admin123');
        console.log('   Role: Tata Usaha (Super Admin)');
        console.log('\n⚠️  IMPORTANT: Change the default password after first login!\n');
        console.log('🎉 You can now start the server and login!\n');
        
        process.exit(0);
      });
    });
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
});