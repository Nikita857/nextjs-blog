'use client';

import { useCallback, useEffect, useRef, useTransition } from "react";
import { useChatSocket } from "@/hooks/useChatSocket";
import {
  FullConversation,
  FullMessage,
  useChatStore,
} from "@/store/chat.store";
import {
  getMessagesForConversation,
  deleteMessage,
} from "@/actions/chat.actions";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";

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
  const {
    conversations,
    activeConversationId,
    messages,
    typingUsers,
    setConversations,
    updateConversations,
    setActiveConversationId,
    setMessages,
    addMessage,
    addTypingUser,
    removeTypingUser,
  } = useChatStore();

  const [isPending, startTransition] = useTransition();
  const searchParams = useSearchParams();
  const urlConversationId = searchParams.get("conversationId");
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const safeConversations = Array.isArray(conversations)
    ? conversations
    : initialConversations || [];
  const activeConversation = safeConversations.find(
    (conv) => conv.id === activeConversationId
  );
  const otherUserInActiveConversation = activeConversation
    ? activeConversation.user1.id === currentUserId
      ? activeConversation.user2
      : activeConversation.user1
    : null;

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
  }, [
    initialConversations,
    urlConversationId,
    activeConversationId,
    setConversations,
    setActiveConversationId,
  ]);

  useEffect(() => {
    if (!socket) return;

    const handleReceiveMessage = (newMessage: FullMessage) => {
      if (newMessage.conversationId === activeConversationId) {
        setMessages((prevMessages) => {
          const filteredMessages = prevMessages.filter(
            (msg) =>
              !(
                msg.id.toString().startsWith("temp-") &&
                msg.conversationId === newMessage.conversationId
              )
          );
          return [...filteredMessages, newMessage];
        });
      }
      updateConversations((prevConversations) => {
        if (!Array.isArray(prevConversations)) return [];
        const updatedConversations = prevConversations.map((conv) =>
          conv.id === newMessage.conversationId
            ? {
                ...conv,
                messages: [newMessage],
                updatedAt: new Date(newMessage.createdAt),
              }
            : conv
        );
        return updatedConversations.sort(
          (a, b) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
      });
    };

    const handleMessageDeleted = (data: {
      deletedMessageId: string;
      conversationId: string;
    }) => {
      if (data.conversationId === activeConversationId) {
        setMessages((prevMessages) =>
          prevMessages.filter((msg) => msg.id !== data.deletedMessageId)
        );
      }
    };

    const handleUserTyping = ({
        conversationId,
        userId,
      }: {
        conversationId: string;
        userId: string;
      }) => {
        if (conversationId === activeConversationId) {
          addTypingUser(userId);
        }
      };

      const handleUserStopTyping = ({
        conversationId,
        userId,
      }: {
        conversationId: string;
        userId: string;
      }) => {
        if (conversationId === activeConversationId) {
          removeTypingUser(userId);
        }
      }

    const handleMessageEdited = (data: {
      messageId: string;
      newContent: string;
      isEdited: boolean;
      conversationId: string;
    }) => {
      if (data.conversationId === activeConversationId) {
        setMessages((prevMessages) =>
          prevMessages.map((msg) =>
            msg.id === data.messageId
              ? { ...msg, content: data.newContent, isEdited: data.isEdited }
              : msg
          )
        );
      }
    };

    socket.on("receiveMessage", handleReceiveMessage);
    socket.on("messageDeleted", handleMessageDeleted);
    socket.on("messageEdited", handleMessageEdited);
    socket.on("user_typing", handleUserTyping);
    socket.on("user_stop_typing", handleUserStopTyping);

    return () => {
      socket.off("receiveMessage", handleReceiveMessage);
      socket.off("messageDeleted", handleMessageDeleted);
      socket.off("messageEdited", handleMessageEdited);
      socket.off("user_typing", handleUserTyping);
      socket.off("user_stop_typing", handleUserStopTyping);
    };
  }, [socket, activeConversationId, updateConversations, setMessages, addTypingUser, removeTypingUser, otherUserInActiveConversation]);

  useEffect(() => {
    if (!activeConversationId || !currentUserId) {
      setMessages([]);
      return;
    }
    startTransition(async () => {
      try {
        const fetchedMessages = (await getMessagesForConversation(
          activeConversationId
        )) as FullMessage[];
        const sortedMessages = fetchedMessages.sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
        setMessages(sortedMessages);
      } catch (error) {
        console.error("Failed to fetch messages:", error);
        setMessages([]);
      }
    });
  }, [activeConversationId, currentUserId, setMessages]);

  const handleSendMessage = (content: string) => {
    if (!socket || !activeConversationId || !currentUserId || !session?.user)
      return;
    const tempMessage: FullMessage = {
      id: `temp-${Date.now()}`,
      content: content,
      senderId: currentUserId,
      conversationId: activeConversationId,
      createdAt: new Date(),
      isEdited: false,
      type: "text",
      sharedPostId: null,
      sharedPost: null,
      sender: session.user as any,
    };
    addMessage(tempMessage);
    if(typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    socket.emit('stop_typing', {conversationId: activeConversationId, userId: currentUserId});

    socket.emit("sendMessage", {
      conversationId: activeConversationId,
      content: content,
    });
  };

  const handleDeleteMessage = async (messageId: string) => {
    if (!socket || !activeConversationId) return;

    setMessages((prevMessages) =>
      prevMessages.filter((msg) => msg.id !== messageId)
    );

    socket.emit("deleteMessage", {
      messageId: messageId,
      conversationId: activeConversationId,
    });

    await deleteMessage(messageId);
  };

  const handleEditMessage = (messageId: string, newContent: string) => {
    if (!socket || !activeConversationId) return;

    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === messageId
          ? { ...msg, content: newContent, isEdited: true }
          : msg
      )
    );

    socket.emit("editMessage", {
      messageId,
      newContent,
      conversationId: activeConversationId,
    });
  };

  const handleTyping = useCallback(() => {
    if(!socket || !activeConversationId || !currentUserId) return;

    socket.emit('typing', {conversationId: activeConversationId, userId: currentUserId});

    if(typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    console.log("Handle typing called")

    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('stop_typing', {conversationId: activeConversationId, userId: currentUserId});
    }, 2000);
  }, [socket, activeConversationId, currentUserId]);

  if (!currentUserId) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        Загрузка пользователя...
      </div>
    );
  }

  const typingUsersInConversation = typingUsers.filter(id => id !== currentUserId);

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
            <ChatHeader
              otherUser={otherUserInActiveConversation}
              typingUsers={typingUsersInConversation}
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
          <ChatPlaceholder hasConversations={safeConversations.length > 0} />
        )}
      </div>
    </div>
  );
}