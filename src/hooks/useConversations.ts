import { FullConversation, useChatStore } from "@/store/chat.store";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";

export const useConversations = (initialConversations: FullConversation[]) => {
  const {
    conversations,
    activeConversationId,
    setConversations,
    setActiveConversationId,
  } = useChatStore();

  const searchParams = useSearchParams();
  const urlConversationId = searchParams.get("conversationId");

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

  return {
    conversations:
      conversations.length > 0 ? conversations : initialConversations,
    activeConversationId,
    setActiveConversationId,
  };
};
