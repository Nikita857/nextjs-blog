"use client";

import { useState } from "react";

import { Button } from "@heroui/react";
import CustomModal from "../common/modal";
import PostForm from "@/forms/post.form"; // 1. Меняем импорт на универсальную форму
import { Post } from "@/generated/prisma/client";

type Props = {
  post: Post;
  updatePostAction: (formData: FormData) => void;
  deletePostAction: () => void;
};

export default function PostActions({
  post,
  updatePostAction,
  deletePostAction,
}: Props) {
  const [isModalOpen, setModalOpen] = useState(false);

  const handleUpdate = async (formData: FormData) => {
    await updatePostAction(formData);
    setModalOpen(false);
  };

  return (
    <footer
      className="mt-10 pt-6 border-t border-gray-200 dark:border-gray-700 flex items-center justify-end 
      gap-4"
    >
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
          buttonText="Сохранить изменения"
        />
      </CustomModal>
    </footer>
  );
}
