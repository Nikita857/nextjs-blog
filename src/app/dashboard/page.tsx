import { auth } from "@/auth/auth";
import { redirect } from "next/navigation";
import prisma from "@/utils/prisma";
import { revalidatePath } from "next/cache";
import PostsTable from "@/components/dashboard/posts-table";
import PasswordCard from "@/components/dashboard/password-card";
import EditProfileModal from "@/components/dashboard/edit-profile-modal"; // Импортируем новый компонент
import Image from "next/image";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/");
  }

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) {
    redirect("/");
  }

  const userPosts = await prisma.post.findMany({
    where: { authorId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: { categories: true },
  });

  const allCategories = await prisma.category.findMany();

  // Экшен для обновления профиля
  async function updateProfile(formData: FormData) {
    "use server";
    const name = formData.get("name") as string;
    const imageFile = formData.get("imageFile") as File | null; // Получаем файл
    const existingImage = formData.get("image") as string | null; // Получаем существующий URL из скрытого поля

    let imageDataUrl: string | null = null;

    if (imageFile && imageFile.size > 0) {
      // Если загружен новый файл, конвертируем его в Base64
      const arrayBuffer = await imageFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      imageDataUrl = `data:${imageFile.type};base64,${buffer.toString(
        "base64"
      )}`;
    } else if (existingImage) {
      // Если нового файла нет, но есть существующий URL (из скрытого поля)
      imageDataUrl = existingImage;
    } else {
      // Если ни файла, ни существующего URL - значит, аватар удален
      imageDataUrl = null;
    }

    await prisma.user.update({
      where: { id: session?.user!.id },
      data: {
        name: name,
        image: imageDataUrl,
      },
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
          {/* Левая колонка: Профиль */}
          <div className="lg:col-span-1">
            {/* Здесь теперь будет только кнопка, открывающая модальное окно */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 sm:p-8 text-center">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                Ваш профиль
              </h2>
              <Image
                src={user.image || "/file.svg"}
                alt="User avatar"
                width={128}
                height={128}
                className="w-32 h-32 rounded-full object-cover border-4 border-white dark:border-gray-700 shadow-md mx-auto mb-4"
              />
              <p className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                {user.name || user.email}
              </p>
              <p className="text-gray-500 text-sm mb-6">{user.email}</p>
              <EditProfileModal user={user} updateAction={updateProfile} />
            </div>
          </div>

          {/* Правая колонка: Посты и другие карточки */}
          <div className="lg:col-span-2 space-y-8">
            <PostsTable userPosts={userPosts} allCategories={allCategories} />
            <PasswordCard />
          </div>
        </div>
      </div>
    </div>
  );
}
