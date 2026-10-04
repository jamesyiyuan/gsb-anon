"use client";

import { useRef, useState, type FormEvent } from "react";
import { createComment } from "@/app/actions";

export default function CommentForm({ postId }: { postId: string }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!formRef.current) return;
    setPending(true);
    await createComment(postId, new FormData(formRef.current));
    formRef.current.reset();
    setPending(false);
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="flex gap-2">
      <input
        name="body"
        required
        maxLength={1000}
        placeholder="Reply anonymously…"
        className="flex-1 rounded-full border border-zinc-300 px-3 py-1.5 text-sm outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900"
      />
      <button
        type="submit"
        disabled={pending}
        className="rounded-full border border-zinc-300 px-3 py-1.5 text-sm font-medium disabled:opacity-40 dark:border-zinc-700"
      >
        Reply
      </button>
    </form>
  );
}
