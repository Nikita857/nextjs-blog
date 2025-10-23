"use client";

import { Message } from "@/generated/prisma";
import { useEffect, useRef, useState } from "react";
import ChatTools from "./chat-tools";

type MessageItemProps = {
  message: Message;
  isOwnMessage: boolean;
  onDelete: (messageId: string) => void;
};

export const MessageItem = ({ message, isOwnMessage, onDelete }: MessageItemProps) => {
  const [contextMenu, setContextMenu] = useState<{
    visible: boolean;
    x: number;
    y: number;
  } | null>(null);

  const menuRef = useRef<HTMLDivElement>(null);

  const handleContextMenu = (event: React.MouseEvent) => {
    event.preventDefault();
    if (isOwnMessage) {
      setContextMenu({ visible: true, x: event.clientX, y: event.clientY });
    }
  };

  const handleDelete = () => {
    onDelete(message.id);
    setContextMenu(null);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setContextMenu(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div
      className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg shadow relative ${
          isOwnMessage
            ? "bg-blue-500 text-white"
            : "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
        } ${message.id.toString().startsWith("temp-") ? "opacity-70" : ""}`}
         onContextMenu={handleContextMenu}
      >
        <p>{message.content}</p>
        <span className="text-xs opacity-75 mt-1 block">
          {new Date(message.createdAt).toLocaleTimeString()}
          {message.id.toString().startsWith("temp-") && " (отправляется...)"}
        </span>
      </div>

      {contextMenu?.visible && (
        <div
          ref={menuRef}
          style={{ top: contextMenu.y, left: contextMenu.x }}
          className="absolute z-10 bg-white dark:bg-gray-800 border border-gray-200 
      dark:border-gray-700 rounded-md shadow-lg"
        >
          <ChatTools deleteMessage={handleDelete}></ChatTools>
        </div>
      )}
    </div>
  );
};
