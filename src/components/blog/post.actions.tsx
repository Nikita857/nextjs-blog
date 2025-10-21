"use client";

import { useState } from "react";

import { Button } from "@heroui/react";
import CustomModal from "../common/modal";
import PostForm from "@/forms/post.form";
import { Category, Post, ReactionType } from "@/generated/prisma/client";
import ReactionButtons from "./reaction-buttons";

type Props = {
  post: Post & { categories: Category[] };
  allCategories: Category[];
  updatePostAction: (formData: FormData) => void;
  deletePostAction: () => void;
  initialLikes: number;
  initialDislikes: number;
  currentUserReaction: ReactionType | null;
};

export default function PostActions({
  post,
  allCategories,
  updatePostAction,
  deletePostAction,
  initialLikes,
  initialDislikes,
  currentUserReaction,
}: Props) {
  const [isModalOpen, setModalOpen] = useState(false);

  const handleUpdate = async (formData: FormData) => {
    await updatePostAction(formData);
    setModalOpen(false);
  };

  return (
    <footer
      className="mt-8 pt-6
        dark:border-gray-700
         flex items-center
         justify-between
         gap-5"
    >
      <div>
        <ReactionButtons
          postId={post.id}
          initialLikes={initialLikes}
          initialDislikes={initialDislikes}
          initialUserReaction={currentUserReaction}
        />
      </div>

      <div className="flex items-center gap-4">
        <Button
          variant="flat"
          color="secondary"
          onPress={() => setModalOpen(true)}
        >
          Редактировать
        </Button>
        <form action={deletePostAction}>
          <Button type="submit" variant="flat" color="danger">
            Удалить
          </Button>
        </form>
      </div>
      <CustomModal
          isOpen={isModalOpen}
          onClose={() => setModalOpen(false)}
          title="Редактирование поста"
          size="xl"
        >
          {/* 2. Вызываем PostForm и передаем ей нужные пропсы */}
          <PostForm
            post={post}
            formAction={handleUpdate}
            allCategories={allCategories} // <-- Передаем дальше
            buttonText="Сохранить изменения"
          />{" "}
        </CustomModal>
    </footer>
  );
}
