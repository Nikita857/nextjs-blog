import Image from "next/image";
import { FullConversation } from "@/store/chat.store";
import { memo } from "react";

interface ConversationListItemProps {
  conversation: FullConversation;
  isActive: boolean;
  onClick: (conversationId: string) => void;
  currentUserId: string;
  isOnline: boolean;
}

// eslint-disable-next-line react/display-name
const ConversationListItem: React.FC<ConversationListItemProps> = memo(({
  conversation,
  isActive,
  onClick,
  currentUserId,
  isOnline,
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
      <div className="relative">
        <Image
          src={otherUser.image || "/file.svg"}
          alt={otherUser.name || otherUser.email}
          width={40}
          height={40}
          className="rounded-full mr-3"
        />
        {isOnline && (
          <span className="absolute bottom-0 right-3 block h-2.5 w-2.5 rounded-full bg-green-500 ring-2 ring-white" />
        )}
      </div>
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
});
export default ConversationListItem;