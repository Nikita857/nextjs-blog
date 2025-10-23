"use client";

import { useEffect, useState, useTransition } from "react";
import { useChatSocket } from "@/hooks/useChatSocket";
import { useChatStore } from "@/store/chat.store";
import { getMessagesForConversation } from "@/actions/chat.actions";
import { useSession } from "next-auth/react";
import { Conversation, Message } from "@/generated/prisma/client";
import { useSearchParams } from "next/navigation";


import { ConversationList } from "@/components/chat/conversation-list";
import { ChatHeader } from "@/components/chat/chat-header";
import { MessageList } from "@/components/chat/message-list";
import { MessageInput } from "@/components/chat/message-input";
import { ChatPlaceholder } from "@/components/chat/chat-placeholder";


interface ChatClientPageProps {
  initialConversations: (Conversation & {
    user1: { id: string; name: string | null; email: string; image: string | null };
    user2: { id: string; name: string | null; email: string; image: string | null };
    messages: Message[];
  })[];
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
    messages,
    setConversations,
    updateConversations,
    setActiveConversationId,
    setMessages,
    addMessage,
  } = useChatStore();

  const [isPending, startTransition] = useTransition();
  const searchParams = useSearchParams();
  const urlConversationId = searchParams.get("conversationId");

  // Инициализация диалогов
  useEffect(() => {
    if (initialConversations && Array.isArray(initialConversations)) {
      setConversations(initialConversations);
      
      if (!activeConversationId) {
        if (urlConversationId) {
          setActiveConversationId(urlConversationId);
        } else if (initialConversations?.[0]?.id) {
          setActiveConversationId(initialConversations[0].id);
        }
      }
    }
  }, [initialConversations, urlConversationId, activeConversationId, setConversations, setActiveConversationId]);

  // Обработка входящих сообщений
  useEffect(() => {
    if (!socket) return;

    const handleReceiveMessage = (newMessage: Message) => {
      if (newMessage.conversationId === activeConversationId) {
        setMessages((prevMessages: any[]) => {
          const filteredMessages = prevMessages.filter(
            (msg: any) => !(msg.id.toString().startsWith('temp-') && msg.conversationId === newMessage.conversationId)
          );
          return [...filteredMessages, newMessage];
        });
      }

      updateConversations((prevConversations) => {
        if (!Array.isArray(prevConversations)) return [];
        const updatedConversations = prevConversations.map((conv) => 
          conv.id === newMessage.conversationId 
            ? { ...conv, messages: [newMessage], updatedAt: new Date(newMessage.createdAt) } 
            : conv
        );
        return updatedConversations.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
      });
    };

    socket.on("receiveMessage", handleReceiveMessage);
    return () => {
      socket.off("receiveMessage", handleReceiveMessage);
    };
  }, [socket, activeConversationId, updateConversations, setMessages]);

  // Загрузка сообщений для активного диалога
  useEffect(() => {
    if (!activeConversationId || !currentUserId) {
      setMessages([]);
      return;
    }

    startTransition(async () => {
      try {
        const fetchedMessages = await getMessagesForConversation(activeConversationId);
        const sortedMessages = Array.isArray(fetchedMessages) 
          ? fetchedMessages.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
          : [];
        setMessages(sortedMessages);
      } catch (error) {
        console.error("Failed to fetch messages:", error);
        setMessages([]);
      }
    });
  }, [activeConversationId, currentUserId, setMessages]);

  // Обработчик отправки сообщения
  const handleSendMessage = (content: string) => {
    if (!socket || !activeConversationId || !currentUserId) return;

    const tempMessage: Message = {
      id: `temp-${Date.now()}`,
      content: content,
      senderId: currentUserId,
      conversationId: activeConversationId,
      createdAt: new Date()
    };

    addMessage(tempMessage);
    socket.emit("sendMessage", {
      conversationId: activeConversationId,
      content: content,
    });
  };

  // --- ПОЛУЧЕНИЕ ДАННЫХ ДЛЯ ОТОБРАЖЕНИЯ ---
  if (!currentUserId) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        Загрузка пользователя...
      </div>
    );
  }

  const safeConversations = Array.isArray(conversations) ? conversations : (initialConversations || []);
  const activeConversation = safeConversations.find((conv) => conv.id === activeConversationId);
  const otherUserInActiveConversation = activeConversation
    ? activeConversation.user1.id === currentUserId
      ? activeConversation.user2
      : activeConversation.user1
    : null;

  return (
    <div className="flex flex-grow w-full h-full bg-gray-50 dark:bg-gray-900">
      <ConversationList
        conversations={safeConversations}
        activeConversationId={activeConversationId}
        currentUserId={currentUserId}
        onConversationClick={setActiveConversationId}
      />

      <div className="flex flex-col flex-grow">
        {activeConversation ? (
          <>
            <ChatHeader otherUser={otherUserInActiveConversation} />
            <MessageList messages={messages} currentUserId={currentUserId} />
            <MessageInput onSendMessage={handleSendMessage} isSending={isPending} />
          </>
        ) : (
          <ChatPlaceholder hasConversations={safeConversations.length > 0} />
        )}
      </div>
    </div>
  );
}