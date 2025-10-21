"use client";

import { User } from "@/generated/prisma";
import { Button, Input } from "@heroui/react";
import Image from "next/image";
import { useState, useRef } from "react";

type Props = {
  user: User;
  updateAction: (formData: FormData) => void;
};

export default function ProfileCard({ user, updateAction }: Props) {
  const formRef = useRef<HTMLFormElement>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(
    user.image || null
  );

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setImagePreview(user.image || null);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    await updateAction(formData);
  };

  return (
    <form ref={formRef} onSubmit={handleSubmit}>
      <div className="flex flex-col items-center space-y-4">
        {/* Аватар */}
        <div className="relative">
          <Image
            src={imagePreview || "/file.svg"}
            alt="User avatar"
            width={128}
            height={128}
            className="w-32 h-32 rounded-full object-cover border-4 border-white dark:border-gray-700 shadow-md"
          />
        </div>

        <div className="w-full space-y-6 pt-4">
          {/* Поле для имени */}
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Ваше имя
            </label>
            <Input
              id="name"
              name="name"
              placeholder="Введите ваше имя"
              defaultValue={user.name || ""}
            />
          </div>

          {/* Поле для загрузки файла аватара */}
          <div>
            <label
              htmlFor="imageFile"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Загрузить аватар
            </label>
            <input
              id="imageFile"
              name="imageFile"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900 dark:file:text-blue-300 dark:hover:file:bg-blue-800"
            />
            {!imagePreview && (
              <input type="hidden" name="image" value={user.image || ""} />
            )}{" "}
            {/* Скрытое поле для текущего URL, если файл не выбран */}
          </div>

          {/* Email (нередактируемый) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Email
            </label>
            <Input isReadOnly value={user.email} className="opacity-70" />
          </div>
        </div>
      </div>

      <div className="text-center pt-8">
        <Button color="primary" type="submit" size="lg" className="shadow-lg">
          Сохранить профиль
        </Button>
      </div>
    </form>
  );
}
