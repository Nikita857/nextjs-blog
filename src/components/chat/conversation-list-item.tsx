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
const ConversationListItem: React.FC<ConversationListItemProps> = memo(
  ({ conversation, isActive, onClick, currentUserId, isOnline }) => {
    const otherUser =
      conversation.user1.id === currentUserId
        ? conversation.user2
        : conversation.user1;
    const lastMessage = conversation.messages[0];

    return (
      <div
        className={`flex items-center p-3 cursor-pointer rounded-lg transition-colors  ${
          isActive
            ? "bg-blue-200 dark:bg-blue-900"
            : "hover:bg-gray-100 dark:hover:bg-gray-700"
        }`}
        onClick={() => onClick(conversation.id)}
      >
        {/* Аватар */}
        <div className="relative flex-shrink-0 mr-3">
          <Image
            src={otherUser.image || "/file.svg"}
            alt={otherUser.name || otherUser.email}
            width={48} // Немного увеличил аватар
            height={48}
            className="rounded-full"
          />
          {isOnline && (
            <span
              className="absolute bottom-0 right-0 block h-3 w-3 rounded-full bg-green-500 
      ring-2 ring-white"
            />
          )}
        </div>

        {/* Контейнер для текста с ограничением по ширине */}
        <div className="flex-grow min-w-0">
          {" "}
          {/* min-w-0 — это ключ к правильному поведению flex */}
          <div className="flex justify-between items-center">
            <p className="font-semibold text-gray-800 dark:text-gray-100 truncate">
              {" "}
              {/* truncate       
      для имени */}
              {otherUser.name || otherUser.email}
            </p>
            {lastMessage && (
              <p className="text-xs text-gray-400 dark:text-gray-500 flex-shrink-0 ml-2">
                {new Date(lastMessage.createdAt).toLocaleTimeString("ru-RU", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            )}
          </div>
          {lastMessage && (
            <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
              {" "}
              {/* truncate для 
      сообщения */}
              {lastMessage.content}
            </p>
          )}
        </div>
      </div>
    );
  }
);
export default ConversationListItem;
