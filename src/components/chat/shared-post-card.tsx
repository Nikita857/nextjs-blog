import Link from 'next/link';
import Image from 'next/image';
import { Post, User, Category, Reaction } from '@/generated/prisma';

// Определяем тип для поста со всеми связями, которые мы запрашиваем
type PostWithRelations = Post & {
  author: User;
  categories: Category[];
  reactions: Reaction[];
};

interface SharedPostCardProps {
  post: PostWithRelations;
}

export const SharedPostCard = ({ post }: SharedPostCardProps) => {
  const likes = post.reactions.filter(r => r.type === 'LIKE').length;

  return (
    <div className="mt-2 border dark:border-gray-600 rounded-lg overflow-hidden bg-white dark:bg-gray-800 max-w-md">
      <div className="p-4">
        {/* Автор и дата */}
        <div className="flex items-center mb-3">
          <Image
            src={post.author.image || '/file.svg'}
            alt={post.author.name || 'Author avatar'}
            width={32}
            height={32}
            className="rounded-full mr-3"
          />
          <div>
            <p className="font-semibold text-sm text-gray-800 dark:text-gray-200">{post.author.name || post.author.email}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {new Date(post.createdAt).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })}
            </p>
          </div>
        </div>

        {/* Заголовок поста */}
        <h3 className="font-bold text-lg mb-2 text-gray-900 dark:text-gray-100">{post.title}</h3>

        {/* Контент (обрезанный) */}
        <div
          className="prose prose-sm dark:prose-invert max-h-24 overflow-hidden text-ellipsis"
          dangerouslySetInnerHTML={{ __html: post.content || '' }}
        />

        {/* Лайки и кнопка "Читать" */}
        <div className="flex justify-between items-center mt-4 pt-3 border-t dark:border-gray-700">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            ❤️ {likes}
          </div>
          <Link
            href={`/blog/${post.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
          >
            Читать далее →
          </Link>
        </div>
      </div>
    </div>
  );
};