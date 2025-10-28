"use client";

import Image from "next/image";
import { CommentWithAuthor, deleteComment } from "@/actions/comment.actions";
import { useTransition } from "react";
import { Button } from "@heroui/react";
import { useRouter } from "next/navigation";

interface CommentListProps {
  comment: CommentWithAuthor;
  isAuthor: boolean;
}

const CommentItem = ({ comment, isAuthor }: CommentListProps) => {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleDeleteComment = async (id: string) => {
    if (id != null) {
      startTransition(async () => {
        await deleteComment(id);
        router.refresh();
      });
    }
  };
  return (
    <div
      key={comment.id}
      className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg shadow-sm relative"
    >
      {/* Кнопка удаления  */}
      {isAuthor ? (
        <Button
          className="absolute top-4 right-4 text-gray-400 bg-transparent hover:text-red-500 transition-colors"
          disabled={isPending}
          onPress={() => handleDeleteComment(comment.id)}
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </Button>
      ) : null}

      <div className="flex items-center mb-2">
        <Image
          src={comment.author.image || "/file.svg"}
          alt={comment.author.name || comment.author.email || "Author avatar"}
          width={32}
          height={32}
          className="rounded-full object-cover mr-3"
        />
        <div>
          <p className="font-semibold text-gray-900 dark:text-gray-100">
            {comment.author.name || comment.author.email}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {new Date(comment.createdAt).toLocaleDateString("ru-RU", {
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>
      </div>
      <p className="text-gray-700 dark:text-gray-200">{comment.content}</p>
    </div>
  );
};

export default CommentItem;
