"use client";

import { Button, Input, Textarea } from "@heroui/react";
import CustomModal from "@/components/common/modal";
import { useState } from "react";
import { Category, Post } from "@/generated/prisma/client";

type Props = {
  post?: Post & { categories: Category[] }; // <-- Исправленный тип для post
  allCategories: Category[];
  buttonText: string;
  formAction: (formData: FormData) => void;
};

export default function PostForm({
  post,
  allCategories,
  buttonText,
  formAction,
}: Props) {
  const [content, setContent] = useState(post?.content || "");
  const [modalImageUrl, setModalImageUrl] = useState("");
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [cursorPosition, setCursorPosition] = useState({ start: 0, end: 0 });

  const handleInsertImage = () => {
    if (modalImageUrl) {
      const imageTag = `<img src="${modalImageUrl}" alt="Изображение" class="w-full h-auto my-4 rounded-lg" />`;

      // Вставляем тег изображения в позицию курсора
      const newContent =
        content.substring(0, cursorPosition.start) +
        imageTag +
        content.substring(cursorPosition.end, content.length);

      setContent(newContent); // Обновляем состояние контента

      setIsImageModalOpen(false);
      setModalImageUrl("");
    }
  };

  const handleSelectionChange = (
    e: React.SyntheticEvent<HTMLInputElement>
  ) => {
    const textarea = e.currentTarget as unknown as HTMLTextAreaElement;
    setCursorPosition({
      start: textarea.selectionStart,
      end: textarea.selectionEnd,
    });
  };

  return (
    <form action={formAction} className="space-y-8">
      {/* Поле для заголовка*/}
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

      {/* Поле для содержания */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label
            htmlFor="content"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Содержание
          </label>
          <Button
            size="sm"
            variant="flat"
            color="secondary"
            onPress={() => {setIsImageModalOpen(true); setModalImageUrl('')}}
          >
            Вставить изображение
          </Button>
        </div>
        <Textarea
          id="content"
          name="content"
          isRequired
          value={content}
          onValueChange={setContent}
          onSelect={handleSelectionChange}
          onChange={handleSelectionChange}
          placeholder="Напишите что-нибудь потрясающее..."
          minRows={12}
          classNames={{
            inputWrapper:
              "bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600",
            input: "text-base focus:outline-none",
          }}
        />
      </div>

      {/* Блок для выбора рубрик*/}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Рубрики
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 rounded-lg bg-gray-100 dark:bg-gray-700/50 p-4">
          {allCategories.map((category) => (
            <div key={category.id} className="flex items-center gap-2">
              <input
                id={`category-${category.id}`}
                name="categoryIds"
                value={category.id}
                type="checkbox"
                defaultChecked={
                  post?.categories?.some((pc) => pc.id === category.id) || false
                }
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600"
              />
              <label
                htmlFor={`category-${category.id}`}
                className="text-sm text-gray-800 dark:text-gray-200"
              >
                {category.name}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Блок с чекбоксом "Опубликовать"*/}
      <div className="flex items-center gap-4 rounded-lg bg-gray-100 dark:bg-gray-700/50 p-4">
        <input
          id="published"
          name="published"
          type="checkbox"
          defaultChecked={post?.published || false}
          className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-600"
        />
        <label
          htmlFor="published"
          className="text-sm font-medium text-gray-800 dark:text-gray-200"
        >
          Опубликовать пост?
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Если галочка стоит, пост будет виден всем пользователям.
          </p>
        </label>
      </div>

      {/* Кнопка отправки*/}
      <div className="text-right pt-4">
        <Button color="primary" type="submit" size="lg" className="shadow-lg">
          {buttonText}
        </Button>
      </div>

      {/*Модальное окно для вставки изображения*/}
      <CustomModal
        isOpen={isImageModalOpen}
        onClose={() => setIsImageModalOpen(false)}
        title="Вставить изображение"
        size="md"
      >
        <div className="space-y-4">
          <input
            type="text"
            placeholder="URL изображения (например, https://example.com/image.jpg)"
            value={modalImageUrl}
            onChange={(e) => setModalImageUrl(e.target.value)}
            className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 
     dark:text-gray-100"
          />
          <div className="flex justify-end gap-2">
            <Button variant="flat" onPress={() => setIsImageModalOpen(false)}>
              Отмена
            </Button>
            <Button color="primary" onPress={handleInsertImage}>
              Вставить
            </Button>
          </div>
        </div>
      </CustomModal>
    </form>
  );
}
