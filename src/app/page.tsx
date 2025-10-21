import prisma from "@/utils/prisma";
import { HomePageClient } from "@/components/common/home-page-client";

export default async function HomePage() {
  // 1. На сервере мы загружаем только самые первые данные
  const initialPosts = await prisma.post.findMany({
    where: { published: true },
    orderBy: { createdAt: "desc" },
    take: 5,
    include: {
      author: { select: { email: true, image: true } },
      categories: true,
    },
  });

  const allCategories = await prisma.category.findMany();

  return (
    <HomePageClient initialPosts={initialPosts} allCategories={allCategories} />
  );
}
