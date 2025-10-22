"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { Input, Button } from "@heroui/react";
import {
  searchUsers,
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  removeFriend,
} from "@/actions/user.action";
import { Friendship, FriendshipStatus } from "@/generated/prisma";


// Определяем тип для пользователя, который возвращается из поиска или списка друзей
type PartialUser = {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
};

type FriendUser = PartialUser & {friendshipId: string};

// Расширяем PartialUser для отображения статуса дружбы
type UserWithStatus = PartialUser & {
  friendshipStatus?: FriendshipStatus; // Статус дружбы с текущим пользователем
  friendshipId?: string; // ID дружбы, если она существует
};

type Props = {
  initialFriends: FriendUser[]; // PartialUser + ID дружбы
  initialPendingIncomingRequests: (Friendship & { sender: PartialUser })[]; // Sender теперь PartialUser
  initialPendingOutgoingRequests: (Friendship & { receiver: PartialUser })[]; // Receiver теперь PartialUser
};

export default function FriendsPageClient({
  initialFriends,
  initialPendingIncomingRequests,
  initialPendingOutgoingRequests,
}: Props) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<UserWithStatus[]>([]);
  const [friends, setFriends] = useState<FriendUser[]>(initialFriends); // Состояние друзей тоже PartialUser
  const [pendingIncoming, setPendingIncoming] = useState(initialPendingIncomingRequests);
  const [pendingOutgoing, setPendingOutgoing] = useState(initialPendingOutgoingRequests);
  const [isSearching, startSearchTransition] = useTransition();
  const [isActionPending, startActionTransition] = useTransition();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.length < 2) return;

    startSearchTransition(async () => {
      const result = await searchUsers(searchQuery);
      if (result.error) {
        console.error(result.error);
        setSearchResults([]);
        return;
      }
      // Добавляем статус дружбы к результатам поиска
      const usersWithStatus = result.users!.map((user: PartialUser) => {
        const isFriend = friends.some(f => f.id === user.id);
        const isPendingIncoming = pendingIncoming.some(f => f.sender.id === user.id);
        const isPendingOutgoing = pendingOutgoing.some(f => f.receiver.id === user.id);

        let status: FriendshipStatus | undefined;
        if (isFriend) status = FriendshipStatus.ACCEPTED;
        else if (isPendingIncoming || isPendingOutgoing) status = FriendshipStatus.PENDING;

        return { ...user, friendshipStatus: status };
      });
      setSearchResults(usersWithStatus);
    });
  };

  const handleSendRequest = async (receiverId: string) => {
    startActionTransition(async () => {
      const result = await sendFriendRequest(receiverId);
      if (result.success) {
        window.location.reload(); 
      }
      console.log(result);
    });
  };

  const handleAcceptRequest = async (friendshipId: string) => {
    startActionTransition(async () => {
      const result = await acceptFriendRequest(friendshipId);
      if (result.success) {
        window.location.reload();
      }
      console.log(result);
    });
  };

  const handleRejectRequest = async (friendshipId: string) => {
    startActionTransition(async () => {
      const result = await rejectFriendRequest(friendshipId);
      if (result.success) {
        window.location.reload();
      }
      console.log(result);
    });
  };

  const handleRemoveFriend = async (friendshipId: string) => {
    startActionTransition(async () => {
      const result = await removeFriend(friendshipId);
      if (result.success) {
        window.location.reload();
      }
      console.log(result);
    });
  };

  return (
    <div className="w-full bg-gray-50 dark:bg-gray-900 flex-grow py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100 mb-8">
          Мои друзья
        </h1>

        {/* Поиск пользователей */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Найти новых друзей
          </h2>
          <form onSubmit={handleSearch} className="flex gap-2 mb-4">
            <Input
              placeholder="Имя или email пользователя"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-grow"
              disabled={isSearching}
            />
            <Button type="submit" color="primary" disabled={isSearching}>
              {isSearching ? "Поиск..." : "Найти"}
            </Button>
          </form>

          {searchResults.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-700 dark:text-gray-300">Результаты поиска:</h3>
              {searchResults.map((user) => (
                <div key={user.id} className="flex items-center justify-between bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Image
                      src={user.image || "/file.svg"}
                      alt={user.name || user.email || "User avatar"}
                      width={40}
                      height={40}
                      className="rounded-full object-cover"
                    />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-100">{user.name || user.email}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
                    </div>
                  </div>
                  {user.friendshipStatus === FriendshipStatus.PENDING ? (
                    <span className="text-sm text-gray-500">Запрос отправлен</span>
                  ) : user.friendshipStatus === FriendshipStatus.ACCEPTED ? (
                    <span className="text-sm text-green-600">Друзья</span>
                  ) : (user.id !== friends.find(f => f.id === user.id)?.id && // Проверяем, что это не текущий друг
                    <Button
                      size="sm"
                      color="primary"
                      onPress={() => handleSendRequest(user.id)}
                      disabled={isActionPending}
                    >
                      Добавить в друзья
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Входящие запросы */}
        {pendingIncoming.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Входящие запросы
            </h2>
            <div className="space-y-3">
              {pendingIncoming.map((friendship) => (
                <div key={friendship.id} className="flex items-center justify-between bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Image
                      src={friendship.sender.image || "/file.svg"}
                      alt={friendship.sender.name || friendship.sender.email || "User avatar"}
                      width={40}
                      height={40}
                      className="rounded-full object-cover"
                    />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-100">{friendship.sender.name || friendship.sender.email}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{friendship.sender.email}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      color="success"
                      onPress={() => handleAcceptRequest(friendship.id)}
                      disabled={isActionPending}
                    >
                      Принять
                    </Button>
                    <Button
                      size="sm"
                      color="danger"
                      onPress={() => handleRejectRequest(friendship.id)}
                      disabled={isActionPending}
                    >
                      Отклонить
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Отправленные запросы */}
        {pendingOutgoing.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Отправленные запросы
            </h2>
            <div className="space-y-3">
              {pendingOutgoing.map((friendship) => (
                <div key={friendship.id} className="flex items-center justify-between bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Image
                      src={friendship.receiver.image || "/file.svg"}
                      alt={friendship.receiver.name || friendship.receiver.email || "User avatar"}
                      width={40}
                      height={40}
                      className="rounded-full object-cover"
                    />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-100">{friendship.receiver.name || friendship.receiver.email}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{friendship.receiver.email}</p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    color="danger"
                    onPress={() => handleRemoveFriend(friendship.id)}
                    disabled={isActionPending}
                  >
                    Отменить запрос
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Мои друзья */}
        {friends.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Мои друзья
            </h2>
            <div className="space-y-3">
              {friends.map((user) => (
                <div key={user.id} className="flex items-center justify-between bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Image
                      src={user.image || "/file.svg"}
                      alt={user.name || user.email || "User avatar"}
                      width={40}
                      height={40}
                      className="rounded-full object-cover"
                    />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-100">{user.name || user.email}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    color="danger"
                    onPress={() => handleRemoveFriend(user.friendshipId!)} // friendshipId должен быть доступен
                    disabled={isActionPending}
                  >
                    Удалить из друзей
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}