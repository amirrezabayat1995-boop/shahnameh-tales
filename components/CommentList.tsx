"use client";

import { useState } from "react";
import CommentForm from "@/components/CommentForm";
import DeleteCommentButton from "@/components/DeleteCommentButton";

interface CommentUser {
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
}

interface CommentItem {
  id: string;
  content: string;
  createdAt: Date;
  user: CommentUser;
  userId: string;
  replies: (Omit<CommentItem, "replies">)[];
}

interface CommentListProps {
  comments: CommentItem[];
  episodeId: string;
  episodeSlug: string;
  currentUserId?: string;
  isAdmin: boolean;
  isLoggedIn: boolean;
}

function formatDate(date: Date) {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function Avatar({ user }: { user: CommentUser }) {
  const initial = (user.displayName || user.username)[0]?.toUpperCase();
  if (user.avatarUrl) {
    // eslint-disable-next-line @next/next/no-img-element
    return (
      <img
        src={user.avatarUrl}
        alt=""
        className="h-9 w-9 shrink-0 rounded-full object-cover"
      />
    );
  }
  return (
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--color-gold)]/20 font-[family-name:var(--font-display)] text-sm text-[var(--color-gold-bright)]">
      {initial}
    </div>
  );
}

function SingleComment({
  comment,
  episodeId,
  episodeSlug,
  currentUserId,
  isAdmin,
  isLoggedIn,
  isReply = false,
}: {
  comment: CommentItem | Omit<CommentItem, "replies">;
  episodeId: string;
  episodeSlug: string;
  currentUserId?: string;
  isAdmin: boolean;
  isLoggedIn: boolean;
  isReply?: boolean;
}) {
  const [replying, setReplying] = useState(false);
  const canDelete = isAdmin || comment.userId === currentUserId;

  return (
    <div className="flex gap-3">
      <Avatar user={comment.user} />
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="font-[family-name:var(--font-ui)] text-sm font-medium text-[var(--color-ivory)]">
            {comment.user.displayName || comment.user.username}
          </span>
          <span className="font-[family-name:var(--font-ui)] text-xs text-[var(--color-ivory)]/40">
            {formatDate(comment.createdAt)}
          </span>
        </div>
        <p className="mt-1 font-[family-name:var(--font-body)] text-sm leading-relaxed text-[var(--color-ivory)]/85">
          {comment.content}
        </p>
        <div className="mt-2 flex gap-4 font-[family-name:var(--font-ui)] text-xs">
          {!isReply && isLoggedIn && (
            <button
              onClick={() => setReplying((r) => !r)}
              className="text-[var(--color-gold)] hover:text-[var(--color-gold-bright)]"
            >
              {replying ? "Cancel" : "Reply"}
            </button>
          )}
          {canDelete && (
            <DeleteCommentButton commentId={comment.id} episodeSlug={episodeSlug} />
          )}
        </div>
        {replying && (
          <div className="mt-3">
            <CommentForm
              episodeId={episodeId}
              parentId={comment.id}
              placeholder={`Reply to ${comment.user.displayName || comment.user.username}...`}
              onDone={() => setReplying(false)}
            />
          </div>
        )}

        {"replies" in comment && comment.replies.length > 0 && (
          <div className="mt-4 flex flex-col gap-4 border-l border-[var(--color-line)] pl-4">
            {comment.replies.map((reply) => (
              <SingleComment
                key={reply.id}
                comment={reply}
                episodeId={episodeId}
                episodeSlug={episodeSlug}
                currentUserId={currentUserId}
                isAdmin={isAdmin}
                isLoggedIn={isLoggedIn}
                isReply
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function CommentList({
  comments,
  episodeId,
  episodeSlug,
  currentUserId,
  isAdmin,
  isLoggedIn,
}: CommentListProps) {
  if (comments.length === 0) {
    return (
      <p className="font-[family-name:var(--font-body)] text-sm text-[var(--color-ivory)]/50">
        No comments yet. Be the first to share your thoughts.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {comments.map((comment) => (
        <SingleComment
          key={comment.id}
          comment={comment}
          episodeId={episodeId}
          episodeSlug={episodeSlug}
          currentUserId={currentUserId}
          isAdmin={isAdmin}
          isLoggedIn={isLoggedIn}
        />
      ))}
    </div>
  );
}
