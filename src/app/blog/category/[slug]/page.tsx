import prisma from "@/utils/prisma";
import Link from "next/link";

type Props = {
  params: {
    slug: string;
  };
};

export default async function CategoryPage({ params }: Props) {
  const categoryName = decodeURIComponent(params.slug);

  const posts = await prisma.post.findMany({
    where: {
      published: true,
      categories: {
        some: {
          name: categoryName,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      author: { select: { email: true } },
      categories: true,
    },
  });

  return (
    <div className="w-full bg-gray-50 dark:bg-gray-900 flex-grow py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="text-center mb-12">
          <h1
            className="text-4xl md:text-5xl font-extrabold tracking-tight 
      text-gray-900 dark:text-gray-100"
          >
            Рубрика: {categoryName}
          </h1>
        </header>
        {posts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => (
              <div
                key={post.id}
                className="bg-white dark:bg-gray-800 rounded-2xl 
      shadow-lg overflow-hidden flex flex-col transition-transform hover:scale-[1.02]"
              >
                <div className="p-6 flex-grow">
                  <h2
                    className="text-xl font-bold mb-3 text-gray-900 
      dark:text-gray-100 h-16"
                  >
                    <Link
                      href={`/blog/${post.id}`}
                      className="hover:text-blue-600
      transition-colors"
                    >
                      {post.title}
                    </Link>
                  </h2>
                  <p
                    className="text-gray-600 dark:text-gray-400 text-base 
      line-clamp-3 h-20"
                  >
                    {post.content}
                  </p>
                </div>
                <div className="p-6 bg-gray-50 dark:bg-gray-700/50 mt-auto">
                  <Link
                    href={`/blog/${post.id}`}
                    className="font-semibold 
      text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    Читать далее →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <h2
              className="text-2xl font-semibold text-gray-700 
      dark:text-gray-300"
            >
              Постов в этой рубрике пока нет
            </h2>
          </div>
        )}
      </div>
    </div>
  );
}
