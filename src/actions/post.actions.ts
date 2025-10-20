"use server";

import { auth } from "@/auth/auth";
import prisma from "@/utils/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function addPost(formData: FormData) {
  "use server";

  const title = formData.get("title") as string;
  const content = formData.get("content") as string;
  const published = formData.get("published") === "on";
  const categoryIds = formData.getAll("categoryIds") as string[];

  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("You must be logged in to create a post.");
  }
  if (!title || !content) {
    return;
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

export async function updatePost(postId: string, formData: FormData) {
  "use server";
  const title = formData.get("title") as string;
  const content = formData.get("content") as string;
  const published = formData.get("published") === "on";
  const categoryIds = formData.getAll("categoryIds") as string[];
  if (!title || !content) return;

  const postToUpdate = await prisma.post.findUnique({
    where: { id: postId },
  });
  const currentSession = await auth();
  if (!postToUpdate || postToUpdate.authorId !== currentSession?.user?.id) {
    throw new Error("Unauthorized");
  }

  await prisma.post.update({
    where: { id: postId },
    data: {
      title,
      content,
      published,
      // 4. Используем `set` для полного обновления связей с рубриками
      categories: {
        set: categoryIds.map((id) => ({ id })),
      },
    },
  });

  revalidatePath(`/blog/${postId}`);
  revalidatePath("/blog"); // Также обновляем главную страницу блога
}

export async function deletePost(postId: string) {
  "use server";
  const postToDelete = await prisma.post.findUnique({
    where: { id: postId },
  });
  const currentSession = await auth();
  if (!postToDelete || postToDelete.authorId !== currentSession?.user?.id) {
    throw new Error("Unauthorized");
  }

  await prisma.post.delete({ where: { id: postId } });
  revalidatePath("/blog");
}

export async function getPublishedPosts(options: {
  categoryName?: string;
  limit?: number;
}) {
  const { categoryName, limit } = options;

  const whereClause = {
    published: true,
    ...(categoryName && {
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
        author: { select: { email: true } },
        categories: true,
      },
    });
    return posts;
  } catch (error) {
    console.error("Failde to get posts", error);
    return [];
  }
}
