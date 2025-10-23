"use client";

import { Message } from "@/generated/prisma";
import { useEffect, useRef, useState } from "react";
import ChatTools from "./chat-tools";
import { error } from "console";

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
      setContextMenu({ visible: true, x: event.clientX, y: event.clientY + 50 });
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

  useEffect(()=>{
    if(contextMenu?.visible && menuRef.current) {
      const menu = menuRef.current;
      const {innerWidth, innerHeight} = window;
      const {offsetWidth, offsetHeight} = menu;

      let newX = contextMenu.x;
      let newY = contextMenu.y;

      const margin = 10;

      if(newX + offsetWidth > innerWidth) {
        newX = innerWidth - offsetWidth - margin;
      }

      if(newY + offsetHeight > innerHeight) {
        newY = innerHeight - offsetWidth - margin;
      }

      if(newX !== contextMenu.x || newY !== contextMenu.y) {
        setContextMenu({visible: true, x: newX, y: newY});
      }
    }
  },[contextMenu]);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content).then(() => {
      console.log("Текст скопирован в буфер обмена");
      setContextMenu(null);
    }).catch(error => {
      console.error(error);
      setContextMenu(null);
    })
  }

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
          <ChatTools deleteMessage={handleDelete} onCopy={handleCopy}></ChatTools>
        </div>
      )}
    </div>
  );
};
