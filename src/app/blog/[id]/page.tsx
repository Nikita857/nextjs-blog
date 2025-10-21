/* eslint-disable react/jsx-no-undef */
import { auth } from "@/auth/auth";
import prisma from "@/utils/prisma";
import { notFound } from "next/navigation";
import PostActions from "@/components/blog/post.actions";
import { deletePost, updatePost } from "@/actions/post.actions";
import Link from "next/link";
import Image from "next/image";

type Props = {
  params: {
    id: string;
  };
};

export default async function PostPage({ params }: Props) {
  const session = await auth();

  // 1. При загрузке поста, сразу включаем в запрос связанные с ним рубрики
  const post = await prisma.post.findUnique({
    where: { id: params.id },
    include: {
      author: { select: { email: true, image: true, name: true } },
      categories: true, // <-- Включаем рубрики поста
    },
  });

  // 2. Также загружаем ПОЛНЫЙ список всех рубрик для формы
  const allCategories = await prisma.category.findMany();

  if (!post) {
    notFound();
  }

  if (!post.published && post.authorId !== session?.user?.id) {
    notFound();
  }

  const isAuthor = session?.user?.id === post.authorId;

  // 3. Создаем "привязанные" версии экшенов
  // .bind(null, post.id) создает новую функцию, у которой первый аргумент уже "зафиксирован"
  // и равен id текущего поста.
  const updatePostWithId = updatePost.bind(null, post.id);
  const deletePostWithId = deletePost.bind(null, post.id);

  return (
    <article className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 sm:p-8 md:p-10">
        <header className="mb-8 border-b border-gray-200 dark:border-gray-700 pb-6">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100 mb-4 leading-tight">
            {post.title}
          </h1>
          <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center space-x-2">
              <Image
                src={post.author.image || "/file.svg"}
                alt={post.author.name || post.author.email}
                width={36}
                height={36}
                className="w-9 h-9 rounded-full object-cover flex-shrink-0"
              />
              <span className="font-medium">{post.author.email}</span>
            </div>
            <span className="text-gray-300 dark:text-gray-600">•</span>
            <time dateTime={post.createdAt.toISOString()}>
              {new Date(post.createdAt).toLocaleDateString("ru-RU", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </time>
          </div>
          {/* Рубрики поста */}
          {post.categories.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 mt-4">
              {post.categories.map((category) => (
                <Link
                  key={category.id}
                  href={`/blog/category/${category.name}`}
                  className="px-3 py-1 text-xs font-medium text-blue-800 bg-blue-100         
      rounded-full dark:bg-blue-900 dark:text-blue-200 hover:bg-blue-200 
      dark:hover:bg-blue-800 transition-colors"
                >
                  {category.name}
                </Link>
              ))}
            </div>
          )}
        </header>

        <div className="prose prose-lg lg:prose-xl max-w-none dark:prose-invert">
          {post.content}
        </div>

        {isAuthor && (
          <PostActions
            post={post}
            allCategories={allCategories}
            updatePostAction={updatePostWithId}
            deletePostAction={deletePostWithId}
          />
        )}
      </div>
    </article>
  );
}
