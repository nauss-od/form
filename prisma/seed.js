const { PrismaClient, UserRole } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  const email = process.env.SEED_ADMIN_EMAIL || 'Nalshahrani@nauss.edu.sa';
  const password = process.env.SEED_ADMIN_PASSWORD || 'Zx.321321';
  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.user.upsert({
    where: { email },
    update: { passwordHash, role: UserRole.MANAGER, isActive: true },
    create: {
      name: 'مدير النظام',
      email,
      passwordHash,
      role: UserRole.MANAGER,
      isActive: true,
    },
  });

  console.log('Seed complete');
}

main().finally(() => prisma.$disconnect());
