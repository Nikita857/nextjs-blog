import { CommentWithAuthor } from "@/actions/comment.actions";
import CommentItem from "./comment-item";


interface CommentListProps {
  comments: CommentWithAuthor[];
  isAuthor: boolean;
}

export const CommentList: React.FC<CommentListProps> = ({ comments, isAuthor }) => {
  if (comments.length === 0) {
    return (
      <div className="text-center text-gray-500 dark:text-gray-400 py-4">
        Пока нет комментариев. Будьте первым!
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {comments.map((comment) => (
        <CommentItem comment={comment} key={comment.id} isAuthor={isAuthor}/>
      ))}
    </div>
  );
};
