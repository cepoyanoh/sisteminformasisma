# 🔴 SOLUSI: Error EADDRINUSE - Port 3000 Already in Use

## Masalah
```
Error: listen EADDRINUSE: address already in use :::3000
[nodemon] app crashed - waiting for file changes before starting...
```

Error ini terjadi ketika **port 3000 sudah digunakan** oleh process lain.

## Penyebab Umum

### 1. **Server Sebelumnya Belum Ditutup** 🔄
- Terminal ditutup tanpa menghentikan server (Ctrl+C)
- Nodemon crash tapi process masih berjalan di background
- Multiple instance server berjalan bersamaan

### 2. **Aplikasi Lain Menggunakan Port 3000** 
- Aplikasi development lain (React, Vue, dll)
- Service Windows yang menggunakan port 3000
- Docker container atau virtual machine

### 3. **Socket dalam TIME_WAIT State** ⏳
- Server baru saja ditutup tapi socket belum fully released
- Windows TCP stack masih hold connection

## ✅ Solusi Cepat (3 Langkah)

### Langkah 1: Kill Semua Node Process

**Windows Command Prompt / PowerShell:**
```bash
taskkill /F /IM node.exe
```

**Output yang diharapkan:**
```
SUCCESS: The process "node.exe" with PID XXXX has been terminated.
SUCCESS: The process "node.exe" with PID YYYY has been terminated.
```

**Penjelasan:**
- `/F` = Force kill (paksa berhenti)
- `/IM` = Image name (nama process)
- `node.exe` = Process Node.js

### Langkah 2: Tunggu Port Dibebaskan

```bash
# Tunggu 2-3 detik untuk OS release port
timeout /t 3
```

### Langkah 3: Restart Server

```bash
npm run dev
```

**Output yang diharapkan:**
```
[nodemon] 3.1.14
[nodemon] to restart at any time, enter `rs`
[nodemon] watching path(s): *.*
[nodemon] watching extensions: js,mjs,cjs,json
[nodemon] starting `node app.js`
Server berjalan di http://localhost:3000
```

## 🔍 Diagnosa Detail

### Cek Process yang Menggunakan Port 3000

```bash
netstat -ano | findstr :3000
```

**Output contoh:**
```
TCP    0.0.0.0:3000           0.0.0.0:0              LISTENING       12345
TCP    [::]:3000              [::]:0                 LISTENING       12345
```

**Artinya:**
- Port 3000 sedang digunakan
- PID (Process ID) = `12345`

### Kill Process Tertentu

Jika Anda hanya ingin kill process tertentu:

```bash
# Ganti 12345 dengan PID yang ditemukan
taskkill /PID 12345 /F
```

### Cek Process Details

```bash
# Lihat detail process
tasklist | findstr 12345
```

**Output:**
```
node.exe                     12345 Console                    1     50,000 K
```

## 🛡️ Preventive Measures

### 1. Selalu Stop Server dengan Benar ✅

**Cara yang BENAR:**
```
Tekan Ctrl+C di terminal
Tunggu sampai muncul message "Server stopped"
```

**Cara yang SALAH:**
```
❌ Tutup terminal window langsung
❌ Matikan komputer tanpa stop server
❌ Force close dari Task Manager
```

### 2. Gunakan Script Auto-Restart yang Aman

Buat file `start.bat` di root project:

```batch
@echo off
echo Stopping existing Node processes...
taskkill /F /IM node.exe >nul 2>&1
echo Waiting for port to be released...
timeout /t 2 /nobreak >nul
echo Starting server...
npm run dev
```

**Usage:**
```bash
start.bat
```

### 3. Gunakan Port Alternatif

Jika port 3000 sering conflict, ubah ke port lain:

**Di `app.js`:**
```javascript
const PORT = process.env.PORT || 3001; // Change to 3001
```

**Atau via environment variable:**
```bash
# Windows CMD
set PORT=3001 && npm run dev

# Windows PowerShell
$env:PORT=3001; npm run dev

# Linux/Mac
PORT=3001 npm run dev
```

### 4. Graceful Shutdown Handler

Tambahkan di `app.js` untuk cleanup yang lebih baik:

```javascript
const server = app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('\n🛑 SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('\n🛑 SIGINT received (Ctrl+C). Shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
  server.close(() => {
    process.exit(1);
  });
});
```

**Benefit:**
- ✅ Server cleanup dengan benar saat Ctrl+C
- ✅ Socket dilepaskan dengan cepat
- ✅ Mengurangi kemungkinan port stuck

## 🔧 Advanced Troubleshooting

### Scenario 1: Port Masih Stuck Setelah Kill Process

**Solusi:**
```bash
# 1. Kill semua node process
taskkill /F /IM node.exe

# 2. Reset Winsock (Windows network stack)
netsh winsock reset

# 3. Flush DNS
ipconfig /flushdns

# 4. Restart computer (jika masih stuck)
```

### Scenario 2: Multiple Nodemon Instances

**Gejala:**
```
[nodemon] starting `node app.js`
[nodemon] starting `node app.js`  <-- Duplicate!
Error: listen EADDRINUSE
```

**Solusi:**
```bash
# Kill semua nodemon dan node
taskkill /F /IM nodemon.exe
taskkill /F /IM node.exe

# Clear nodemon cache
nodemon --reset

# Start fresh
npm run dev
```

### Scenario 3: Docker atau VM Menggunakan Port

**Check:**
```bash
# Cek apakah ada Docker container
docker ps

# Cek apakah ada VirtualBox/VMware VM
# Task Manager -> Performance -> Ethernet -> Active connections
```

**Solution:**
```bash
# Stop Docker container
docker stop <container_name>

# Atau ubah port aplikasi Anda
set PORT=3001 && npm run dev
```

### Scenario 4: Antivirus/Firewall Blocking

**Gejala:** Port tidak mau release atau tidak bisa bind

**Solution:**
1. Tambahkan `node.exe` ke whitelist antivirus
2. Allow port 3000 di Windows Firewall
3. Restart komputer

## 📊 Port Management Script

Buat file `port_manager.js` untuk manage port:

```javascript
// port_manager.js
const { execSync } = require('child_process');

const PORT = process.argv[2] || 3000;

console.log(`\n🔍 Checking port ${PORT}...\n`);

try {
  // Check if port is in use
  const output = execSync(`netstat -ano | findstr :${PORT}`, { encoding: 'utf8' });
  
  if (output.trim()) {
    console.log(`⚠️  Port ${PORT} is IN USE:\n`);
    console.log(output);
    
    // Extract PID
    const lines = output.trim().split('\n');
    const pid = lines[0].trim().split(/\s+/).pop();
    
    console.log(`Process ID (PID): ${pid}\n`);
    
    // Get process details
    try {
      const processInfo = execSync(`tasklist | findstr ${pid}`, { encoding: 'utf8' });
      console.log(`Process Details:\n${processInfo}`);
    } catch (e) {
      console.log('Could not get process details');
    }
    
    // Ask user to kill
    const readline = require('readline').createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    readline.question(`Kill process ${pid}? (y/n): `, (answer) => {
      if (answer.toLowerCase() === 'y') {
        try {
          execSync(`taskkill /PID ${pid} /F`, { encoding: 'utf8' });
          console.log(`✅ Process ${pid} killed successfully`);
        } catch (e) {
          console.error('❌ Failed to kill process:', e.message);
        }
      } else {
        console.log('❌ Process not killed. You may need to use a different port.');
      }
      readline.close();
    });
    
  } else {
    console.log(`✅ Port ${PORT} is AVAILABLE`);
    console.log(`\n🚀 You can start your server with: npm run dev\n`);
  }
  
} catch (error) {
  // findstr returns error code when no match found
  if (error.status === 1) {
    console.log(`✅ Port ${PORT} is AVAILABLE`);
    console.log(`\n🚀 You can start your server with: npm run dev\n`);
  } else {
    console.error('❌ Error:', error.message);
  }
}
```

**Usage:**
```bash
# Check port 3000
node port_manager.js

# Check custom port
node port_manager.js 3001
```

## 🎯 Quick Reference Commands

### Windows

```bash
# Check port usage
netstat -ano | findstr :3000

# Kill process by PID
taskkill /PID <PID> /F

# Kill all node processes
taskkill /F /IM node.exe

# Kill all nodemon processes
taskkill /F /IM nodemon.exe

# Check process details
tasklist | findstr <PID>

# Reset network stack (if port stuck)
netsh winsock reset
```

### Linux/Mac

```bash
# Check port usage
lsof -i :3000
# or
netstat -tulpn | grep :3000

# Kill process by PID
kill -9 <PID>

# Kill all node processes
pkill -f node

# Kill all nodemon processes
pkill -f nodemon
```

## 📋 Checklist

Saat error EADDRINUSE muncul:

- [ ] Tekan Ctrl+C untuk stop server (jika masih berjalan)
- [ ] Jalankan `taskkill /F /IM node.exe`
- [ ] Tunggu 2-3 detik
- [ ] Jalankan `npm run dev`
- [ ] Verifikasi server start dengan sukses
- [ ] Akses http://localhost:3000 di browser

## 💡 Tips

1. **Selalu gunakan Ctrl+C** untuk stop server, jangan langsung close terminal
2. **Tambahkan graceful shutdown** di app.js untuk cleanup yang lebih baik
3. **Gunakan script `start.bat`** untuk auto-kill dan restart
4. **Monitor Task Manager** jika sering ada zombie node process
5. **Consider using different port** (3001, 3002, dll) jika 3000 sering conflict

## 🔗 Related Issues

- [Error: listen EADDRINUSE Node.js](https://stackoverflow.com/questions/4075287/node-express-eaddrinuse-address-already-in-use-kill-server)
- [Nodemon not restarting properly](https://github.com/remy/nodemon/issues)
- [Windows port already in use](https://superuser.com/questions/283941/how-to-find-out-which-process-is-listening-upon-a-port-on-windows)

---

**Last Updated:** 2026-04-06  
**Status:** ✅ Resolved - Server restarted successfully  
**Tested On:** Windows 10/11, Node.js 14+, Nodemon 3.x
