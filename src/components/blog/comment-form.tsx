"use client";

import { Button, Textarea } from "@heroui/react";
import { useState, useTransition } from "react";

export interface CommentFormProps {
  postId: string;
  addCommentAction: (postId: string, content: string) => Promise<{ success: boolean; error?: string } | undefined>;
}

export const CommentForm: React.FC<CommentFormProps> = ({
  postId,
  addCommentAction,
}) => {
  const [commentContent, setCommentContent] = useState("");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!commentContent.trim()) {
      setError("Комментарий не может быть пустым.");
      return;
    }

    startTransition(async () => {
      const result = await addCommentAction(postId, commentContent);
      if (result?.success) {
        setCommentContent(""); // Очищаем поле после успешной отправки
      } else if (result?.error) {
        setError(result.error);
      } else {
        setError("Неизвестная ошибка при добавлении комментария.");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
      <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">Оставить комментарий</h3>
      <Textarea
        placeholder="Напишите ваш комментарий..."
        value={commentContent}
        onChange={(e) => setCommentContent(e.target.value)}
        minRows={3}
        maxRows={6}
        disabled={isPending}
        classNames={{
          inputWrapper: "bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600",
          input: "text-base focus:outline-none",
        }}
      />
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <div className="text-right">
        <Button type="submit" color="primary" disabled={isPending}>
          {isPending ? "Отправка..." : "Отправить комментарий"}
        </Button>
      </div>
    </form>
  );
};
