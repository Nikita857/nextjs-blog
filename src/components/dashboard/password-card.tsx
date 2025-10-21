"use client";

import { changePassword } from "@/actions/user.action";
import { Button, Input } from "@heroui/react";
import { useRef, useState, useTransition } from "react";

export default function PasswordCard() {
  const [message, setMessage] = useState<{
    success?: string;
    error?: string;
  } | null>(null);
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = async (formData: FormData) => {
    startTransition(async () => {
      const result = await changePassword(formData);
      setMessage(result);
      if (result.success) {
        formRef.current?.reset();
      }
    });
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 sm:p-8">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
        Смена пароля
      </h2>
      <form ref={formRef} action={handleSubmit} className="space-y-6">
        <div>
          <label
            className="block text-sm font-medium text-gray-700 
      dark:text-gray-300 mb-1"
          >
            Текущий пароль
          </label>
          <Input
            name="currentPassword"
            type="password"
            isRequired
            placeholder="••••••••"
          />
        </div>
        <div>
          <label
            className="block text-sm font-medium text-gray-700 
      dark:text-gray-300 mb-1"
          >
            Новый пароль
          </label>
          <Input
            name="newPassword"
            type="password"
            isRequired
            placeholder="••••••••"
          />
        </div>
        <div>
          <label
            className="block text-sm font-medium text-gray-700 
      dark:text-gray-300 mb-1"
          >
            Подтвердите новый пароль
          </label>
          <Input
            name="confirmPassword"
            type="password"
            isRequired
            placeholder="••••••••"
          />
        </div>

        {/* Сообщения об успехе или ошибке */}
        {message && (
          <div
            className={`p-3 rounded-md text-sm ${
              message.error
                ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                : "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
            }`}
          >
            {message.error || message.success}
          </div>
        )}

        <div className="text-right pt-2">
          <Button type="submit" color="primary" disabled={isPending}>
            {isPending ? "Сохранение..." : "Изменить пароль"}
          </Button>
        </div>
      </form>
    </div>
  );
}
