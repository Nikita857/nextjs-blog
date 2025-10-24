import Link from "next/link";
import Image from "next/image";
import { Post, User, Category } from "@/generated/prisma";

type PostWithDetails = Post & {
  author: User;
  categories: Category[];
};

interface PostCardProps {
  post: PostWithDetails;
}

export const PostCard = ({ post }: PostCardProps) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden flex flex-col transition-transform hover:scale-[1.02]">
      <div className="p-6 flex-grow">
        <div className="flex items-center space-x-3 mb-4">
          <Image
            src={post.author.image || "/file.svg"}
            alt={post.author.name || post.author.email!}
            width={36}
            height={36}
            className="w-9 h-9 rounded-full object-cover flex-shrink-0"
          />
          <div className="text-sm">
            <p className="font-medium text-gray-900 dark:text-gray-100">
              {post.author.name || post.author.email}
            </p>
            <p className="text-gray-500 dark:text-gray-400">
              {new Date(post.createdAt).toLocaleDateString("ru-RU", {
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
        </div>

        <h2 className="text-xl font-bold mb-3 text-gray-900 dark:text-gray-100 h-16">
          <Link
            href={`/blog/${post.id}`}
            className="hover:text-blue-600 transition-colors"
          >
            {post.title}
          </Link>
        </h2>

        <p className="text-gray-600 dark:text-gray-400 text-base line-clamp-3 h-20">
          {post.content}
        </p>

        {post.categories.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 mt-4">
            {post.categories.map((category) => (
              <Link
                key={category.id}
                href={`/blog/category/${category.name}`}
                className="px-3 py-1 text-xs font-medium text-blue-800 bg-blue-100 rounded-full dark:bg-blue-900 dark:text-blue-200 hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
              >
                {category.name}
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="p-6 bg-gray-50 dark:bg-gray-700/50 mt-auto">
        <Link
          href={`/blog/${post.id}`}
          className="font-semibold text-blue-600 dark:text-blue-400 hover:underline"
        >
          Читать далее →
        </Link>
      </div>
    </div>
  );
};
