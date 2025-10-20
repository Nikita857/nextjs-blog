"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Input, Button } from "@heroui/react";
import { getPublishedPosts } from "@/actions/post.actions";
import { Category, Post } from "@/generated/prisma/client";


// Определяем более детальный тип для постов, включая связанные данные
type PostWithRelations = Post & {
  author: { email: string | null };
  categories: Category[];
};

type Props = {
  initialPosts: PostWithRelations[];
  allCategories: Category[];
};

export function HomePageClient({ initialPosts, allCategories }: Props) {
  // 1. Исправлен тип состояния: это массив постов PostWithRelations[]
  const [posts, setPosts] = useState<PostWithRelations[]>(initialPosts);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSelectCategory = (categoryName: string | null) => {
    startTransition(async () => {
      setSelectedCategory(categoryName);
      const newPosts = await getPublishedPosts({ 
        categoryName: categoryName ?? undefined 
      });
      setPosts(newPosts);
    });
  };

  return (
    <div className="w-full bg-gray-50 dark:bg-gray-900 flex-grow">
      {/* Hero Section */}
      <section className="text-center py-16 md:py-24 px-4 bg-white dark:bg-gray-800 border-b dark:border-gray-700">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100">
          Добро пожаловать в наш Блог
        </h1>
        <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-500 dark:text-gray-400">
          Здесь мы делимся последними новостями, идеями и историями.
        </p>
        <form action="/search" className="mt-8 max-w-xl mx-auto flex gap-2">
          <Input name="q" placeholder="Найти посты..." aria-label="Search posts" className="flex-grow" />
          <Button type="submit" color="primary">Поиск</Button>
        </form>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          
          {/* Левая колонка: Посты */}
          <div className={`lg:col-span-2 space-y-8 transition-opacity duration-300 ${isPending ? 'opacity-50' : 'opacity-100'}`}>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 border-b dark:border-gray-700 pb-4">
              {selectedCategory ? `${selectedCategory}` : "Последние посты"}
            </h2>
            {/* 2. Проверяем длину и отрисовываем состояние `posts`, а не `initialPosts` */}
            {posts.length > 0 ? (
              posts.map(post => (
                <div key={post.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden transition-shadow hover:shadow-lg">
                  <div className="p-6">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {new Date(post.createdAt).toLocaleDateString('ru-RU', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </p>
                    <h3 className="text-2xl font-bold mt-2 mb-3 text-gray-800 dark:text-gray-100">
                      <Link href={`/blog/${post.id}`} className="hover:text-blue-600 transition-colors dark:hover:text-blue-400">
                        {post.title}
                      </Link>
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 line-clamp-2">
                      {post.content}
                    </p>
                    <div className="mt-4">
                      <Link href={`/blog/${post.id}`} className="font-semibold text-blue-600 dark:text-blue-400 hover:underline">
                        Читать далее →
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-8 text-center">
                <p className="text-gray-600 dark:text-gray-300">В этой рубрике пока нет постов.</p>
              </div>
            )}
          </div>

          {/* Правая колонка: Сайдбар с рубриками */}
          <aside className="lg:col-span-1 space-y-8">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                Рубрики
              </h3>
              {/* 3. Делаем рубрики интерактивными кнопками */}
              <ul className="space-y-2">
                <li>
                  <button 
                    onClick={() => handleSelectCategory(null)}
                    className={`w-full text-left p-2 rounded-md transition-colors ${!selectedCategory ? 'font-bold text-white bg-blue-600' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                  >
                    Все посты
                  </button>
                </li>
                {allCategories.map(category => (
                  <li key={category.id}>
                    <button 
                      onClick={() => handleSelectCategory(category.name)}
                      className={`w-full text-left p-2 rounded-md transition-colors ${selectedCategory === category.name ? 'font-bold text-white bg-blue-600' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                    >
                      {category.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </aside>

        </div>
      </main>
    </div>
  );
}
