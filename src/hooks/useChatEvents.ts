import { FullMessage, useChatStore } from "@/store/chat.store";
import { useEffect } from "react";
import { Socket } from "socket.io-client";


export const useChatEvents = (
  socket: Socket | null,
  activeConversationId: string | null
) => {
  const {
    addMessage,
    updateConversations,
    setMessages,
    addTypingUser,
    removeTypingUser,
    setOnlineUsers,
    addOnlineUser,
    removeOnlineUser,
  } = useChatStore();

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
    };

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

    const handleOnlineUsersList = (userIds: string[]) => {
      console.log("ids of users from websocket: ", userIds);
      setOnlineUsers(userIds);
    };

    const handleUserOnline = (userId: string) => {
      addOnlineUser(userId);
    };

    const handleUserOffline = (userId: string) => {
      removeOnlineUser(userId);
    };

    socket.on("receiveMessage", handleReceiveMessage);
    socket.on("messageDeleted", handleMessageDeleted);
    socket.on("messageEdited", handleMessageEdited);
    socket.on("user_typing", handleUserTyping);
    socket.on("user_stop_typing", handleUserStopTyping);
    socket.on("online_users_list", handleOnlineUsersList);
    socket.on("user_online", handleUserOnline);
    socket.on("user_offline", handleUserOffline);

    return () => {
      socket.off("receiveMessage", handleReceiveMessage);
      socket.off("messageDeleted", handleMessageDeleted);
      socket.off("messageEdited", handleMessageEdited);
      socket.off("user_typing", handleUserTyping);
      socket.off("user_stop_typing", handleUserStopTyping);
      socket.off("user_online", handleUserOnline);
      socket.off("user_offline", handleUserOffline);
    };
  }, [
    socket,
    activeConversationId,
    addMessage,
    updateConversations,
    setMessages,
    addTypingUser,
    removeTypingUser,
    setOnlineUsers,
    addOnlineUser,
    removeOnlineUser,
  ]);
};
