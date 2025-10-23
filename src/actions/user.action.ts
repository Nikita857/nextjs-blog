"use server";

import { auth } from "@/auth/auth";
import { FriendshipStatus } from "@/generated/prisma";
import prisma from "@/utils/prisma";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Пароль обязателен"),
    newPassword: z
      .string()
      .min(6, "Новый пароль должен быть не менее 6 символов"),
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: "Новый пароль не должен совпадать со старым",
    path: ["newPassword"],
  });

export async function changePassword(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  const currentPassword = formData.get("currentPassword");
  const newPassword = formData.get("newPassword");
  const confirmPassword = formData.get("confirmPassword");

  if (newPassword !== confirmPassword) {
    console.log(newPassword, "new");
    console.log(confirmPassword, "confirm");
    return { error: "Passwords not same" };
  }

  const validation = passwordSchema.safeParse({ currentPassword, newPassword });
  if (!validation.success) {
    return { error: validation.error.message };
  }

  const user = await prisma.user.findUnique({
    where: {
      id: session.user.id,
    },
  });

  if (!user || !user.password) {
    return { error: "User not found" };
  }

  const isPasswordValid = await bcrypt.compare(
    validation.data.currentPassword,
    user.password
  );

  if (!isPasswordValid) {
    return { error: "Invalid password" };
  }

  const hashedNewPassword = await bcrypt.hash(validation.data.newPassword, 10);
  await prisma.user.update({
    where: { id: user.id },
    data: { password: hashedNewPassword },
  });

  return { success: "Пароль успешно изменен" };
}

export async function searchUsers(query: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  if (!query || query.length < 2) {
    return { users: [] };
  }

  try {
    const users = await prisma.user.findMany({
      where: {
        id: { not: session.user.id },
        OR: [
          { email: { contains: query, mode: "insensitive" } },
          { name: { contains: query, mode: "insensitive" } },
        ],
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
      },
      take: 10,
    });
    return { users };
  } catch (error) {
    console.error("Failed to search users", error);
    return { error: "Failde to search users" };
  }
}

// Отправляет запрос на дружбу
export async function sendFriendRequest(receiverId: string) {
  const session = await auth();

  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  const senderId = session.user.id;

  if (senderId === receiverId) {
    return { error: "Нельзя отправить запрос самому себе" };
  }

  try {
    const existingFriendship = await prisma.friendship.findFirst({
      where: {
        OR: [
          { senderId: senderId, receiverId: receiverId },
          { senderId: receiverId, receiverId: senderId },
        ],
      },
    });

    if (existingFriendship) {
      if (existingFriendship.status === FriendshipStatus.PENDING) {
        return { error: "Запрос на дружбу уже отправлен" };
      }
      if (existingFriendship.status === FriendshipStatus.ACCEPTED) {
        return { error: "Вы уже друзья" };
      }
    }

    await prisma.friendship.create({
      data: {
        senderId: senderId,
        receiverId: receiverId,
        status: FriendshipStatus.PENDING,
      },
    });

    revalidatePath("/friends");
    return { success: "Запрос на дружбу отправлен" };
  } catch (error) {
    console.error("Failed to send friend request", error);
    return { error: "Failed to send friend request" };
  }
}

// Принимает запрос на дружбу

export async function acceptFriendRequest(friendshipId: string) {
  const session = await auth();

  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  try {
    const friendship = await prisma.friendship.findUnique({
      where: { id: friendshipId },
    });

    if (
      !friendship ||
      friendship.receiverId !== session.user.id ||
      friendship.status !== FriendshipStatus.PENDING // <-- ИСПРАВЛЕНО: должно быть PENDING
    ) {
      return { error: "Запрос на дружбу не найден или у вас нет прав" };
    }

    await prisma.friendship.update({
      where: { id: friendshipId },
      data: { status: FriendshipStatus.ACCEPTED },
    });
    revalidatePath("/friends");
    return { success: "Запрос на дружбу принят" };
  } catch (error) {
    console.error("Failed to accept friend request", error);
    return { error: "Failed to accept friend request" };
  }
}

// Отклоняет запрос на дружбу

export async function rejectFriendRequest(friendshipId: string) {
  const session = await auth();

  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  try {
    const friendship = await prisma.friendship.findUnique({
      where: { id: friendshipId },
    });

    if (
      !friendship ||
      friendship.receiverId !== session.user.id ||
      friendship.status !== FriendshipStatus.PENDING // <-- ИСПРАВЛЕНО: должно быть PENDING
    ) {
      return { error: "Запрос на дружбу не найден или у вас нет прав" };
    }

    await prisma.friendship.delete({
      where: { id: friendshipId },
    });
    revalidatePath("/friends");
    return { success: "Запрос на дружбу отклонен" };
  } catch (error) {
    console.error("Failed to reject friend request", error);
    return { error: "Не удалось отклонить запрос на дружбу." };
  }
}

// Удаляет дружбу (или отменяет отправленный запрос)

export async function removeFriend(friendshipId: string) {
  const session = await auth();

  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  try {
    const friendship = await prisma.friendship.findUnique({
      where: { id: friendshipId },
    });
    if (
      !friendship ||
      (friendship.senderId !== session.user.id && // Пользователь должен быть либо отправителем
        friendship.receiverId !== session.user.id) // либо получателем
    ) {
      return { error: "Дружба не найдена или у вас нет прав" };
    }
    // Если дружба в PENDING, ее может удалить только отправитель
    // Если дружба ACCEPTED, ее может удалить любой из друзей
    if (friendship.status === FriendshipStatus.PENDING && friendship.senderId !== session.user.id) {
        return { error: "Вы не можете отменить этот запрос" };
    }


    await prisma.friendship.delete({
      where: { id: friendshipId },
    });

    revalidatePath("/friends");
    return { success: "Дружба удалена" };
  } catch (error) {
    console.error("Failed to delete friendship", error);
    return { error: "Не удалось удалить дружбу" };
  }
}

export async function getFriends() {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  const userId = session.user.id;

  try {
    const friendships = await prisma.friendship.findMany({
      where: {
        status: FriendshipStatus.ACCEPTED,
        OR: [
          { senderId: userId },
          { receiverId: userId },
        ],
      },
      include: {
        sender: { select: { id: true, name: true, email: true, image: true } },
        receiver: { select: { id: true, name: true, email: true, image: true } },
      },
    });

    const friends = friendships.map(friendship => 
      friendship.senderId === userId ? friendship.receiver : friendship.sender
    );

    return { friends };
  } catch (error) {
    console.error("Failed to get friends", error);
    return { error: "Failed to get friends" };
  }
}