import { auth } from "@/auth/auth";
import prisma from "@/utils/prisma";
import { notFound } from "next/navigation";
import { revalidatePath } from "next/cache";
import PostActions from "@/components/blog/post.actions"; // Импортируем новый компонент

type Props = {
  params: {
    id: string;
  };
};

export default async function PostPage({ params }: Props) {
  const session = await auth();
  const post = await prisma.post.findUnique({
    where: { id: params.id },
    include: { author: { select: { email: true } } },
  });

  if (!post) {
    notFound();
  }

  const isAuthor = session?.user?.id === post.authorId;

  async function updatePost(formData: FormData) {
    "use server";
    const title = formData.get("title") as string;
    const content = formData.get("content") as string;
    const published = formData.get("published") === "on";
    if (!title || !content) return;

    const postToUpdate = await prisma.post.findUnique({ where: { id: params.id } });
    const currentSession = await auth();
    if (!postToUpdate || postToUpdate.authorId !== currentSession?.user?.id) {
      throw new Error("Unauthorized");
    }

    await prisma.post.update({
      where: { id: params.id },
      data: { title, content, published },
    });

    revalidatePath(`/blog/${params.id}`); // Обновляем кеш страницы
  }

  async function deletePost() {
    "use server";
    const postToDelete = await prisma.post.findUnique({ where: { id: params.id } });
    const currentSession = await auth();
    if (!postToDelete || postToDelete.authorId !== currentSession?.user?.id) {
      throw new Error("Unauthorized");
    }

    await prisma.post.delete({ where: { id: params.id } });

  }

  return (
    <article className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 sm:p-8 md:p-10">
        <header className="mb-8 border-b border-gray-200 dark:border-gray-700 pb-6">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100 mb-4 leading-tight">
            {post.title}
          </h1>
          <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center space-x-2">
              <div className="w-9 h-9 bg-gray-200 dark:bg-gray-600 rounded-full flex-shrink-0"></div>
              <span className="font-medium">{post.author.email}</span>
            </div>
            <span className="text-gray-300 dark:text-gray-600">•</span>
            <time dateTime={post.createdAt.toISOString()}>
              {new Date(post.createdAt).toLocaleDateString('ru-RU', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </time>
          </div>
        </header>

        <div className="prose prose-lg lg:prose-xl max-w-none dark:prose-invert">
          {post.content}
        </div>

        {/* --- РЕНДЕРИМ КОМПОНЕНТ С КНОПКАМИ --- */}
        {isAuthor && (
          <PostActions
            post={post}
            updatePostAction={updatePost}
            deletePostAction={deletePost}
          />
        )}
      </div>
    </article>
  );
}