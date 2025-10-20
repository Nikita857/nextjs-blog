"use client";

import { User } from "@/generated/prisma";
import { Button, Input } from "@heroui/react";
import Image from "next/image";

type Props = {
  user: User;
  updateAction: (formData: FormData) => void;
};

export default function ProfileCard({ user, updateAction }: Props) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 sm:p-8">
      <form action={updateAction}>
        <div className="flex flex-col items-center space-y-4">
          {/* Аватар */}
          <div className="relative">
            <Image
              src={user.image || '/file.svg'} // Отображаем аватар или заглушку
              alt="User avatar"
              width={128}
              height={128}
              className="w-32 h-32 rounded-full object-cover border-4 border-white dark:border-gray-700 shadow-md"
            />
          </div>
          
          <div className="w-full space-y-6 pt-4">
            {/* Поле для имени */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Ваше имя
              </label>
              <Input
                id="name"
                name="name"
                placeholder="Введите ваше имя"
                defaultValue={user.name || ""}
              />
            </div>

            {/* Поле для URL аватара */}
            <div>
              <label htmlFor="image" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                URL аватара
              </label>
              <Input
                id="image"
                name="image"
                placeholder="https://example.com/avatar.png"
                defaultValue={user.image || ""}
              />
            </div>

            {/* Email (нередактируемый) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email
              </label>
              <Input
                isReadOnly
                value={user.email}
                className="opacity-70"
              />
            </div>
          </div>
        </div>
        
        <div className="text-center pt-8">
          <Button color="primary" type="submit" size="lg" className="shadow-lg">
            Сохранить профиль
          </Button>
        </div>
      </form>
    </div>
  );
}
