import { Category, Post, User } from "@/generated/prisma";
import { PostCard } from "./post-card";

type PostWithDetails = Post & {
  author: User;
  categories: Category[];
};

interface PostListProps {
  posts: PostWithDetails[];
}

export const PostList = ({ posts }: PostListProps) => {
  return (
    <>
      {posts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300">
            Постов пока нет
          </h2>
          <p className="mt-2 text-gray-500">
            Возвращайтесь позже или создайте первую запись!
          </p>
        </div>
      )}
    </>
  );
};
