import { auth } from "@/auth/auth";
import { redirect } from "next/navigation";
import prisma from "@/utils/prisma";

import FriendsPageClient from "@/components/friends/friends-page-client"; // Будет создан на следующем шаге
import { FriendshipStatus } from "@/generated/prisma";

export default async function FriendsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/api/auth/signin"); // Перенаправляем на страницу входа, если не авторизован
  }

  const userId = session.user.id;

  // Загружаем все связанные с пользователем дружбы
  const friendships = await prisma.friendship.findMany({
    where: {
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

  // Фильтруем запросы
  const pendingIncomingRequests = friendships.filter(
    (f) => f.receiverId === userId && f.status === FriendshipStatus.PENDING
  );
  const pendingOutgoingRequests = friendships.filter(
    (f) => f.senderId === userId && f.status === FriendshipStatus.PENDING
  );
  const acceptedFriends = friendships.filter(
    (f) => f.status === FriendshipStatus.ACCEPTED
  );

  // Преобразуем acceptedFriends в список объектов User
  const friendsList = acceptedFriends.map((f) => {
    const friendUser = f.senderId === userId ? f.receiver : f.sender;
    return {
        id: friendUser.id,
        name: friendUser.name,
        email: friendUser.email,
        image: friendUser.image,
        friendshipId: f.id
    }
  });

  return (
    <FriendsPageClient
      initialFriends={friendsList}
      initialPendingIncomingRequests={pendingIncomingRequests}
      initialPendingOutgoingRequests={pendingOutgoingRequests}
    />
  );
}
