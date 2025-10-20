import { auth } from "@/auth/auth";
import prisma from "@/utils/prisma";
import { redirect } from "next/navigation";
import PostForm from "@/forms/post.form";
import { addPost } from "@/actions/post.actions";

export default async function CreatePostPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/");
  }

  const allCategories = await prisma.category.findMany();

  return (
    <div className="w-full bg-gray-50 dark:bg-gray-900 flex-grow py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 sm:p-8 md:p-10">
          <header className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-gray-100">
              Создание нового поста
            </h1>
            <p className="mt-2 text-gray-500">
              Поделитесь своими мыслями со всем миром.
            </p>
          </header>
          {/* 4. Передаем список всех рубрик в форму */}
          <PostForm
            formAction={addPost}
            allCategories={allCategories}
            buttonText="Опубликовать пост"
          />
        </div>
      </div>
    </div>
  );
}
