"use client";

import { Post } from "@/generated/prisma/client";
import { Button, Input, Textarea } from "@heroui/react";

type Props = {
  post?: Post;
  buttonText: string;
  formAction: (formData: FormData) => void;
};

export default function PostForm({ post, buttonText, formAction }: Props) {
  return (
    <form action={formAction} className="space-y-8">
      <div>
        <label
          htmlFor="title"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          Заголовок поста
        </label>
        <Input
          id="title"
          name="title"
          isRequired
          defaultValue={post?.title || ""}
          placeholder="Введите заголовок..."
          classNames={{
            inputWrapper:
              "bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600",
            input: "text-base focus:outline-none",
          }}
        />
      </div>

      <div>
        <label
          htmlFor="content"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          Содержание
        </label>
        <Textarea
          id="content"
          name="content"
          isRequired
          defaultValue={post?.content || ""}
          placeholder="Напишите что-нибудь потрясающее..."
          minRows={12}
          classNames={{
            inputWrapper:
              "bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600",
            input: "text-base focus:outline-none",
          }}
        />
      </div>

      <div
        className="flex items-center gap-4 rounded-lg bg-gray-100 dark:bg-gray-700/50
      p-4"
      >
        <input
          id="published"
          name="published"
          type="checkbox"
          defaultChecked={post?.published || false}
          className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-600"
        />
        <label
          htmlFor="published"
          className="text-sm font-medium text-gray-800 
      dark:text-gray-200"
        >
          Опубликовать пост?
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Если галочка стоит, пост будет виден всем пользователям.
          </p>
        </label>
      </div>

      <div className="text-right pt-4">
        <Button color="primary" type="submit" size="lg" className="shadow-lg">
          {buttonText}
        </Button>
      </div>
    </form>
  );
}
