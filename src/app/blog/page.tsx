import prisma from "@/utils/prisma";
import { PostList } from "@/components/blog/post-list";

export default async function BlogPage() {
  const posts = await prisma.post.findMany({
    where: {
      published: true,
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      author: true,
      categories: true,
    },
  });

  return (
    <div className="w-full bg-gray-50 dark:bg-gray-900 flex-grow py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100">
            Наш Блог
          </h1>
          <p className="mt-4 text-lg text-gray-500 dark:text-gray-400">
            Последние статьи и новости от нашей команды.
          </p>
        </header>
        <PostList posts={posts}/>
      </div>
    </div>
  );
}
