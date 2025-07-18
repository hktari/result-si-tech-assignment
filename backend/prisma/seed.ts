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

    // Create comprehensive sample activities for the demo user
    // Limited to 4 activity categories: Reading, Coding, Exercise, Learning
    const now = new Date();
    const sampleActivities = [];

    // Helper function to create random duration between min and max
    const randomDuration = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

    // Helper function to get random time within a day
    const randomTimeInDay = (date: Date) => {
      const newDate = new Date(date);
      newDate.setHours(Math.floor(Math.random() * 16) + 6); // Between 6 AM and 10 PM
      newDate.setMinutes(Math.floor(Math.random() * 60));
      return newDate;
    };

    // Generate activities for the past 3 months
    for (let i = 0; i < 90; i++) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const activitiesPerDay = Math.floor(Math.random() * 4) + 1; // 1-4 activities per day

      for (let j = 0; j < activitiesPerDay; j++) {
        const activityType = Math.floor(Math.random() * 4);
        let activity;

        switch (activityType) {
          case 0: // Reading
            activity = {
              title: 'Reading',
              description: [
                'Reading technical documentation',
                'Reading fiction novel',
                'Reading news articles',
                'Reading research papers',
                'Reading programming books',
                'Reading business articles'
              ][Math.floor(Math.random() * 6)],
              duration: randomDuration(15, 120),
              timestamp: randomTimeInDay(date),
            };
            break;
          case 1: // Coding
            activity = {
              title: 'Coding',
              description: [
                'Working on personal projects',
                'Contributing to open source',
                'Code review and refactoring',
                'Learning new frameworks',
                'Building side projects',
                'Debugging and testing'
              ][Math.floor(Math.random() * 6)],
              duration: randomDuration(30, 180),
              timestamp: randomTimeInDay(date),
            };
            break;
          case 2: // Exercise
            activity = {
              title: 'Exercise',
              description: [
                'Morning jog in the park',
                'Home workout session',
                'Gym strength training',
                'Yoga and stretching',
                'Cycling outdoors',
                'Swimming session'
              ][Math.floor(Math.random() * 6)],
              duration: randomDuration(20, 90),
              timestamp: randomTimeInDay(date),
            };
            break;
          case 3: // Learning
            activity = {
              title: 'Learning',
              description: [
                'Online course completion',
                'Watching tutorial videos',
                'Attending webinars',
                'Language learning practice',
                'Skill development workshops',
                'Professional development'
              ][Math.floor(Math.random() * 6)],
              duration: randomDuration(25, 150),
              timestamp: randomTimeInDay(date),
            };
            break;
        }

        if (activity) {
          sampleActivities.push(activity);
        }
      }
    }

    // Sort activities by timestamp (oldest first)
    sampleActivities.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

    // Batch insert all activities for better performance
    await prisma.activity.createMany({
      data: sampleActivities.map(activity => ({
        ...activity,
        userId: demoUser.id,
      })),
    });

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
