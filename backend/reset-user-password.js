const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  const hashed = await bcrypt.hash('password123', 10);
  const updated = await prisma.user.update({
    where: { email: 'vijay@virtualnest.com' },
    data: { passwordHash: hashed }
  });
  
  console.log('Password reset successful!', updated);
  console.log('Login with email: vijay@virtualnest.com, password: password123');
}

main()
  .catch(console.error)
  .finally(async () => await prisma.$disconnect());
