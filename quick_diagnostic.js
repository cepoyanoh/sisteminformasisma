const fs = require('fs');
const path = require('path');

console.log('🔍 DIAGNOSTIC REPORT FOR SISTEMINFORMASI\n');
console.log('='.repeat(60));

// 1. Check if database file exists
console.log('\n1. DATABASE FILE CHECK:');
const dbPath = path.join(__dirname, 'database.db');
if (fs.existsSync(dbPath)) {
  const stats = fs.statSync(dbPath);
  console.log(`   ✅ database.db exists`);
  console.log(`   📊 Size: ${(stats.size / 1024).toFixed(2)} KB`);
  console.log(`   📅 Last modified: ${stats.mtime.toLocaleString('id-ID')}`);
} else {
  console.log(`   ❌ database.db NOT FOUND!`);
  console.log(`   💡 Run: node init_all_tables.js`);
}

// 2. Check if .env file exists
console.log('\n2. ENVIRONMENT FILE CHECK:');
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  console.log(`   ✅ .env file exists`);
  const envContent = fs.readFileSync(envPath, 'utf8');
  console.log(`   📝 Content preview:\n${envContent.split('\n').map(line => `      ${line}`).join('\n')}`);
} else {
  console.log(`   ❌ .env file NOT FOUND!`);
}

// 3. Check if node_modules exists
console.log('\n3. DEPENDENCIES CHECK:');
const nodeModulesPath = path.join(__dirname, 'node_modules');
if (fs.existsSync(nodeModulesPath)) {
  console.log(`   ✅ node_modules directory exists`);
  
  // Check critical dependencies
  const criticalDeps = ['express', 'sqlite3', 'ejs', 'ejs-mate', 'body-parser', 'express-session', 'connect-flash', 'method-override', 'multer', 'xlsx', 'dotenv'];
  let missingDeps = [];
  
  criticalDeps.forEach(dep => {
    const depPath = path.join(nodeModulesPath, dep);
    if (!fs.existsSync(depPath)) {
      missingDeps.push(dep);
    }
  });
  
  if (missingDeps.length === 0) {
    console.log(`   ✅ All critical dependencies installed`);
  } else {
    console.log(`   ❌ Missing dependencies: ${missingDeps.join(', ')}`);
    console.log(`   💡 Run: npm install`);
  }
} else {
  console.log(`   ❌ node_modules NOT FOUND!`);
  console.log(`   💡 Run: npm install`);
}

// 4. Check package.json
console.log('\n4. PACKAGE.JSON CHECK:');
const packagePath = path.join(__dirname, 'package.json');
if (fs.existsSync(packagePath)) {
  try {
    const packageData = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    console.log(`   ✅ package.json exists`);
    console.log(`   📦 Project: ${packageData.name}`);
    console.log(`   🚀 Start command: ${packageData.scripts?.start || 'N/A'}`);
    console.log(`   🔧 Dev command: ${packageData.scripts?.dev || 'N/A'}`);
  } catch (e) {
    console.log(`   ❌ Error reading package.json: ${e.message}`);
  }
}

// 5. Check app.js
console.log('\n5. APPLICATION FILE CHECK:');
const appPath = path.join(__dirname, 'app.js');
if (fs.existsSync(appPath)) {
  console.log(`   ✅ app.js exists`);
  const appContent = fs.readFileSync(appPath, 'utf8');
  
  // Check for critical configurations
  const hasMethodOverride = appContent.includes('method-override');
  const hasSession = appContent.includes('express-session');
  const hasFlash = appContent.includes('connect-flash');
  const hasPort = appContent.match(/PORT.*=.*\d+/);
  
  console.log(`   ⚙️  method-override: ${hasMethodOverride ? '✅' : '❌'}`);
  console.log(`   ⚙️  express-session: ${hasSession ? '✅' : '❌'}`);
  console.log(`   ⚙️  connect-flash: ${hasFlash ? '✅' : '❌'}`);
  console.log(`   ⚙️  PORT config: ${hasPort ? '✅' : '❌'}`);
}

// 6. Check views directory
console.log('\n6. VIEWS DIRECTORY CHECK:');
const viewsPath = path.join(__dirname, 'views');
if (fs.existsSync(viewsPath)) {
  console.log(`   ✅ views directory exists`);
  
  // Check for index.ejs (dashboard)
  const indexPath = path.join(viewsPath, 'index.ejs');
  if (fs.existsSync(indexPath)) {
    console.log(`   ✅ index.ejs (dashboard) exists`);
  } else {
    console.log(`   ❌ index.ejs NOT FOUND!`);
  }
  
  // Check for layout.ejs
  const layoutPath = path.join(viewsPath, 'layout.ejs');
  if (fs.existsSync(layoutPath)) {
    console.log(`   ✅ layout.ejs exists`);
  } else {
    console.log(`   ❌ layout.ejs NOT FOUND!`);
  }
} else {
  console.log(`   ❌ views directory NOT FOUND!`);
}

// 7. Check port availability
console.log('\n7. PORT AVAILABILITY CHECK:');
const net = require('net');
const testPort = (port) => {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.once('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.log(`   ⚠️  Port ${port} is ALREADY IN USE`);
        console.log(`   💡 Kill existing process or use different port`);
        resolve(false);
      } else {
        resolve(true);
      }
    });
    server.once('listening', () => {
      server.close();
      console.log(`   ✅ Port ${port} is available`);
      resolve(true);
    });
    server.listen(port);
  });
};

testPort(3000).then(() => {
  console.log('\n' + '='.repeat(60));
  console.log('\n📋 RECOMMENDED ACTIONS:\n');
  
  if (!fs.existsSync(dbPath)) {
    console.log('   1️⃣  Initialize database:');
    console.log('      node init_all_tables.js\n');
  }
  
  if (!fs.existsSync(nodeModulesPath)) {
    console.log('   2️⃣  Install dependencies:');
    console.log('      npm install\n');
  }
  
  console.log('   3️⃣  Start the server:');
  console.log('      npm start\n');
  
  console.log('   4️⃣  Open browser:');
  console.log('      http://localhost:3000\n');
  
  console.log('='.repeat(60));
});
