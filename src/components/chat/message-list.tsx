import { Message } from "@/generated/prisma";
import { MessageItem } from "./message-Item";
import { useTheme } from "next-themes";

type MessageListProps = {
  messages: Message[];
  currentUserId: string;
  onDeleteMessage: (messageId: string) => void;
  onEditMessage: (messageId: string, newContent: string) => void;
};
export const MessageList = ({
  messages,
  currentUserId,
  onDeleteMessage,
  onEditMessage
}: MessageListProps) => {
  const {theme, systemTheme, setTheme} = useTheme();
  const currentTheme = theme === 'system' ? systemTheme : theme;
  return (
    <div className={`flex-grow p-4 overflow-y-auto space-y-4 items-center 
    justify-center ${currentTheme === 'light' ? 'bg-gradient-to-r from-indigo-200 to-amber-200' : 'bg-gray-900'}`}>
      {Array.isArray(messages) && messages.length > 0 ? (
        messages.map((msg) => (
          <MessageItem
            key={msg.id}
            message={msg}
            isOwnMessage={msg.senderId === currentUserId}
            onDelete={onDeleteMessage}
            onEdit={onEditMessage}
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
