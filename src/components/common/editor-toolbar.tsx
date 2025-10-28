// components/common/editor-toolbar.tsx
"use client";

import { Editor } from "@tiptap/react";

type EditorToolbarProps = {
  editor: Editor | null;
};

export default function EditorToolbar({ editor }: EditorToolbarProps) {
  if (!editor) return null;

  const buttonClass = (isActive: boolean) => 
    `p-2 rounded border transition-colors ${
      isActive 
        ? "bg-blue-500 text-white border-blue-600" 
        : "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600"
    }`;

  return (
    <div className="flex flex-wrap gap-1 p-3 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
      {/* Заголовки */}
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={buttonClass(editor.isActive('heading', { level: 1 }))}
        title="Заголовок 1"
      >
        H1
      </button>
      
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={buttonClass(editor.isActive('heading', { level: 2 }))}
        title="Заголовок 2"
      >
        H2
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        className={buttonClass(editor.isActive('heading', { level: 3 }))}
        title="Заголовок 3"
      >
        H3
      </button>

      {/* Текст */}
      <button
        type="button"
        onClick={() => editor.chain().focus().setParagraph().run()}
        className={buttonClass(editor.isActive('paragraph'))}
        title="Параграф"
      >
        ¶
      </button>

      <div className="w-px bg-gray-300 dark:bg-gray-600 mx-1"></div>

      {/* Жирный и курсив */}
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={buttonClass(editor.isActive('bold'))}
        title="Жирный"
      >
        <strong>B</strong>
      </button>
      
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={buttonClass(editor.isActive('italic'))}
        title="Курсив"
      >
        <em>I</em>
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleStrike().run()}
        className={buttonClass(editor.isActive('strike'))}
        title="Зачеркнутый"
      >
        <s>S</s>
      </button>

      <div className="w-px bg-gray-300 dark:bg-gray-600 mx-1"></div>

      {/* Списки */}
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={buttonClass(editor.isActive('bulletList'))}
        title="Маркированный список"
      >
        • List
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={buttonClass(editor.isActive('orderedList'))}
        title="Нумерованный список"
      >
        1. List
      </button>

      <div className="w-px bg-gray-300 dark:bg-gray-600 mx-1"></div>

      {/* Блоки */}
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={buttonClass(editor.isActive('blockquote'))}
        title="Цитата"
      >
        "
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        className={buttonClass(editor.isActive('codeBlock'))}
        title="Блок кода"
      >
        {`</>`}
      </button>

      <div className="w-px bg-gray-300 dark:bg-gray-600 mx-1"></div>

      {/* Действия */}
      <button
        type="button"
        onClick={() => editor.chain().focus().undo().run()}
        className={buttonClass(false)}
        title="Отменить"
      >
        ↶
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().redo().run()}
        className={buttonClass(false)}
        title="Повторить"
      >
        ↷
      </button>
    </div>
  );
}