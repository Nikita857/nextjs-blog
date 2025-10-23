"use client";

import { Conversation, Message } from "@/generated/prisma";
import ConversationListItem from "./conversation-list-item";

// Определяем тип для пропсов
type ConversationWithDetails = Conversation & {
  user1: { id: string; name: string | null; email: string; image: string | null };
  user2: { id: string; name: string | null; email: string; image: string | null };
  messages: Message[];
};

interface ConversationListProps {
  conversations: ConversationWithDetails[];
  activeConversationId: string | null;
  currentUserId: string;
  onConversationClick: (conversationId: string) => void;
}

export const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
  activeConversationId,
  currentUserId,
  onConversationClick,
}) => {
  return (
    <div className="w-1/4 border-r border-gray-200 dark:border-gray-700 p-4 overflow-y-auto">
      <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">
        Диалоги
      </h2>
      <div className="space-y-2">
        {conversations.length > 0 ? (
          conversations.map((conv) => (
            <ConversationListItem
              key={conv.id}
              conversation={conv}
              isActive={conv.id === activeConversationId}
              onClick={onConversationClick}
              currentUserId={currentUserId}
            />
          ))
        ) : (
          <p className="text-gray-500 dark:text-gray-400 p-4 text-center">
            Нет диалогов
          </p>
        )}
      </div>
    </div>
  );
};
