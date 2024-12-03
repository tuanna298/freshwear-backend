import { Prisma, PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  await prisma.$transaction(async (tx) => {
    await seedAdminUser(tx);
  });
}

async function seedAdminUser(tx: Prisma.TransactionClient) {
  const hashedPassword = await bcrypt.hash('Admin@123', 10);

  const user = await tx.user.upsert({
    where: { email: 'admin@gmail.com' },
    update: {
      username: 'admin',
      full_name: 'Admin',
      password: hashedPassword,
      role: 'ADMIN',
    },
    create: {
      email: 'admin@gmail.com',
      username: 'admin',
      full_name: 'Admin',
      role: 'ADMIN',
      password: hashedPassword,
    },
  });

  console.log(`Upserted user: ${user.full_name}`);
}

main()
  .catch((e) => {
    console.error('seed error', JSON.stringify(e, null, 2));
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
