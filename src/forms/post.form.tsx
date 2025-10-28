"use client";

import { Button, Input  } from "@heroui/react";
import { useState, useEffect } from "react";
import { Category, Post } from "@/generated/prisma/client";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline"; 
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import EditorToolbar from "@/components/common/editor-toolbar";

import '@/app/tiptap.css';

type Props = {
  post?: Post & { categories: Category[] };
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

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-blue-500 underline",
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: "rounded-lg max-w-full",
        },
      }),
    ],
    content: content,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      setContent(html);
    },
    editorProps: {
      attributes: {
        class: "prose prose-sm sm:prose-base lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[300px] p-4 bg-white dark:bg-gray-800",
        "data-testid": "tiptap-editor",
      },
    },
    immediatelyRender: false,
  });

  // Синхронизация контента при загрузке поста
  useEffect(() => {
    if (editor && post?.content) {
      editor.commands.setContent(post.content);
    }
  }, [editor, post?.content]);

  // Очистка редактора при размонтировании
  useEffect(() => {
    return () => {
      if (editor) {
        editor.destroy();
      }
    };
  }, [editor]);

  // Обработчик отправки формы
  const handleSubmit = (e: React.FormEvent) => {
    if (!editor) return;
    
    // Обновляем контент перед отправкой
    const finalContent = editor.getHTML();
    setContent(finalContent);
  };

  return (
    <form action={formAction} onSubmit={handleSubmit} className="space-y-8">
      {/* Поле для заголовка */}
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
              "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600",
            input: "text-base focus:outline-none",
          }}
        />
      </div>

      {/* Rich Text Editor */}
      <div>
        <label
          htmlFor="content"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          Содержание
        </label>
        
        {/* Сообщение если редактор не загрузился */}
        {!editor && (
          <div className="text-yellow-600 bg-yellow-50 p-4 rounded-lg">
            Редактор загружается...
          </div>
        )}
        
        <div className="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden bg-white dark:bg-gray-800">
          {/* Панель инструментов */}
          {editor && <EditorToolbar editor={editor} />}
          
          {/* Контент редактора */}
          <EditorContent 
            editor={editor} 
            className="min-h-[300px]"
          />
        </div>
        
        {/* Скрытое поле для формы */}
        <input 
          type="hidden" 
          name="content" 
          value={content} 
        />
        
        {/* Отладочная информация (можно удалить в продакшене) */}
        <div className="mt-2 text-xs text-gray-500">
          Длина контента: {content.length} символов
        </div>
      </div>

      {/* Блок для выбора рубрик */}
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

      {/* Блок с чекбоксом "Опубликовать" */}
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

      {/* Кнопка отправки */}
      <div className="text-right pt-4">
        <Button 
          color="primary" 
          type="submit" 
          size="lg" 
          className="shadow-lg"
          isDisabled={!editor} // Блокируем пока редактор не готов
        >
          {buttonText}
        </Button>
      </div>
    </form>
  );
}