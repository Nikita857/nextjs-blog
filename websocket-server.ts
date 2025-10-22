import { Server } from 'socket.io';
import { PrismaClient } from './src/generated/prisma/index.js';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const io = new Server(3001, {
  cors: {
    origin: ['http://localhost:3000', 'http://192.168.1.X:3000', 'http://192.168.14.9:3000'], 
    methods: ['GET', 'POST'],
  },
});

console.log('WebSocket server started on port 3001');

io.on('connection', async (socket) => {
  console.log('A user connected:', socket.id);

  const token = socket.handshake.auth.token;

  if (!token) {
    console.log('Authentication token not provided. Disconnecting socket:', socket.id);
    socket.disconnect(true);
    return;
  }

  // Placeholder for token verification. In a real application, you would verify the JWT token
  // using your NextAuth.js secret and logic.
  const userId = await verifyTokenAndGetUserId(token); // Assume this function exists and returns userId or null

  if (!userId) {
    console.log('Invalid authentication token. Disconnecting socket:', socket.id);
    socket.disconnect(true);
    return;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (socket as any).userId = userId;
  console.log(`User ${userId} connected with socket ${socket.id}`);

  // Join user to all their conversations
  const userConversations = await prisma.conversation.findMany({
    where: {
      OR: [
        { user1Id: userId },
        { user2Id: userId },
      ],
    },
    select: { id: true },
  });

  userConversations.forEach((conversation: { id: string | string[]; }) => {
    socket.join(conversation.id);
    console.log(`Socket ${socket.id} (User ${userId}) joined conversation room: ${conversation.id}`);
  });

  socket.on('joinConversation', async (conversationId: string) => {
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
    });

    if (conversation && (conversation.user1Id === userId || conversation.user2Id === userId)) {
      socket.join(conversationId);
      console.log(`Socket ${socket.id} (User ${userId}) explicitly joined conversation room: ${conversationId}`);
    } else {
      console.warn(`User ${userId} tried to join unauthorized conversation: ${conversationId}`);
      socket.emit('error', 'Unauthorized to join this conversation');
    }
  });

  socket.on('sendMessage', async ({ conversationId, content }: { conversationId: string; content: string }) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const senderId = (socket as any).userId;

    // Validate that the sender is a participant in the conversation
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
    });

    if (!conversation || (conversation.user1Id !== senderId && conversation.user2Id !== senderId)) {
      console.warn(`User ${senderId} tried to send message to unauthorized conversation: ${conversationId}`);
      socket.emit('error', 'Unauthorized to send message to this conversation');
      return;
    }

    // Save message to DB
    const newMessage = await prisma.message.create({
      data: {
        conversationId,
        senderId,
        content,
      },
    });

    // Broadcast message to all participants in the conversation room
    io.to(conversationId).emit('receiveMessage', newMessage);
    console.log(`Message sent to conversation ${conversationId} by user ${senderId}: ${content}`);
  });

  socket.on('disconnect', () => {
    console.log(`User ${userId} disconnected from socket ${socket.id}`);
  });
});

// Function for token verification
async function verifyTokenAndGetUserId(token: string): Promise<string | null> {
  try {
    if (!process.env.NEXTAUTH_SECRET) {
      console.error('NEXTAUTH_SECRET is not defined.');
      return null;
    }
    const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET) as { id: string };
    return decoded.id;
  } catch (error) {
    console.error('JWT verification failed:', error);
    return null;
  }
}
