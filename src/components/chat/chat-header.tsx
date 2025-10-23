"use client";

import Image from 'next/image';

// Тип для пользователя, отображаемого в шапке
type OtherUser = {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
} | null;

interface ChatHeaderProps {
  otherUser: OtherUser;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({ otherUser }) => {
  return (
    <div className="bg-white dark:bg-gray-800 p-4 border-b border-gray-200 dark:border-gray-700 flex items-center">
      {otherUser && (
        <Image
          src={otherUser.image || '/file.svg'}
          alt={otherUser.name || otherUser.email}
          width={40}
          height={40}
          className="rounded-full mr-3"
        />
      )}
      <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
        {otherUser?.name || otherUser?.email || 'Неизвестный пользователь'}
      </h3>
    </div>
  );
};
