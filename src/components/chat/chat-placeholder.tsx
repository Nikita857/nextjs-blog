"use client";

type ChatPlaceholderProps = {
  hasConversations: boolean;
};

export const ChatPlaceholder = ({ hasConversations }: ChatPlaceholderProps) => {
  return (
    <div
      className="flex items-center justify-center h-full text-gray-500 
      dark:text-gray-400"
    >
      {hasConversations
        ? "Выберите диалог для начала общения"
        : "У вас пока нет диалогов"}
    </div>
  );
};
