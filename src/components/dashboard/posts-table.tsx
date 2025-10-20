"use client";

import Link from "next/link";
import PostActions from "@/components/blog/post.actions";
import { updatePost, deletePost } from "@/actions/post.actions";
import { Category, Post } from "@/generated/prisma/client";

type PostWithRelations = Post & {
  categories: Category[];
};

type Props = {
  userPosts: PostWithRelations[];
  allCategories: Category[];
};

export default function PostsTable({ userPosts, allCategories }: Props) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 sm:p-8">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
        Ваши посты
      </h2>
      {/* Контейнер с ограниченной высотой и прокруткой */}
      <div className="max-h-[400px] overflow-y-auto pr-2 space-y-4">
        {userPosts.length > 0 ? (
          userPosts.map((post) => {
            const updatePostWithId = updatePost.bind(null, post.id);
            const deletePostWithId = deletePost.bind(null, post.id);

            return (
              <div key={post.id} className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 flex items-center justify-between gap-4">
                <div>
                  <Link href={`/blog/${post.id}`} className="font-bold text-gray-800 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400">
                    {post.title}
                  </Link>
                  <div className="flex items-center gap-3 mt-1 text-xs">
                    {post.published ? (
                      <span className="px-2 py-0.5 font-medium text-green-800 bg-green-100 rounded-full dark:bg-green-900 dark:text-green-200">
                        Опубликован
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 font-medium text-yellow-800 bg-yellow-100 rounded-full dark:bg-yellow-900 dark:text-yellow-200">
                        Черновик
                      </span>
                    )}
                    <span className="text-gray-400">•</span>
                    <span className="text-gray-500 dark:text-gray-400">
                      {new Date(post.createdAt).toLocaleDateString('ru-RU')}
                    </span>
                  </div>
                </div>
                <div className="flex-shrink-0">
                  <PostActions
                    post={post}
                    allCategories={allCategories}
                    updatePostAction={updatePostWithId}
                    deletePostAction={deletePostWithId}
                  />
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-10">
            <p className="text-gray-500">У вас еще нет постов.</p>
          </div>
        )}
      </div>
    </div>
  );
}