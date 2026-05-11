const http = require('http');

console.log('\n🧪 TESTING ROUTE /nilai/create...\n');

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/nilai/create',
  method: 'GET'
};

const req = http.request(options, (res) => {
  console.log(`Status Code: ${res.statusCode}`);
  console.log(`Headers:`, res.headers);
  
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log(`\nResponse Length: ${data.length} bytes`);
    
    if (res.statusCode === 200) {
      console.log('✅ Route is accessible and returning HTML');
      
      // Check if form elements are present
      if (data.includes('<form')) {
        console.log('✅ Form element found in response');
      } else {
        console.log('❌ Form element NOT found in response');
      }
      
      if (data.includes('siswa_id')) {
        console.log('✅ Siswa dropdown field found');
      } else {
        console.log('⚠️  Siswa dropdown field NOT found');
      }
      
      if (data.includes('mapel_id')) {
        console.log('✅ Mapel dropdown field found');
      } else {
        console.log('⚠️  Mapel dropdown field NOT found');
      }
      
    } else if (res.statusCode === 302 || res.statusCode === 301) {
      console.log(`⚠️  Redirect detected to: ${res.headers.location}`);
      console.log('   This might indicate authentication or routing issue');
    } else if (res.statusCode === 404) {
      console.log('❌ Route not found (404)');
      console.log('   Check if route is properly registered in app.js');
    } else if (res.statusCode === 500) {
      console.log('❌ Server error (500)');
      console.log('   Check server terminal for error details');
    }
    
    console.log('\n💡 Next steps:');
    console.log('1. Check your browser console (F12) for errors');
    console.log('2. Check server terminal for logs when accessing /nilai/create');
    console.log('3. Run: node diagnose_nilai.js to check database status\n');
  });
});

req.on('error', (err) => {
  console.log('❌ Request failed:', err.message);
  console.log('\n💡 Make sure server is running on port 3000');
  console.log('   Start server with: npm run dev\n');
});

req.end();
