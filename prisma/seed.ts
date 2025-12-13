import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create a demo user
  const demoUser = await prisma.user.upsert({
    where: { id: 'demo-user' },
    update: {},
    create: {
      id: 'demo-user',
      email: 'demo@example.com'
    }
  });

  console.log('✅ Created demo user:', demoUser.id);

  // Create a sample quit profile
  const quitDate = new Date();
  quitDate.setDate(quitDate.getDate() - 15); // 15 days ago

  const quitProfile = await prisma.quitProfile.upsert({
    where: { userId: 'demo-user' },
    update: {},
    create: {
      userId: 'demo-user',
      quitDate: quitDate,
      cigarettesPerDay: 15,
      costPerPack: 12.50,
      cigarettesPerPack: 20,
      personalGoal: 'I want to save money for my family vacation and improve my health for my kids.'
    }
  });

  console.log('✅ Created quit profile:', quitProfile.id);

  // Create some sample check-ins for the last 7 days
  const checkIns = [
    { date: new Date(), cravingIntensity: 3, mood: 'motivated', notes: 'Feeling great today!' },
    { date: new Date(Date.now() - 24 * 60 * 60 * 1000), cravingIntensity: 5, mood: 'determined', notes: 'Had a craving during lunch but resisted.' },
    { date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), cravingIntensity: 4, mood: 'confident', notes: 'First smoke-free weekend!' },
    { date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), cravingIntensity: 6, mood: 'challenged', notes: 'Work stress made it harder today.' },
    { date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), cravingIntensity: 4, mood: 'proud', notes: 'Told my family about my progress.' },
    { date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), cravingIntensity: 5, mood: 'hopeful', notes: 'Money saved calculation was motivating.' },
    { date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), cravingIntensity: 3, mood: 'excited', notes: 'Started tracking my progress!' }
  ];

  for (const checkInData of checkIns) {
    const checkIn = await prisma.dailyCheckIn.create({
      data: {
        userId: 'demo-user',
        date: checkInData.date,
        cravingIntensity: checkInData.cravingIntensity,
        mood: checkInData.mood,
        notes: checkInData.notes
      }
    });
    console.log('✅ Created check-in:', checkIn.id);
  }

  console.log('🎉 Database seeded successfully!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Error seeding database:', e);
    await prisma.$disconnect();
    process.exit(1);
  });