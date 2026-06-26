const axios = require('axios');

async function testLogin(email, password) {
  try {
    console.log(`Testing login for ${email}...`);
    const res = await axios.post('http://127.0.0.1:3001/api/auth/login', {
      email,
      password
    });
    console.log('SUCCESS:', res.status, res.data);
  } catch (err) {
    console.log('ERROR:', err.response ? err.response.status : 'No response', err.response ? err.response.data : err.message);
  }
}

// Test admin login
testLogin('admin@virtualnest.com', 'admin');

// Test employee login
setTimeout(() => {
  testLogin('employee@virtualnest.com', 'employee');
}, 2000);

// Test rishi login (what password did you use?)
setTimeout(() => {
  testLogin('rishi@virtualnest.com', '12345'); // or whatever password you set
}, 4000);

// Test vijayadhith login
setTimeout(() => {
  testLogin('vijayadhith@virtualnest.com', '12345'); // or whatever password you set
}, 6000);
