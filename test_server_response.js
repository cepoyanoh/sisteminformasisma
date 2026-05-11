const http = require('http');

console.log('🧪 Testing if server is responding...\n');

// Try to connect to localhost:3000
const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/',
  method: 'GET',
  timeout: 5000
};

const req = http.request(options, (res) => {
  console.log(`✅ Server responded with status code: ${res.statusCode}`);
  console.log(`   Headers: ${JSON.stringify(res.headers)}\n`);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log(`✅ Received ${data.length} bytes`);
    if (data.includes('Dashboard') || data.includes('dashboard')) {
      console.log('✅ Dashboard page loaded successfully!');
    } else {
      console.log('⚠️  Response does not contain expected dashboard content');
    }
    process.exit(0);
  });
});

req.on('error', (e) => {
  console.error(`❌ Error connecting to server: ${e.message}`);
  console.log('\n💡 This likely means:');
  console.log('   1. The server is not running, OR');
  console.log('   2. The server is still starting up, OR');
  console.log('   3. There is a port conflict\n');
  console.log('🔧 Try running: npm start');
  process.exit(1);
});

req.on('timeout', () => {
  console.error('❌ Request timed out after 5 seconds');
  console.log('\n💡 The server might be hanging on database queries');
  req.destroy();
  process.exit(1);
});

req.end();
console.log('⏳ Waiting for response...');
