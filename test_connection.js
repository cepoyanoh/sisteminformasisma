const http = require('http');

console.log('🔍 Checking if server is running on port 3001...\n');

// Try to connect to localhost:3001
const req = http.get('http://localhost:3001', (res) => {
  console.log(`✅ Server is responding!`);
  console.log(`   Status: ${res.statusCode}`);
  console.log(`   Content-Type: ${res.headers['content-type']}`);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log(`   Response size: ${data.length} bytes`);
    
    if (res.statusCode === 200) {
      if (data.includes('Dashboard') || data.includes('dashboard')) {
        console.log('\n✅ SUCCESS: Dashboard page is loading correctly!');
        console.log(' If browser still shows loading, try:');
        console.log('   1. Hard refresh: Ctrl + Shift + R');
        console.log('   2. Clear browser cache');
        console.log('   3. Try incognito mode');
      } else {
        console.log('\n️  Server responded but content may be incomplete');
      }
    } else {
      console.log(`\n⚠️  Server returned status ${res.statusCode}`);
    }
    
    process.exit(0);
  });
});

req.on('error', (e) => {
  console.error(`❌ Cannot connect to server: ${e.message}`);
  console.log('\n💡 This means the server is NOT running!');
  console.log('\n🔧 SOLUTION:');
  console.log('   1. Open terminal in d:\\SISTEMINFORMASI');
  console.log('   2. Run: node init_all_tables.js');
  console.log('   3. Run: npm start');
  console.log('   4. Wait for "Server berjalan di http://localhost:3001"');
  console.log('   5. Then refresh browser\n');
  process.exit(1);
});

req.setTimeout(5000, () => {
  console.error('❌ Request timed out after 5 seconds');
  console.log('\n💡 Server might be hanging on database queries');
  req.destroy();
  process.exit(1);
});

console.log(' Waiting for response (timeout: 5 seconds)...');
