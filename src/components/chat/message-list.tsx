import { Message } from "@/generated/prisma";

type MessageListProps = {
  messages: Message[];
  currentUserId: string;
};
export const MessageList = ({ messages, currentUserId }: MessageListProps) => {
  return (
    <div className="flex-grow p-4 overflow-y-auto space-y-4">
      {Array.isArray(messages) && messages.length > 0 ? (
        messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${
              msg.senderId === currentUserId ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg shadow ${
                msg.senderId === currentUserId
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              } ${msg.id.toString().startsWith("temp-") ? "opacity-70" : ""}`}
            >
              <p>{msg.content}</p>
              <span className="text-xs opacity-75 mt-1 block">
                {new Date(msg.createdAt).toLocaleTimeString()}
                {msg.id.toString().startsWith("temp-") && " (отправляется...)"}
              </span>
            </div>
          </div>
        ))
      ) : (
        <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
          Нет сообщений. Начните общение!
        </div>
      )}
    </div>
  );
};
