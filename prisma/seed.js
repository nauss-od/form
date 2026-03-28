const { PrismaClient, UserRole } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const email = 'nalshahrani@nauss.edu.sa';
  const passwordHash = await bcrypt.hash('Zx.321321', 10);

  await prisma.user.upsert({
    where: { email },
    update: {
      name: 'مدير النظام',
      passwordHash,
      role: UserRole.MANAGER,
      isActive: true
    },
    create: {
      name: 'مدير النظام',
      email,
      passwordHash,
      role: UserRole.MANAGER,
      isActive: true
    }
  });
}

main().finally(async () => {
  await prisma.$disconnect();
});
