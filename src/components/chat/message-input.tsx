import { Button, Input } from "@heroui/react";
import React, { useState } from "react";
import EmojiPicker, { EmojiClickData } from "emoji-picker-react";

type MessageInputProps = {
  onSendMessage: (content: string) => void;
  isSending: boolean;
};

const EmojiIcon = (props: any) => (
  <svg
    aria-hidden="true"
    focusable="false"
    data-prefix="fas"
    data-icon="face-smile"
    className="w-5 h-5"
    role="img"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 512 512"
    {...props}
  >
    <path
      fill="currentColor"
      d="M464 256A208 208 0 1 0 48 256a208 208 0 1 0 416 0zM0 256a256 256 0 1 1 512 0A256 256 0 1 1 0 256zm177.6 62.1c-3.4 8.5-14.2 11.1-22.7 7.7s-11.1-14.2-7.7-22.7c28.3-70.8 98.2-120 177.1-120c78.9 0 148.8 49.2 177.1 120c3.4 8.5 1 19.3-7.7 22.7s-19.3 1-22.7-7.7C459.3 248.2 390.1 208 312 208s-147.3 40.2-174.4 90.1z"
    ></path>
  </svg>
);

export const MessageInput = ({
  onSendMessage,
  isSending,
}: MessageInputProps) => {
  const [messageInput, setMessageInput] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    setMessageInput((prev) => prev + emojiData.emoji);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim()) {
      return;
    }
    onSendMessage(messageInput);
    setMessageInput("");
    setShowEmojiPicker(false);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white dark:bg-gray-800 p-4 border-t border-gray-200 dark:border-gray-700 flex items-center gap-2 relative"
    >
      {showEmojiPicker && (
        <div className="absolute bottom-20">
          <EmojiPicker onEmojiClick={handleEmojiClick}/>
        </div>
      )}
      <Button
        isIconOnly
        variant="flat"
        onPress={() => setShowEmojiPicker(!showEmojiPicker)}
      >
        <EmojiIcon />
      </Button>
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
