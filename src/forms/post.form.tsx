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
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Заголовок поста
        </label>
        <Input
          id="title"
          name="title"
          isRequired
          defaultValue={post?.title || ""}
          placeholder="Введите заголовок..."
          classNames={{
            inputWrapper: "bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600",
            input: "text-base focus:outline-none",
          }}
        />
      </div>

      <div>
        <label htmlFor="content" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
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
            inputWrapper: "bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600",
            input: "text-base focus:outline-none",
          }}
        />
      </div>

      <div className="text-right pt-4">
        <Button color="primary" type="submit" size="lg" className="shadow-lg">
          {buttonText}
        </Button>
      </div>
    </form>
  );
}
