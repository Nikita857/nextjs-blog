"use client";

import { FullMessage } from "@/store/chat.store";
import { Button, Input } from "@heroui/react";
import { memo, useEffect, useRef, useState } from "react";
import { SharedPostCard } from "./shared-post-card";
import ChatTools from "./chat-tools";

type MessageItemProps = {
  message: FullMessage;
  isOwnMessage: boolean;
  onDelete: (messageId: string) => void;
  onEdit: (messageId: string, newContent: string) => void;
};

// eslint-disable-next-line react/display-name
export const MessageItem = memo(({
  message,
  isOwnMessage,
  onDelete,
  onEdit,
}: MessageItemProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(message.content);

  const [contextMenu, setContextMenu] = useState<{
    visible: boolean;
    x: number;
    y: number;
  } | null>(null);

  const menuRef = useRef<HTMLDivElement>(null);

  const handleContextMenu = (event: React.MouseEvent) => {
    event.preventDefault();
    if (!isEditing) {
      setContextMenu({ visible: true, x: event.clientX, y: event.clientY + 50 });
    }
  };

  const handleDelete = () => {
    if(isOwnMessage) {
      onDelete(message.id);
      setContextMenu(null);
    }else{
      setContextMenu(null);
    }
  };

  const handleStartEdit = () => {
    if(isOwnMessage) {
      setIsEditing(true);
      setEditText(message.content);
      setContextMenu(null);
    }else{
      setContextMenu(null);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  const handleSaveEdit = () => {
    if (editText.trim() && editText.trim() !== message.content) {
      onEdit(message.id, editText);
    }
    setIsEditing(false);
  };

  const handleCopy = () => {
    navigator.clipboard
      .writeText(message.content)
      .then(() => {
        console.log("Текст скопирован в буфер обмена");
        setContextMenu(null);
      })
      .catch((error) => {
        console.error("Не удалось скопировать текст: ", error);
        setContextMenu(null);
      });
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

  useEffect(() => {
    if (contextMenu?.visible && menuRef.current) {
      const menu = menuRef.current;
      const { innerWidth, innerHeight } = window;
      const { offsetWidth, offsetHeight } = menu;

      let newX = contextMenu.x;
      let newY = contextMenu.y;

      const margin = 10;

      if (newX + offsetWidth > innerWidth) {
        newX = innerWidth - offsetWidth - margin;
      }

      if (newY + offsetHeight > innerHeight) {
        // Исправлена опечатка offsetWidth -> offsetHeight
        newY = innerHeight - offsetHeight - margin;
      }

      if (newX !== contextMenu.x || newY !== contextMenu.y) {
        setContextMenu({ ...contextMenu, x: newX, y: newY });
      }
    }
  }, [contextMenu]);

  return (
    // Это главный контейнер, он должен быть один
    <div className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}>
      <div
        onContextMenu={handleContextMenu}
        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg shadow relative cursor-pointer ${
          isOwnMessage
            ? "bg-blue-500 text-white"
            : "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
        } ${message.id.toString().startsWith("temp-") ? "opacity-70" : ""}`}
      >
        {isEditing && isOwnMessage ? (
          // РЕЖИМ РЕДАКТИРОВАНИЯ
          <div className="w-full space-y-2">
            <Input
              autoFocus
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSaveEdit();
                if (e.key === "Escape") handleCancelEdit();
              }}
            />
            <div className="flex justify-end gap-2">
              <Button size="sm" variant="light" onPress={handleCancelEdit}>
                Отмена
              </Button>
              <Button size="sm" color="primary" onPress={handleSaveEdit}>
                Сохранить
              </Button>
            </div>
          </div>
        ) : (
          // РЕЖИМ ОТОБРАЖЕНИЯ
          <>
            <p>{message.content}</p>
            {message.type === 'shared_post' && message.sharedPost && (
              <SharedPostCard post={message.sharedPost} />
            )}
            <span className="text-xs opacity-75 mt-1 block">
              {message.isEdited && <span className="italic mr-1">(изм.)</span>}
              {new Date(message.createdAt).toLocaleTimeString()}
              {message.id.toString().startsWith("temp-") &&
                " (отправляется...)"}
            </span>
          </>
        )}
      </div>

      {/* Контекстное меню */}
      {contextMenu?.visible && (
        <div
          ref={menuRef}
          style={{ top: contextMenu.y, left: contextMenu.x }}
          className="absolute z-10"
        >
          <ChatTools
            deleteMessage={handleDelete}
            onCopy={handleCopy}
            onEdit={handleStartEdit}
            isOwnMessage={isOwnMessage}
          />
        </div>
      )}
    </div>
  );
});
