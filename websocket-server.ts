import { Server } from "socket.io";
import { PrismaClient } from "./src/generated/prisma/index.js";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();
const io = new Server(3001, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// 1. Определяем userSocketMap
const userSocketMap: { [key: string]: string } = {};

console.log("WebSocket server started on port 3001");

io.on("connection", async (socket) => {
  console.log("A user connected:", socket.id);

  const token = socket.handshake.auth.token;

  if (!token) {
    console.log(
      "Authentication token not provided. Disconnecting socket:",
      socket.id
    );
    socket.disconnect(true);
    return;
  }

  const userId = await verifyTokenAndGetUserId(token);

  if (!userId) {
    console.log(
      "Invalid authentication token. Disconnecting socket:",
      socket.id
    );
    socket.disconnect(true);
    return;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (socket as any).userId = userId;

  // 2. Добавляем пользователя в карту при подключении
  userSocketMap[userId] = socket.id;
  console.log(`User ${userId} connected with socket ${socket.id}`);
  console.log("Current user sockets:", userSocketMap);

  const userConversations = await prisma.conversation.findMany({
    where: {
      OR: [{ user1Id: userId }, { user2Id: userId }],
    },
    select: { id: true },
  });

  userConversations.forEach((conversation: { id: string | string[] }) => {
    socket.join(conversation.id);
    console.log(
      `Socket ${socket.id} (User ${userId}) joined conversation room: ${conversation.id}`
    );
  });

  socket.on("joinConversation", async (conversationId: string) => {
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
    });

    if (
      conversation &&
      (conversation.user1Id === userId || conversation.user2Id === userId)
    ) {
      socket.join(conversationId);
      console.log(
        `Socket ${socket.id} (User ${userId}) explicitly joined conversation room: ${conversationId}`
      );
    } else {
      console.warn(
        `User ${userId} tried to join unauthorized conversation: ${conversationId}`
      );
      socket.emit("error", "Unauthorized to join this conversation");
    }
  });

  socket.on(
    "sendMessage",

    async ({
      conversationId,

      content,

      sharedPostId,

      sharedPostTitle, // Принимаем заголовок
    }: {
      conversationId: string;

      content: string;

      sharedPostId?: string;

      sharedPostTitle?: string;
    }) => {
      const senderId = (socket as any).userId;

      if (!senderId) return socket.emit("error", "Unauthorized");

      try {
        // 1. Создаем сообщение в БД (только с ID)

        const newMessage = await prisma.message.create({
          data: {
            conversationId,

            senderId,

            content,

            type: sharedPostId ? "shared_post" : "text",

            sharedPostId: sharedPostId,
          },

          include: {
            sender: true, // Включаем отправителя, чтобы он был в объекте
          },
        });

        // 2. Собираем объект для отправки вручную, БЕЗ доп. запросов

        const messageForClient = {
          ...newMessage,

          // Если это пост, добавляем информацию о нем

          sharedPost: sharedPostId
            ? {
                id: sharedPostId,

                title: sharedPostTitle,

                // Добавляем "заглушки", чтобы соответствовать типу на клиенте

                content: "Загрузка...",

                createdAt: new Date(),

                author: {
                  name: newMessage.sender.name,

                  image: newMessage.sender.image,

                  email: newMessage.sender.email,
                },

                reactions: [],
              }
            : null,
        };

        // 3. Отправляем собранный объект

        io.to(conversationId).emit("receiveMessage", messageForClient);

        console.log(`Message sent to conversation ${conversationId}`);
      } catch (error) {
        console.error("Error handling sendMessage event:", error);

        socket.emit("error", "Failed to send message");
      }
    }
  );

  socket.on(
    "deleteMessage",
    async (data: { messageId: string; conversationId: string }) => {
      try {
        const { messageId, conversationId } = data;

        // Проверяем, что комната диалога существует, чтобы не слать события в никуда
        const conversation = await prisma.conversation.findUnique({
          where: { id: conversationId },
          select: { id: true },
        });

        if (!conversation) {
          console.warn(
            `Attempted to delete message in non-existent conversation: ${conversationId}`
          );
          return;
        }

        // Просто отправляем событие всем в комнате этого диалога
        io.to(conversationId).emit("messageDeleted", {
          deletedMessageId: messageId,
          conversationId: conversationId,
        });

        console.log(
          `Sent 'messageDeleted' event for message ${messageId} in conversation ${conversationId}`
        );
      } catch (error) {
        console.error("Error handling deleteMessage event:", error);
      }
    }
  );

  socket.on(
    "editMessage",
    async (data: {
      messageId: string;
      newContent: string;
      conversationId: string;
    }) => {
      try {
        const { messageId, newContent, conversationId } = data;
        const userId = (socket as any).userId;

        const message = await prisma.message.findUnique({
          where: { id: messageId },
          select: { senderId: true },
        });

        if (!message || message.senderId !== userId) {
          socket.emit("error", "Unauthorized to edit this message");
          return;
        }

        const updatedMessage = await prisma.message.update({
          where: { id: messageId },
          data: {
            content: newContent,
            isEdited: true,
          },
        });

        io.to(conversationId).emit("messageEdited", {
          messageId,
          newContent: updatedMessage.content,
          isEdited: updatedMessage.isEdited,
          conversationId,
        });

        console.log(
          `Sent 'messageEdited' event for message ${messageId} in conversation ${conversationId}`
        );
      } catch (error) {
        console.error("Error handling editMessage event:", error);
      }
    }
  );

  socket.on("disconnect", () => {
    // 3. Удаляем пользователя из карты при отключении
    const disconnectedUserId = (socket as any).userId;
    if (disconnectedUserId && userSocketMap[disconnectedUserId]) {
      delete userSocketMap[disconnectedUserId];
      console.log(
        `User ${disconnectedUserId} disconnected and removed from map.`
      );
      console.log("Current user sockets:", userSocketMap);
    }
  });
});

async function verifyTokenAndGetUserId(token: string): Promise<string | null> {
  try {
    if (!process.env.NEXTAUTH_SECRET) {
      console.error("NEXTAUTH_SECRET is not defined.");
      return null;
    }
    const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET) as {
      id: string;
    };
    return decoded.id;
  } catch (error) {
    console.error("JWT verification failed:", error);
    return null;
  }
}
