import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding data...');

  // Create Users
  const users = await Promise.all([
    prisma.user.create({
      data: {
        username: 'vignesh',
        password: await bcrypt.hash('password123', 10),
        age: 25,
        gender: 'Male',
      },
    }),
    prisma.user.create({
      data: {
        username: 'sara',
        password: await bcrypt.hash('password123', 10),
        age: 19,
        gender: 'Female',
      },
    }),
    prisma.user.create({
      data: {
        username: 'alex',
        password: await bcrypt.hash('password123', 10),
        age: 45,
        gender: 'Other',
      },
    }),
  ]);

  const features = ['date_filter', 'gender_filter', 'age_filter', 'bar_chart_click', 'logout_click'];
  const clicks = [];

  // Generate 100 random clicks over the last 30 days
  for (let i = 0; i < 100; i++) {
    const user = users[Math.floor(Math.random() * users.length)];
    const feature = features[Math.floor(Math.random() * features.length)];
    const date = new Date();
    date.setDate(date.getDate() - Math.floor(Math.random() * 30));

    clicks.push({
      userId: user.id,
      featureName: feature,
      timestamp: date,
    });
  }

  await prisma.featureClick.createMany({
    data: clicks,
  });

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
