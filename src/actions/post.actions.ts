"use server";

import { auth } from "@/auth/auth";
import prisma from "@/utils/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

/**
 * Создает новый пост в базе данных.
 */
export async function addPost(formData: FormData) {
  const title = formData.get("title") as string;
  const content = formData.get("content") as string;
  const published = formData.get("published") === "on";
  const categoryIds = formData.getAll("categoryIds") as string[];

  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }
  if (!title || !content) {
    throw new Error("Title and content are required");
  }

  await prisma.post.create({
    data: {
      title,
      content,
      published,
      authorId: session.user.id,
      categories: {
        connect: categoryIds.map((id) => ({ id })),
      },
    },
  });

  redirect("/blog");
}

/**
 * Обновляет существующий пост по его ID.
 */
export async function updatePost(postId: string, formData: FormData) {
  const title = formData.get("title") as string;
  const content = formData.get("content") as string;
  const published = formData.get("published") === "on";
  const categoryIds = formData.getAll("categoryIds") as string[];

  const session = await auth();
  const postToUpdate = await prisma.post.findUnique({ where: { id: postId } });
  if (!postToUpdate || postToUpdate.authorId !== session?.user?.id) {
    throw new Error("Unauthorized or post not found");
  }

  await prisma.post.update({
    where: { id: postId },
    data: {
      title,
      content,
      published,
      categories: {
        set: categoryIds.map((id) => ({ id })),
      },
    },
  });

  revalidatePath(`/blog/${postId}`);
  revalidatePath("/blog");
}

/**
 * Удаляет пост по его ID.
 */
export async function deletePost(postId: string) {
  const session = await auth();
  const postToDelete = await prisma.post.findUnique({ where: { id: postId } });
  if (!postToDelete || postToDelete.authorId !== session?.user?.id) {
    throw new Error("Unauthorized or post not found");
  }

  await prisma.post.delete({ where: { id: postId } });

  revalidatePath("/blog");
  redirect("/blog");
}

/**
 * Получает опубликованные посты.
 * Если указано имя рубрики, фильтрует посты по ней.
 */
export async function getPublishedPosts(options: {
  categoryName?: string;
  limit?: number;
}) {
  const { categoryName, limit = 5 } = options;

  const whereClause = {
    published: true,
    ...(categoryName && {
      // Если categoryName передан, добавляем это условие
      categories: {
        some: {
          name: categoryName,
        },
      },
    }),
  };

  try {
    const posts = await prisma.post.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
      take: limit,
      include: {
        author: { select: { email: true, image: true, name: true } },
        categories: true,
      },
    });
    return posts;
  } catch (error) {
    console.error("Failed to get posts:", error);
    return [];
  }
}
