"use client";

import { Tooltip } from "@heroui/react";
import Image from "next/image";
import { memo } from "react";

// Тип для пользователя, отображаемого в шапке
type OtherUser = {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
} | null;

interface ChatHeaderProps {
  otherUser: OtherUser;
  typingUsers: string[];
  onlineUsers: string[];
}

// eslint-disable-next-line react/display-name
const ChatHeaderComponent: React.FC<ChatHeaderProps> = ({ otherUser, typingUsers, onlineUsers }) => {
  const isTyping = otherUser && typingUsers.includes(otherUser.id);
  const isOnline = otherUser && onlineUsers.includes(otherUser.id);

  console.log("Is online Header: ", isOnline)

  return (
    <div className="bg-white dark:bg-gray-800 p-4 border-b border-gray-200 dark:border-gray-700 flex items-center">
      {otherUser && (
        <div className="relative">
          <Image
            src={otherUser.image || '/file.svg'}
            alt={otherUser.name || otherUser.email}
            width={40}
            height={40}
            className="rounded-full mr-3"
          />
          {isOnline && (
            <Tooltip content="Онлайн" showArrow={true}>
              <span className="absolute bottom-0 right-3 block h-2.5 w-2.5 rounded-full bg-green-500 ring-2 ring-white" />
            </Tooltip>
          )}
        </div>
      )}
      <div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
          {otherUser?.name || otherUser?.email || 'Неизвестный пользователь'}
        </h3>
        {isTyping && <p className="text-sm text-gray-500">печатает...</p>}
      </div>
    </div>
  );
};


export const ChatHeader = memo(ChatHeaderComponent);
