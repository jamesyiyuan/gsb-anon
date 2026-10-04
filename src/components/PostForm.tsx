"use client";

import { useRef, useState, type FormEvent } from "react";
import { createPost } from "@/app/actions";

export default function PostForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!formRef.current) return;
    setPending(true);
    await createPost(new FormData(formRef.current));
    formRef.current.reset();
    setPending(false);
  }

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className="flex flex-col gap-3 rounded-2xl border border-zinc-200 p-4 dark:border-zinc-800"
    >
      <textarea
        name="body"
        required
        maxLength={2000}
        rows={3}
        placeholder="Post anonymously to your class…"
        className="resize-none rounded-lg border border-zinc-300 p-3 text-sm outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900"
      />
      <button
        type="submit"
        disabled={pending}
        className="self-end rounded-full bg-black px-5 py-2 text-sm font-medium text-white disabled:opacity-40 dark:bg-white dark:text-black"
      >
        {pending ? "Posting…" : "Post"}
      </button>
    </form>
  );
}
