"use client";

import { useState } from "react";
import type { User } from "@prisma/client";
import { Button } from "@heroui/react";
import CustomModal from "@/components/common/modal";
import ProfileCard from "./profile-card"; // Наша форма профиля

type Props = {
  user: User;
  updateAction: (formData: FormData) => void;
};

export default function EditProfileModal({ user, updateAction }: Props) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleUpdate = async (formData: FormData) => {
    await updateAction(formData);
    setIsModalOpen(false); // Закрываем модальное окно после обновления
  };

  return (
    <>
      <Button
        variant="flat"
        color="primary"
        onPress={() => setIsModalOpen(true)}
        className="w-full"
      >
        Редактировать профиль
      </Button>

      <CustomModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Редактирование профиля"
        size="lg"
      >
        {/* Передаем user и наш обработчик в ProfileCard */}
        <ProfileCard user={user} updateAction={handleUpdate} />
      </CustomModal>
    </>
  );
}
