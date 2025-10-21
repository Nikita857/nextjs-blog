import { PrismaClient } from '../src/generated/prisma/index.js';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Очистка существующих данных (опционально, для чистого запуска)
  // Порядок важен из-за внешних ключей
  await prisma.reaction.deleteMany();
  await prisma.friendship.deleteMany();
  await prisma.post.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  console.log('Cleared existing data.');

  // --- Создание пользователей ---
  const hashedPassword1 = await bcrypt.hash('password123', 10);
  const hashedPassword2 = await bcrypt.hash('password123', 10);
  const hashedPassword3 = await bcrypt.hash('password123', 10);

  const user1 = await prisma.user.create({
    data: {
      name: 'Алиса Смит',
      email: 'alice@example.com',
      password: hashedPassword1,
      image: 'https://i.pravatar.cc/150?img=1',
    },
  });

  const user2 = await prisma.user.create({
    data: {
      name: 'Боб Джонсон',
      email: 'bob@example.com',
      password: hashedPassword2,
      image: 'https://i.pravatar.cc/150?img=2',
    },
  });

  const user3 = await prisma.user.create({
    data: {
      name: 'Чарли Браун',
      email: 'charlie@example.com',
      password: hashedPassword3,
      image: 'https://i.pravatar.cc/150?img=3',
    },
  });

  console.log('Created users.');

  // --- Создание категорий ---
  const category1 = await prisma.category.create({ data: { name: 'Технологии' } });
  const category2 = await prisma.category.create({ data: { name: 'Жизнь' } });
  const category3 = await prisma.category.create({ data: { name: 'Программирование' } });

  console.log('Created categories.');

  // --- Создание постов ---
  const post1 = await prisma.post.create({
    data: {
      title: 'Как начать программировать на Next.js',
      content: 'Next.js - это мощный фреймворк для React, который позволяет создавать полнофункциональные веб-приложения. Начните с установки Node.js и затем используйте команду `npx create-next-app`.',
      published: true,
      authorId: user1.id,
      categories: { connect: [{ id: category1.id }, { id: category3.id }] },
    },
  });

  const post2 = await prisma.post.create({
    data: {
      title: '10 советов для продуктивной работы',
      content: 'Продуктивность - это не только количество сделанного, но и качество. Попробуйте метод Помодоро, делайте перерывы и не забывайте о физической активности.',
      published: true,
      authorId: user2.id,
    //  categories: { connect: [{ id: category2.id }] }, // Removed for testing purposes
    },
  });

  const post3 = await prisma.post.create({
    data: {
      title: 'Будущее искусственного интеллекта',
      content: 'Искусственный интеллект продолжает развиваться семимильными шагами, меняя все сферы нашей жизни. От автономных автомобилей до персонализированных рекомендаций - ИИ уже здесь.',
      published: false, // Черновик
      authorId: user1.id,
      categories: { connect: [{ id: category1.id }] },
    },
  });

  const post4 = await prisma.post.create({
    data: {
      title: 'Мой первый опыт с Prisma',
      content: 'Prisma - это современный ORM, который значительно упрощает работу с базами данных в Node.js и TypeScript. Мне очень понравился его синтаксис и типобезопасность.',
      published: true,
      authorId: user3.id,
      categories: { connect: [{ id: category3.id }] },
    },
  });

  console.log('Created posts.');

  // --- Создание реакций ---
  await prisma.reaction.create({
    data: {
      userId: user2.id,
      postId: post1.id,
      type: 'LIKE',
    },
  });

  await prisma.reaction.create({
    data: {
      userId: user3.id,
      postId: post1.id,
      type: 'LIKE',
    },
  });

  await prisma.reaction.create({
    data: {
      userId: user1.id,
      postId: post2.id,
      type: 'DISLIKE',
    },
  });

  console.log('Created reactions.');

  // --- Создание запросов на дружбу ---
  await prisma.friendship.create({
    data: {
      senderId: user1.id,
      receiverId: user2.id,
      status: 'ACCEPTED',
    },
  });

  await prisma.friendship.create({
    data: {
      senderId: user2.id,
      receiverId: user3.id,
      status: 'PENDING',
    },
  });

  console.log('Created friendships.');

}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
