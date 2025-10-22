"use client";

import { useEffect, useState, useTransition } from "react";
import { useChatSocket } from "@/hooks/useChatSocket";
import { useChatStore } from "@/store/chat.store";
import { getMessagesForConversation } from "@/actions/chat.actions";
import { Input, Button } from "@heroui/react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { Conversation, Message } from "@/generated/prisma/client";
import { useSearchParams } from "next/navigation";

// Helper component for Conversation List Item
interface ConversationListItemProps {
  conversation: Conversation & {
    user1: {
      id: string;
      name: string | null;
      email: string;
      image: string | null;
    };
    user2: {
      id: string;
      name: string | null;
      email: string;
      image: string | null;
    };
    messages: Message[];
  };
  isActive: boolean;
  onClick: (conversationId: string) => void;
  currentUserId: string;
}

const ConversationListItem: React.FC<ConversationListItemProps> = ({
  conversation,
  isActive,
  onClick,
  currentUserId,
}) => {
  const otherUser =
    conversation.user1.id === currentUserId
      ? conversation.user2
      : conversation.user1;
  const lastMessage = conversation.messages[0];

  return (
    <div
      className={`flex items-center p-4 cursor-pointer rounded-lg transition-colors ${
        isActive
          ? "bg-blue-100 dark:bg-blue-900"
          : "hover:bg-gray-100 dark:hover:bg-gray-700"
      }`}
      onClick={() => onClick(conversation.id)}
    >
      <Image
        src={otherUser.image || "/file.svg"}
        alt={otherUser.name || otherUser.email}
        width={40}
        height={40}
        className="rounded-full mr-3"
      />
      <div className="flex-grow">
        <p className="font-semibold text-gray-800 dark:text-gray-100">
          {otherUser.name || otherUser.email}
        </p>
        {lastMessage && (
          <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
            {lastMessage.content}
          </p>
        )}
      </div>
    </div>
  );
};

// Main Chat Client Page
interface ChatClientPageProps {
  initialConversations: (Conversation & {
    user1: {
      id: string;
      name: string | null;
      email: string;
      image: string | null;
    };
    user2: {
      id: string;
      name: string | null;
      email: string;
      image: string | null;
    };
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
    updateConversations, // ИСПОЛЬЗУЕМ НОВЫЙ МЕТОД
    setActiveConversationId,
    setMessages,
    addMessage,
  } = useChatStore();

  const [messageInput, setMessageInput] = useState("");
  const [isPending, startTransition] = useTransition();
  const searchParams = useSearchParams();
  const urlConversationId = searchParams.get("conversationId");

  // Инициализация диалогов
  useEffect(() => {
    if (initialConversations && Array.isArray(initialConversations)) {
      console.log("Setting initial conversations:", initialConversations.length);
      setConversations(initialConversations);
      
      if (!activeConversationId) {
        if (urlConversationId) {
          console.log("Setting active from URL:", urlConversationId);
          setActiveConversationId(urlConversationId);
        } else if (initialConversations?.[0]?.id) {
          console.log("Setting active from first conversation:", initialConversations[0].id);
          setActiveConversationId(initialConversations[0].id);
        }
      }
    }
  }, [initialConversations]);

  useEffect(() => {
  if (!socket) return;

  const handleReceiveMessage = (newMessage: Message) => {
    console.log("Received message for conversation:", newMessage.conversationId, "Active:", activeConversationId);

    // Добавляем сообщение только если это активный диалог
    if (newMessage.conversationId === activeConversationId) {
      console.log("Adding message to active conversation");
      
      // УДАЛЯЕМ временное сообщение перед добавлением настоящего
      setMessages((prevMessages: any[]) => {
        // Фильтруем временные сообщения для этого conversationId
        const filteredMessages = prevMessages.filter(
          (msg: { id: { toString: () => string; }; conversationId: string; }) => !(msg.id.toString().startsWith('temp-') && msg.conversationId === newMessage.conversationId)
        );
        // Добавляем настоящее сообщение
        return [...filteredMessages, newMessage];
      });
    }

    // Обновляем список диалогов
    updateConversations((prevConversations) => {
      if (!Array.isArray(prevConversations)) {
        console.warn('prevConversations is not an array');
        return [];
      }

      const updatedConversations = prevConversations.map((conv) => {
        if (conv.id === newMessage.conversationId) {
          return {
            ...conv,
            messages: [newMessage], // Только для предпросмотра
            updatedAt: new Date(newMessage.createdAt),
          };
        }
        return conv;
      });

      // Сортируем по времени обновления
      return updatedConversations.sort((a, b) => 
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );
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
      console.log("Clearing messages - no active conversation or user");
      setMessages([]);
      return;
    }

    console.log("Loading messages for conversation:", activeConversationId);
    startTransition(async () => {
      try {
        const fetchedMessages = await getMessagesForConversation(activeConversationId);
        console.log("Fetched messages:", fetchedMessages?.length);
        
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

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!socket || !activeConversationId || !messageInput.trim() || !currentUserId) {
      console.log("Cannot send message - missing requirements");
      return;
    }

    console.log("Sending message to:", activeConversationId);

    // Оптимистичное обновление
    const tempMessage: Message = {
      id: `temp-${Date.now()}`,
      content: messageInput.trim(),
      senderId: currentUserId,
      conversationId: activeConversationId,
      createdAt: new Date()
    };

    addMessage(tempMessage);
    socket.emit("sendMessage", {
      conversationId: activeConversationId,
      content: messageInput.trim(),
    });

    setMessageInput("");
  };

  const handleConversationClick = (conversationId: string) => {
    console.log("Conversation clicked:", conversationId);
    setActiveConversationId(conversationId);
  };

  if (!currentUserId) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        Загрузка пользователя...
      </div>
    );
  }

  const activeConversation = Array.isArray(conversations)
    ? conversations.find((conv) => conv.id === activeConversationId)
    : undefined;

  console.log("Rendering - Active conversation:", activeConversation?.id);

  const otherUserInActiveConversation = activeConversation
    ? activeConversation.user1.id === currentUserId
      ? activeConversation.user2
      : activeConversation.user1
    : null;

  const safeConversations = Array.isArray(conversations) ? conversations : (initialConversations || []);

  return (
    <div className="flex flex-grow w-full h-full bg-gray-50 dark:bg-gray-900">
      {/* Sidebar for Conversations */}
      <div className="w-1/4 border-r border-gray-200 dark:border-gray-700 p-4 overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">
          Диалоги
        </h2>
        <div className="space-y-2">
          {safeConversations.length > 0 ? (
            safeConversations.map((conv) => (
              <ConversationListItem
                key={conv.id}
                conversation={conv}
                isActive={conv.id === activeConversationId}
                onClick={handleConversationClick}
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

      {/* Main Chat Area */}
      <div className="flex flex-col flex-grow">
        {activeConversationId && activeConversation ? (
          <>
            {/* Chat Header */}
            <div className="bg-white dark:bg-gray-800 p-4 border-b border-gray-200 dark:border-gray-700 flex items-center">
              {otherUserInActiveConversation && (
                <Image
                  src={otherUserInActiveConversation.image || "/file.svg"}
                  alt={
                    otherUserInActiveConversation.name ||
                    otherUserInActiveConversation.email
                  }
                  width={40}
                  height={40}
                  className="rounded-full mr-3"
                />
              )}
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                {otherUserInActiveConversation?.name ||
                  otherUserInActiveConversation?.email ||
                  "Неизвестный пользователь"}
              </h3>
            </div>

            {/* Messages Display */}
            <div className="flex-grow p-4 overflow-y-auto space-y-4">
              {Array.isArray(messages) && messages.length > 0 ? (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${
                      msg.senderId === currentUserId
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg shadow ${
                        msg.senderId === currentUserId
                          ? "bg-blue-500 text-white"
                          : "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      } ${
                        msg.id.toString().startsWith('temp-') ? 'opacity-70' : ''
                      }`}
                    >
                      <p>{msg.content}</p>
                      <span className="text-xs opacity-75 mt-1 block">
                        {new Date(msg.createdAt).toLocaleTimeString()}
                        {msg.id.toString().startsWith('temp-') && ' (отправляется...)'}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                  Нет сообщений. Начните общение!
                </div>
              )}
            </div>

            {/* Message Input */}
            <form
              onSubmit={handleSendMessage}
              className="bg-white dark:bg-gray-800 p-4 border-t border-gray-200 dark:border-gray-700 flex items-center gap-2"
            >
              <Input
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                placeholder="Напишите сообщение..."
                className="flex-grow"
                disabled={isPending}
              />
              <Button 
                type="submit" 
                color="primary" 
                disabled={isPending || !messageInput.trim()}
              >
                {isPending ? "Отправка..." : "Отправить"}
              </Button>
            </form>
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
            {safeConversations.length === 0 
              ? "У вас пока нет диалогов" 
              : "Выберите диалог для начала общения"
            }
          </div>
        )}
      </div>
    </div>
  );
}