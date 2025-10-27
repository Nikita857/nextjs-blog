"use client";

import Image from "next/image";
import { memo } from "react";

// Тип для пользователя, отображаемого в шапке
type OtherUser = {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
} | null;

import { Button } from "@heroui/react";

// Иконка для стрелки
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const BackIcon = (props: any) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    {...props}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15.75 19.5L8.25 12l7.5-7.5"
    />
  </svg>
);

interface ChatHeaderProps {
  otherUser: OtherUser;
  typingUsers: string[];
  onlineUsers: string[];
  onBack: () => void; // <-- Новый проп
}

const ChatHeaderComponent: React.FC<ChatHeaderProps> = ({
  otherUser,
  typingUsers,
  onlineUsers,
  onBack,
}) => {
  const isTyping = otherUser && typingUsers.includes(otherUser.id);
  const isOnline = otherUser && onlineUsers.includes(otherUser.id);

  return (
    <div className="bg-white dark:bg-gray-800 p-4 border-b border-gray-200 dark:border-gray-700 flex items-center">
      {/* Кнопка "Назад" для мобильных */}
      <Button
        isIconOnly
        variant="flat"
        className="md:hidden mr-2" // Показываем только на мобильных
        onPress={onBack}
      >
        <BackIcon className="w-6 h-6" />
      </Button>

      {otherUser && (
        <div className="relative mr-3">
          {" "}
          {/* Обертка */}
          <Image
            src={otherUser.image || "/file.svg"}
            alt={otherUser.name || otherUser.email}
            width={40}
            height={40}
            className="rounded-full"
          />
          {/* Индикатор онлайна */}
          {isOnline && (
            <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-green-500 ring-2 ring-white" />
          )}
        </div>
      )}
      <div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
          {otherUser?.name || otherUser?.email || "Неизвестный пользователь"}
        </h3>
        {isTyping && <p className="text-sm text-gray-500">печатает...</p>}
      </div>
    </div>
  );
};

export const ChatHeader = memo(ChatHeaderComponent);
