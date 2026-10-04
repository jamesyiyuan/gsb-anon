"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function createPost(formData: FormData) {
  const body = String(formData.get("body") ?? "").trim();
  if (!body) return;

  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) redirect("/login");

  await supabase.from("posts").insert({
    author_id: userData.user.id,
    body,
  });

  revalidatePath("/");
}

export async function createComment(postId: string, formData: FormData) {
  const body = String(formData.get("body") ?? "").trim();
  if (!body) return;

  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) redirect("/login");

  await supabase.from("comments").insert({
    post_id: postId,
    author_id: userData.user.id,
    body,
  });

  revalidatePath("/");
}

export async function deletePost(postId: string) {
  const supabase = await createClient();
  await supabase.from("posts").delete().eq("id", postId);
  revalidatePath("/");
}

export async function deleteComment(commentId: string) {
  const supabase = await createClient();
  await supabase.from("comments").delete().eq("id", commentId);
  revalidatePath("/");
}

export async function reportContent(formData: FormData) {
  const postId = formData.get("postId");
  const commentId = formData.get("commentId");

  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) redirect("/login");

  await supabase.from("reports").insert({
    reporter_id: userData.user.id,
    post_id: postId ? String(postId) : null,
    comment_id: commentId ? String(commentId) : null,
    reason: "flagged by user",
  });

  revalidatePath("/");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
