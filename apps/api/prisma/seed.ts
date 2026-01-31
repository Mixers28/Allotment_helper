import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding crop catalog...');

  // Tomato
  const tomato = await prisma.crop.upsert({
    where: { name: 'Tomato' },
    update: {},
    create: {
      name: 'Tomato',
      family: 'Solanaceae',
      varieties: {
        create: [
          {
            name: 'Cherry',
            rowSpacingCm: 60,
            plantSpacingCm: 45,
            matureSpreadCm: 50,
            growthHabit: 'vine',
          },
          {
            name: 'Roma',
            rowSpacingCm: 75,
            plantSpacingCm: 60,
            matureSpreadCm: 60,
            growthHabit: 'bush',
          },
          {
            name: 'Beefsteak',
            rowSpacingCm: 90,
            plantSpacingCm: 75,
            matureSpreadCm: 75,
            growthHabit: 'vine',
          },
        ],
      },
    },
  });

  // Lettuce
  const lettuce = await prisma.crop.upsert({
    where: { name: 'Lettuce' },
    update: {},
    create: {
      name: 'Lettuce',
      family: 'Asteraceae',
      varieties: {
        create: [
          {
            name: 'Butterhead',
            rowSpacingCm: 30,
            plantSpacingCm: 25,
            matureSpreadCm: 25,
            growthHabit: 'upright',
          },
          {
            name: 'Romaine',
            rowSpacingCm: 30,
            plantSpacingCm: 30,
            matureSpreadCm: 30,
            growthHabit: 'upright',
          },
        ],
      },
    },
  });

  // Carrot
  const carrot = await prisma.crop.upsert({
    where: { name: 'Carrot' },
    update: {},
    create: {
      name: 'Carrot',
      family: 'Apiaceae',
      varieties: {
        create: [
          {
            name: 'Nantes',
            rowSpacingCm: 30,
            plantSpacingCm: 5,
            matureSpreadCm: 8,
            growthHabit: 'upright',
          },
          {
            name: 'Chantenay',
            rowSpacingCm: 30,
            plantSpacingCm: 7,
            matureSpreadCm: 10,
            growthHabit: 'upright',
          },
        ],
      },
    },
  });

  console.log('Seeded crops:', { tomato, lettuce, carrot });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
