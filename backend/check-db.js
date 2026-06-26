const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Checking database...');
  console.log('Users:');
  const users = await prisma.user.findMany();
  console.log(users);
  
  console.log('\nEmployees:');
  const employees = await prisma.employee.findMany();
  console.log(employees);
}

main()
  .then(() => {
    console.log('\nDone!');
  })
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
