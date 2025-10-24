import { deleteMessage, getMessagesForConversation } from "@/actions/chat.actions";
import { FullMessage, useChatStore } from "@/store/chat.store";
import { useSession } from "next-auth/react";
import { useCallback, useEffect, useRef, useTransition } from "react";
import { Socket } from "socket.io-client";

export const useMessages = (socket: Socket | null, activeConversationId: string | null) => {

    const { data: session } = useSession();
          const currentUserId = session?.user?.id;
          const { messages, setMessages, addMessage } = useChatStore();
          const [isPending, startTransition] = useTransition();
          const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    socket.emit("stop_typing", {
      conversationId: activeConversationId,
      userId: currentUserId,
    });

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
    if (!socket || !activeConversationId || !currentUserId) return;

    socket.emit("typing", {
      conversationId: activeConversationId,
      userId: currentUserId,
    });

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    console.log("Handle typing called");

    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("stop_typing", {
        conversationId: activeConversationId,
        userId: currentUserId,
      });
    }, 2000);
  }, [socket, activeConversationId, currentUserId]);

  return {
    messages,
    isPending,
    handleSendMessage,
    handleDeleteMessage,
    handleEditMessage,
    handleTyping
  }
}