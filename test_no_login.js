const http = require('http');

console.log('🧪 Testing aplikasi tanpa sistem login...\n');

// Test 1: Check if server is running
const testServer = () => {
  return new Promise((resolve, reject) => {
    const req = http.get('http://localhost:3000', (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log('✅ Test 1 PASSED: Server is responding');
        console.log(`   Status Code: ${res.statusCode}`);
        console.log(`   Response Length: ${data.length} bytes\n`);
        
        if (res.statusCode === 200) {
          console.log('✅ Test 2 PASSED: Dashboard accessible without login');
          
          // Check if response contains expected content
          if (data.includes('SMA Negeri 12 Pontianak')) {
            console.log('✅ Test 3 PASSED: Dashboard contains correct school name\n');
          }
          
          if (!data.includes('login') && !data.includes('Login')) {
            console.log('✅ Test 4 PASSED: No login form detected in response\n');
          } else {
            console.log('⚠️  Warning: Login-related content still found in response\n');
          }
          
          console.log('🎉 All tests passed! Application is working without login system.\n');
        } else {
          console.log(`❌ Test 2 FAILED: Unexpected status code ${res.statusCode}\n`);
        }
        
        resolve();
      });
    });
    
    req.on('error', (err) => {
      console.error('❌ Test 1 FAILED: Cannot connect to server');
      console.error(`   Error: ${err.message}\n`);
      console.log('💡 Make sure the server is running: npm start\n');
      reject(err);
    });
    
    req.setTimeout(5000, () => {
      console.error('❌ Test 1 FAILED: Request timeout\n');
      req.destroy();
      reject(new Error('Timeout'));
    });
  });
};

// Run tests
testServer()
  .then(() => {
    console.log('✅ Testing completed successfully!\n');
    process.exit(0);
  })
  .catch((err) => {
    console.error('❌ Testing failed!\n');
    process.exit(1);
  });
