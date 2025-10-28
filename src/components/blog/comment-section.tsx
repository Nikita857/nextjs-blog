import { CommentWithAuthor } from "@/actions/comment.actions";
import { CommentForm, CommentFormProps } from "./comment-form";
import { CommentList } from "./comment-list";

type CommentSectionProps = CommentFormProps & {
  isAuthor: boolean;
  comments: CommentWithAuthor[];
};

const CommentSection = ({
 isAuthor,
  comments,
  postId,
  addCommentAction,
}: CommentSectionProps) => {
  return (
    <section className="mt-12 pt-6 border-t border-gray-200 dark:border-gray-700">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
        Комментарии
      </h2>
      {isAuthor ? (
        <CommentForm postId={postId} addCommentAction={addCommentAction} />
      ) : (
        <p className="text-gray-500 dark:text-gray-400 text-center py-4">
          Войдите, чтобы оставить комментарий.
        </p>
      )}
      <div className="mt-8">
        <CommentList comments={comments} isAuthor={isAuthor}/>
      </div>
    </section>
  );
};

export default CommentSection;
