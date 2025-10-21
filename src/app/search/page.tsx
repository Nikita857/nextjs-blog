import { Category, Post } from "@/generated/prisma";
import prisma from "@/utils/prisma";
import Image from "next/image";
import Link from "next/link";

type PostWithRelations = Post & {
  author: { email: string | null; image: string | null };
  categories: Category[];
};

type Props = {
  searchParams: {
    q?: string;
  };
};

export default async function SearchPage({ searchParams }: Props) {
  const searchQuery = searchParams.q || "";

  let searchResults: PostWithRelations[] = [];

  if (searchQuery) {
    searchResults = await prisma.post.findMany({
      where: {
        published: true,
        OR: [
          { title: { contains: searchQuery, mode: "insensitive" } },
          { content: { contains: searchQuery, mode: "insensitive" } },
        ],
      },
      orderBy: { createdAt: "desc" },
      include: {
        author: { select: { email: true, image: true } },
        categories: true,
      },
    });
  }

  return (
    <div className="w-full bg-gray-50 dark:bg-gray-900 flex-grow py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="text-center mb-12">
          <h1
            className="text-4xl md:text-5xl font-extrabold tracking-tight 
       text-gray-900 dark:text-gray-100"
          >
            Результаты поиска
          </h1>
          {searchQuery && (
            <p className="mt-4 text-lg text-gray-500 dark:text-gray-400">
              По запросу:{" "}
              <span className="font-semibold">&quot;{searchQuery}&quot;</span>
            </p>
          )}
        </header>

        {searchResults.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {searchResults.map((post) => (
              <div
                key={post.id}
                className="bg-white dark:bg-gray-800 rounded-2xl
       shadow-lg overflow-hidden flex flex-col transition-transform hover:scale-[1.02]"
              >
                <div className="p-6 flex-grow">
                  <div className="flex items-center space-x-3 mb-4">
                    <Image
                      src={post.author.image || "/file.svg"}
                      alt={post.author.email || "Author avatar"}
                      width={36}
                      height={36}
                      className="w-9 h-9 rounded-full object-cover flex-shrink-0"
                    />
                    <div className="text-sm">
                      <p className="font-medium text-gray-900 dark:text-gray-100">
                        {post.author.email}
                      </p>
                      <p className="text-gray-500 dark:text-gray-400">
                        {new Date(post.createdAt).toLocaleDateString("ru-RU", {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                  </div>

                  <h3
                    className="text-xl font-bold mb-3 text-gray-900 
      dark:text-gray-100 h-16"
                  >
                    <Link
                      href={`/blog/${post.id}`}
                      className="hover:text-blue-600 transition-colors"
                    >
                      {post.title}
                    </Link>
                  </h3>
                  <p
                    className="text-gray-600 dark:text-gray-400 line-clamp-3 
       h-20"
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
              По запросу &quot;{searchQuery}&quot; ничего не найдено.
            </h2>
            <p className="mt-2 text-gray-500">Попробуйте изменить запрос.</p>
          </div>
        )}
      </div>
    </div>
  );
}
