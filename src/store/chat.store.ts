import { create } from 'zustand';
import { Conversation, Message, Post, User, Category, Reaction } from '@/generated/prisma';

export type FullMessage = Message & {
  sender: User;
  sharedPost: (Post & {
    author: User;
    categories: Category[];
    reactions: Reaction[];
  }) | null;
};

export type FullConversation = Conversation & {
  user1: User;
  user2: User;
  messages: FullMessage[];
};

interface ChatState {
  conversations: FullConversation[];
  activeConversationId: string | null;
  messages: FullMessage[];
  typingUsers: string[];
  onlineUsers: string[]; 
  setConversations: (conversations: FullConversation[]) => void;
  updateConversations: (updater: (prev: FullConversation[]) => FullConversation[]) => void;
  setActiveConversationId: (id: string | null) => void;
  setMessages: (messages: FullMessage[] | ((prev: FullMessage[]) => FullMessage[])) => void;
  addMessage: (message: FullMessage) => void;
  addTypingUser: (userId: string) => void;
  removeTypingUser: (userId: string) => void;
  setOnlineUsers: (userIds: string[]) => void;   
  addOnlineUser: (userId: string) => void;     
  removeOnlineUser: (userId: string) => void; 
}

export const useChatStore = create<ChatState>((set) => ({
  conversations: [],
  activeConversationId: null,
  messages: [],
  typingUsers: [],
  onlineUsers: [], // <-- НОВОЕ
  setConversations: (conversations) => set({ conversations }),
  updateConversations: (updater) =>
    set((state) => ({ conversations: updater(state.conversations) })),
  setActiveConversationId: (id) => set({ activeConversationId: id }),
  setMessages: (messages) =>
    set((state) => ({
      messages: typeof messages === 'function' ? messages(state.messages) : messages,
    })),
  addMessage: (message) =>
    set((state) => ({
      messages: [...state.messages, message],
    })),
  addTypingUser: (userId) => set((state) => ({ typingUsers: [...state.typingUsers, userId] })),
  removeTypingUser: (userId) =>
    set((state) => ({ typingUsers: state.typingUsers.filter((id) => id !== userId) })),
  
  setOnlineUsers: (userIds) => set({ onlineUsers: userIds }),
  addOnlineUser: (userId) => set((state) => ({ onlineUsers: [...new Set([...state.onlineUsers, userId])] })), // Используем Set для уникальности
  removeOnlineUser: (userId) => set((state) => ({ onlineUsers: state.onlineUsers.filter(id => id !== userId) })), 
}));