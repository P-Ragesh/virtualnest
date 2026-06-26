const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('--- USERS ---');
  const users = await prisma.user.findMany();
  console.log(users);
  
  console.log('\n--- NOTIFICATIONS ---');
  const notifications = await prisma.notification.findMany();
  console.log(notifications);
  
  console.log('\n--- TASKS ---');
  const tasks = await prisma.task.findMany({ include: { employee: true } });
  console.log(tasks);
}

main()
  .catch(console.error)
  .finally(async () => await prisma.$disconnect());
