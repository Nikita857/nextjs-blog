import { create } from 'zustand';
import { Conversation, Message, Post, User, Category, Reaction } from '@/generated/prisma';

// Создаем более полные типы, которые отражают наши запросы в БД
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
  typingUsers: string[]; // Add this
  setConversations: (conversations: FullConversation[]) => void;
  updateConversations: (updater: (prev: FullConversation[]) => FullConversation[]) => void;
  setActiveConversationId: (id: string | null) => void;
  setMessages: (messages: FullMessage[] | ((prev: FullMessage[]) => FullMessage[])) => void;
  addMessage: (message: FullMessage) => void;
  addTypingUser: (userId: string) => void; // Add this
  removeTypingUser: (userId: string) => void; // Add this
}

export const useChatStore = create<ChatState>((set) => ({
  conversations: [],
  activeConversationId: null,
  messages: [],
  typingUsers: [], // Add this
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
  addTypingUser: (userId) => set((state) => ({ typingUsers: [...state.typingUsers, userId] })), // Add this
  removeTypingUser: (userId) =>
    set((state) => ({ typingUsers: state.typingUsers.filter((id) => id !== userId) })), // Add this
}));
