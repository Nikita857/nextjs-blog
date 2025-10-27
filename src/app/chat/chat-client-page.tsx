'use client';

import { useChatSocket } from "@/hooks/useChatSocket";
import {
  FullConversation,
  useChatStore,
} from "@/store/chat.store";
import { useSession } from "next-auth/react";
import { useConversations } from "@/hooks/useConversations";
import { ConversationList } from "@/components/chat/conversation-list";
import { ChatHeader } from "@/components/chat/chat-header";
import { MessageList } from "@/components/chat/message-list";
import { MessageInput } from "@/components/chat/message-input";
import { ChatPlaceholder } from "@/components/chat/chat-placeholder";
import { useChatEvents } from "@/hooks/useChatEvents";
import { useMessages } from "@/hooks/useMessages";

interface ChatClientPageProps {
  initialConversations: FullConversation[];
}

export default function ChatClientPage({
  initialConversations,
}: ChatClientPageProps) {

  const { data: session } = useSession();
  const currentUserId = session?.user?.id;
  const socket = useChatSocket();

  const { 
    conversations, 
    activeConversationId, 
    setActiveConversationId 
  } = useConversations(initialConversations);
  
  useChatEvents(socket, activeConversationId);

  const {
    messages,
    isPending,
    handleSendMessage,
    handleDeleteMessage,
    handleEditMessage,
    handleTyping,
  } = useMessages(socket, activeConversationId);

  const { typingUsers, onlineUsers } = useChatStore();

  const activeConversation = conversations.find(
    (conv) => conv.id === activeConversationId
  );
  const otherUserInActiveConversation = activeConversation
    ? activeConversation.user1.id === currentUserId
      ? activeConversation.user2
      : activeConversation.user1
    : null;
  
  const typingUsersInConversation = typingUsers.filter(id => id !== currentUserId);

  if (!currentUserId) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        Загрузка пользователя...
      </div>
    );
  }

  console.log("Current activeConversationId:", activeConversationId);
  console.log("ConversationList visibility condition:", activeConversationId ? 'hidden md:block' : 'block');
  console.log("Chat window visibility condition:", activeConversationId ? 'flex' : 'hidden md:flex');

  return (
    <div className="flex flex-grow w-full h-full bg-gray-50 dark:bg-gray-900">
      <div className={`
        w-full md:w-1/3 lg:w-1/3 
        border-r border-gray-200 dark:border-gray-700 p-4 overflow-y-auto
        ${activeConversationId ? 'hidden md:block' : 'block'}
      `}>
        <ConversationList
          conversations={conversations}
          activeConversationId={activeConversationId}
          currentUserId={currentUserId}
          onConversationClick={setActiveConversationId}
          onlineUsers={onlineUsers}
        />
      </div>

      <div className={`
        flex-col flex-grow 
        ${activeConversationId ? 'flex' : 'hidden md:flex'}
        md:w-2/3 lg:w-2/3 
      `}>
        {activeConversation ? (
          <>
            <ChatHeader
              otherUser={otherUserInActiveConversation}
              typingUsers={typingUsersInConversation}
              onlineUsers={onlineUsers}
              onBack={() => {
                console.log("Back button clicked!");
                setActiveConversationId(null);
              }} 
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
