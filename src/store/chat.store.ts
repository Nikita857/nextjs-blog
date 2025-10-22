// src/store/chat.store.ts
import { create } from 'zustand';

interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  createdAt: Date;
}

interface Conversation {
  id: string;
  user1Id: string;
  user1: { id: string; name: string | null; email: string; image: string | null };
  user2Id: string;
  user2: { id: string; name: string | null; email: string; image: string | null };
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

interface ChatState {
  conversations: (Conversation & {
    user1: { id: string; name: string | null; email: string; image: string | null };
    user2: { id: string; name: string | null; email: string; image: string | null };
    messages: Message[];
  })[];
  activeConversationId: string | null;
  messages: Message[];
  setConversations: (conversations: (Conversation & {
    user1: { id: string; name: string | null; email: string; image: string | null };
    user2: { id: string; name: string | null; email: string; image: string | null };
    messages: Message[];
  })[]) => void;
  // ДОБАВИТЬ функциональное обновление
  updateConversations: (updater: (prev: Conversation[]) => Conversation[]) => void;
  setActiveConversationId: (id: string | null) => void;
  setMessages: (messages: Message[]) => void;
  addMessage: (message: Message) => void;
}

// В store обновите setMessages:
export const useChatStore = create<ChatState>((set) => ({
  conversations: [],
  activeConversationId: null,
  messages: [],
  setConversations: (conversations) => set({ conversations }),
  updateConversations: (updater) => 
    set((state) => ({ conversations: updater(state.conversations) })),
  setActiveConversationId: (id) => set({ activeConversationId: id }),
  // ОБНОВЛЕННЫЙ setMessages для поддержки функционального обновления
  setMessages: (messages) => set((state) => ({
    messages: typeof messages === 'function' ? messages(state.messages) : messages
  })),
  addMessage: (message) =>
    set((state) => ({
      messages: [...state.messages, message],
    })),
}));