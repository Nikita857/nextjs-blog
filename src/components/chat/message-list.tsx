import { Message } from "@/generated/prisma";
import { MessageItem } from "./message-Item";

type MessageListProps = {
  messages: Message[];
  currentUserId: string;
  onDeleteMessage: (messageId: string) => void;
};
export const MessageList = ({
  messages,
  currentUserId,
  onDeleteMessage,
}: MessageListProps) => {
  return (
    <div className="flex-grow p-4 overflow-y-auto space-y-4">
      {Array.isArray(messages) && messages.length > 0 ? (
        messages.map((msg) => (
          <MessageItem
            key={msg.id}
            message={msg}
            isOwnMessage={msg.senderId === currentUserId}
            onDelete={onDeleteMessage}
          />
        ))
      ) : (
        <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
          Нет сообщений. Начните общение!
        </div>
      )}
    </div>
  );
};
