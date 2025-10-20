import { auth } from "@/auth/auth";
import { redirect } from "next/navigation";
import prisma from "@/utils/prisma";
import { revalidatePath } from "next/cache";
import ProfileCard from "@/components/dashboard/profile-card";
import PostsTable from "@/components/dashboard/posts-table"; // Импортируем новый компонент

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/");
  }

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) redirect("/");

  const userPosts = await prisma.post.findMany({
    where: { authorId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: { categories: true },
  });

  const allCategories = await prisma.category.findMany();

  async function updateProfile(formData: FormData) {
    "use server";
    const name = formData.get("name") as string;
    const image = formData.get("image") as string;
    await prisma.user.update({
      where: { id: session.user!.id },
      data: { name, image },
    });
    revalidatePath("/dashboard");
  }

  return (
    <div className="w-full bg-gray-50 dark:bg-gray-900 flex-grow py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="mb-10">
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100">
            Личный кабинет
          </h1>
          <p className="mt-2 text-lg text-gray-500 dark:text-gray-400">
            {user.name
              ? `Добро пожаловать, ${user.name}!`
              : `Добро пожаловать, ${user.email}!`}
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <ProfileCard user={user} updateAction={updateProfile} />
          </div>

          <div className="lg:col-span-2 space-y-8">
            {/* Используем наш новый компонент для таблицы постов */}
            <PostsTable userPosts={userPosts} allCategories={allCategories} />

            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 sm:p-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                Смена пароля
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Здесь будет форма для смены пароля...
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
