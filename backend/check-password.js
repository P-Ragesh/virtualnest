const bcrypt = require('bcryptjs');

const hashToCheck = '$2b$10$y17DJAEA0tnh8A.FOH.0tuelkJ5UIW0ef1.hdMVUUWIX1npGkkpiq';
const testPasswords = ['password123', 'admin', 'employee', '12345'];

async function check() {
  for (const pw of testPasswords) {
    const valid = await bcrypt.compare(pw, hashToCheck);
    console.log(`Password "${pw}": ${valid ? 'VALID' : 'INVALID'}`);
  }
  
  // Let's hash "password123" to see what it looks like
  const newHash = await bcrypt.hash('password123', 10);
  console.log('\nNew hash for "password123":', newHash);
}

check();
