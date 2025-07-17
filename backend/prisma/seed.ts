import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');
  // Create demo user
  const demoUserEmail = process.env.DEMO_USER_EMAIL || 'demo@example.com';
  const demoUserPassword = process.env.DEMO_USER_PASSWORD || 'demo123';
  
  const existingUser = await prisma.user.findUnique({
    where: { email: demoUserEmail },
  });

  if (!existingUser) {
    const hashedPassword = await bcrypt.hash(demoUserPassword, 10);
    
    const demoUser = await prisma.user.create({
      data: {
        email: demoUserEmail,
        name: 'Demo User',
        password: hashedPassword,
        preferences: {
          theme: 'light',
          notifications: true,
        },
      },
    });

    console.log('✅ Demo user created:', {
      id: demoUser.id,
      email: demoUser.email,
      name: demoUser.name,
    });

    // Create some sample activities for the demo user
    const sampleActivities = [
      {
        title: 'Reading',
        description: 'Reading technical books and articles',
        duration: 60,
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      },
      {
        title: 'Running',
        description: 'Morning jog in the park',
        duration: 30,
        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      },
      {
        title: 'Coding',
        description: 'Working on personal projects',
        duration: 120,
        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      },
      {
        title: 'Reading',
        description: 'Reading fiction novel',
        duration: 45,
        timestamp: new Date(), // Today
      },
      {
        title: 'Exercise',
        description: 'Home workout session',
        duration: 40,
        timestamp: new Date(), // Today
      },
    ];

    for (const activity of sampleActivities) {
      await prisma.activity.create({
        data: {
          ...activity,
          userId: demoUser.id,
        },
      });
    }

    console.log('✅ Sample activities created for demo user');
  } else {
    console.log('ℹ️  Demo user already exists');
  }

  console.log('🎉 Seeding completed!');
  console.log('📧 Demo credentials: demo@example.com / demo123');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
