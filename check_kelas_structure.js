const db = require('./config/dbConfig');

// Query untuk mengecek struktur tabel kelas
db.serialize(() => {
  console.log("Mengecek struktur tabel kelas...");
  
  // Dapatkan informasi kolom dari tabel kelas
  db.each("PRAGMA table_info(kelas)", (err, row) => {
    if (err) {
      console.error("Error:", err.message);
    } else {
      console.log(`${row.name} - ${row.type} - ${row.notnull ? 'NOT NULL' : 'NULL'} - ${row.dflt_value || 'NO DEFAULT'}`);
    }
  });

  // Dapatkan beberapa data contoh dari tabel kelas
  setTimeout(() => {
    console.log("\nData contoh dari tabel kelas:");
    db.all("SELECT * FROM kelas LIMIT 5", (err, rows) => {
      if (err) {
        console.error("Error:", err.message);
      } else {
        console.table(rows);
      }
      
      // Tutup koneksi database
      db.close((err) => {
        if (err) {
          console.error("Error menutup database:", err.message);
        }
      });
    });
  }, 1000);
});