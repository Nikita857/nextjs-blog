"use server";

import { auth } from "@/auth/auth";
import { Comment } from "@/generated/prisma";

export type CommentWithAuthor = Comment & {
  author: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
};
import prisma from "@/utils/prisma";
import { revalidatePath } from "next/cache";

/**
 * Добавляет новый комментарий к посту.
 */
export async function addComment(
  postId: string,
  content: string
): Promise<
  { success: boolean; comment?: Comment; error?: string } | undefined
> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  if (!content || content.trim() === "") {
    return { success: false, error: "Comment content cannot be empty." };
  }

  try {
    const comment = await prisma.comment.create({
      data: {
        postId,
        authorId: session.user.id,
        content,
      },
    });

    revalidatePath(`/blog/${postId}`);
    return { success: true, comment };
  } catch (error) {
    console.error("Failed to add comment:", error);
    return { success: false, error: "Failed to add comment." };
  }
}

/**
 * Получает все комментарии для конкретного поста.
 */
export async function getCommentsForPost(
  postId: string
): Promise<CommentWithAuthor[]> {
  try {
    const comments = await prisma.comment.findMany({
      where: { postId },
      include: {
        author: { select: { id: true, name: true, email: true, image: true } },
      },
      orderBy: { createdAt: "asc" },
    });
    return comments;
  } catch (error) {
    console.error("Failed to get comments for post:", error);
    return [];
  }
}
export async function deleteComment(
  commentId: string
): Promise<{ success: boolean; error?: string }> {
  const session = await auth();

  if (!session?.user?.id) { // Проверяем авторизацию в начале
    return { success: false, error: "Unauthorized" };
  }

  if (!commentId || commentId.trim() === "") { // Более надежная проверка на пустой ID
    return { success: false, error: "Comment ID cannot be empty." };
  }

  try {
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      select: { id: true, authorId: true, postId: true } // Выбираем postId для revalidatePath
    });

    if (!comment) {
      return { success: false, error: "Comment not found." };
    }

    if (comment.authorId !== session.user.id) {
      return { success: false, error: "Unauthorized to delete this comment." };
    }

    await prisma.comment.delete({
      where: { id: commentId },
    });

    revalidatePath(`/blog/${comment.postId}`); // Обновляем страницу поста
    return { success: true };
  } catch (error) {
    console.error("Failed to delete comment: ", error);
    return { success: false, error: "Failed to delete comment." }; // Более информативная ошибка
  }
}
