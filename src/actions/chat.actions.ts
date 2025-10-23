"use server";

import { auth } from "@/auth/auth";
import prisma from "@/utils/prisma";
import { error } from "console";
import { revalidatePath } from "next/cache";
import { success } from "zod";

/**
 * Получает все диалоги для текущего пользователя.
 */
export async function getConversations() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const userId = session.user.id;

  const conversations = await prisma.conversation.findMany({
    where: {
      OR: [{ user1Id: userId }, { user2Id: userId }],
    },
    include: {
      user1: {
        select: { id: true, name: true, email: true, image: true },
      },
      user2: {
        select: { id: true, name: true, email: true, image: true },
      },
      messages: {
        orderBy: { createdAt: "asc" },
        take: 1, // Только последнее сообщение для превью
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  return conversations;
}

/**
 * Получает сообщения для конкретного диалога.
 */
export async function getMessagesForConversation(conversationId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const userId = session.user.id;

  // Проверяем, что пользователь является участником диалога
  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    select: { user1Id: true, user2Id: true },
  });

  if (
    !conversation ||
    (conversation.user1Id !== userId && conversation.user2Id !== userId)
  ) {
    throw new Error("Unauthorized to access this conversation");
  }

  const messages = await prisma.message.findMany({
    where: { conversationId },
    include: {
      sender: {
        select: { id: true, name: true, email: true, image: true },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  return messages;
}

/**
 * Создает новый диалог между двумя пользователями.
 * Если диалог уже существует, возвращает его.
 */
export async function createConversation(otherUserId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const userId = session.user.id;

  if (userId === otherUserId) {
    throw new Error("Cannot create conversation with self");
  }

  // Проверяем, существует ли уже диалог между этими двумя пользователями
  let conversation = await prisma.conversation.findFirst({
    where: {
      OR: [
        { user1Id: userId, user2Id: otherUserId },
        { user1Id: otherUserId, user2Id: userId },
      ],
    },
  });

  if (!conversation) {
    // Если диалога нет, создаем новый
    conversation = await prisma.conversation.create({
      data: {
        user1Id: userId,
        user2Id: otherUserId,
      },
    });
  }

  revalidatePath("/chat"); // Перезагружаем путь чата, чтобы обновить список диалогов
  return conversation;
}

// Удаляет сообщение по его ID

export async function deleteMessage(messageId: string) {
  const session = await auth();
  if (!session?.user.id) {
    return { error: "Unauthorized" };
  }

  try {
    const message = await prisma.message.findUnique({
      where: {
        id: messageId,
      },
    });

    if (message?.senderId !== session.user.id) {
      return { error: "You are not authorized to delete this message" };
    }

    await prisma.message.delete({
      where: { id: messageId },
    });

    revalidatePath("/");
    return { success: true, deleteMessage: messageId };
  } catch (error) {
    console.error("Failed to delete message", error);
    return { error: "Failed to delete message" };
  }
}
