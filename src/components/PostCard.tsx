import { deleteComment, deletePost, reportContent } from "@/app/actions";
import CommentForm from "@/components/CommentForm";
import type { Post } from "@/lib/types";

function timeAgo(iso: string) {
  const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default function PostCard({ post, currentUserId }: { post: Post; currentUserId: string }) {
  const pseudonym = post.profiles?.pseudonym ?? "anon";

  return (
    <article className="flex flex-col gap-3 rounded-2xl border border-zinc-200 p-4 dark:border-zinc-800">
      <div className="flex items-center justify-between text-xs text-zinc-500">
        <span className="font-medium text-zinc-700 dark:text-zinc-300">{pseudonym}</span>
        <span>{timeAgo(post.created_at)}</span>
      </div>

      <p className="whitespace-pre-wrap text-sm">{post.body}</p>

      <div className="flex gap-4 text-xs text-zinc-500">
        {post.author_id === currentUserId ? (
          <form action={deletePost.bind(null, post.id)}>
            <button type="submit" className="underline">
              Delete
            </button>
          </form>
        ) : (
          <form action={reportContent}>
            <input type="hidden" name="postId" value={post.id} />
            <button type="submit" className="underline">
              Report
            </button>
          </form>
        )}
      </div>

      <div className="flex flex-col gap-2 border-t border-zinc-100 pt-3 dark:border-zinc-900">
        {post.comments.map((comment) => (
          <div key={comment.id} className="flex flex-col gap-1 text-sm">
            <div className="flex items-center justify-between text-xs text-zinc-500">
              <span className="font-medium text-zinc-700 dark:text-zinc-300">
                {comment.profiles?.pseudonym ?? "anon"}
              </span>
              <span className="flex items-center gap-3">
                {timeAgo(comment.created_at)}
                {comment.author_id === currentUserId ? (
                  <form action={deleteComment.bind(null, comment.id)}>
                    <button type="submit" className="underline">
                      Delete
                    </button>
                  </form>
                ) : (
                  <form action={reportContent}>
                    <input type="hidden" name="commentId" value={comment.id} />
                    <button type="submit" className="underline">
                      Report
                    </button>
                  </form>
                )}
              </span>
            </div>
            <p className="whitespace-pre-wrap">{comment.body}</p>
          </div>
        ))}

        <CommentForm postId={post.id} />
      </div>
    </article>
  );
}
