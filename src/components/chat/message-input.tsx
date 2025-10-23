import { Button, Input } from "@heroui/react";
import React, { useState } from "react";

type MessageInputProps = {
  onSendMessage: (content: string) => void;
  isSending: boolean;
};

export const MessageInput = ({
  onSendMessage,
  isSending,
}: MessageInputProps) => {
  const [messageInput, setMessageInput] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim()) {
      return;
    }
    onSendMessage(messageInput);
    setMessageInput("");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white dark:bg-gray-800 p-4 border-t border-gray-200 dark:border-gray-700 flex items-center gap-2"
    >
      <Input
        value={messageInput}
        onChange={(e) => setMessageInput(e.target.value)}
        placeholder="Напишите сообщение..."
        className="flex-grow"
        disabled={isSending}
      />
      <Button
        type="submit"
        color="primary"
        disabled={isSending || !messageInput.trim()}
      >
        {isSending ? "Отправка..." : "Отправить"}
      </Button>
    </form>
  );
};
