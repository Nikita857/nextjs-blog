"use client";

import { useSession } from "next-auth/react";
import { useChatSocket } from "@/hooks/useChatSocket";
import { useChatStore, FullConversation } from "@/store/chat.store";
import { useConversations } from "@/hooks/useConversations";
import { useChatEvents } from "@/hooks/useChatEvents";
import { useMessages } from "@/hooks/useMessages";

import { ConversationList } from "@/components/chat/conversation-list";
import { ChatHeader } from "@/components/chat/chat-header";
import { MessageList } from "@/components/chat/message-list";
import { MessageInput } from "@/components/chat/message-input";
import { ChatPlaceholder } from "@/components/chat/chat-placeholder";

interface ChatClientPageProps {
  initialConversations: FullConversation[];
}

export default function ChatClientPage({
  initialConversations,
}: ChatClientPageProps) {
  const { data: session } = useSession();
  const currentUserId = session?.user?.id;
  const socket = useChatSocket();

  // Управляем диалогами
  const { conversations, activeConversationId, setActiveConversationId } =
    useConversations(initialConversations);

  // Слушаем события сокета
  useChatEvents(socket, activeConversationId);

  // Управляем сообщениями
  const {
    messages,
    isPending,
    handleSendMessage,
    handleDeleteMessage,
    handleEditMessage,
    handleTyping,
  } = useMessages(socket, activeConversationId);

  // Получаем оставшиеся состояния из стора
  const { typingUsers, onlineUsers } = useChatStore();

  // Логика для определения собеседника
  const activeConversation = conversations.find(
    (conv) => conv.id === activeConversationId
  );
  const otherUserInActiveConversation = activeConversation
    ? activeConversation.user1.id === currentUserId
      ? activeConversation.user2
      : activeConversation.user1
    : null;

  const typingUsersInConversation = typingUsers.filter(
    (id) => id !== currentUserId
  );

  if (!currentUserId) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        Загрузка пользователя...
      </div>
    );
  }

  return (
    <div className="flex flex-grow w-full h-full bg-gray-50 dark:bg-gray-900">
      <ConversationList
        conversations={conversations}
        activeConversationId={activeConversationId}
        currentUserId={currentUserId}
        onConversationClick={setActiveConversationId}
        onlineUsers={onlineUsers}
      />
      <div className="flex flex-col flex-grow">
        {activeConversation ? (
          <>
            <ChatHeader
              otherUser={otherUserInActiveConversation}
              typingUsers={typingUsersInConversation}
              onlineUsers={onlineUsers}
            />
            <MessageList
              messages={messages}
              currentUserId={currentUserId}
              onDeleteMessage={handleDeleteMessage}
              onEditMessage={handleEditMessage}
            />
            <MessageInput
              onSendMessage={handleSendMessage}
              isSending={isPending}
              onTyping={handleTyping}
            />
          </>
        ) : (
          <ChatPlaceholder hasConversations={conversations.length > 0} />
        )}
      </div>
    </div>
  );
}
