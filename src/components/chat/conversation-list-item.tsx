import Image from "next/image";
import { Conversation, Message } from "@/generated/prisma";

interface ConversationListItemProps {
  conversation: Conversation & {
    user1: {
      id: string;
      name: string | null;
      email: string;
      image: string | null;
    };
    user2: {
      id: string;
      name: string | null;
      email: string;
      image: string | null;
    };
    messages: Message[];
  };
  isActive: boolean;
  onClick: (conversationId: string) => void;
  currentUserId: string;
}

const ConversationListItem: React.FC<ConversationListItemProps> = ({
  conversation,
  isActive,
  onClick,
  currentUserId,
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
      <Image
        src={otherUser.image || "/file.svg"}
        alt={otherUser.name || otherUser.email}
        width={40}
        height={40}
        className="rounded-full mr-3"
      />
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
};
export default ConversationListItem;