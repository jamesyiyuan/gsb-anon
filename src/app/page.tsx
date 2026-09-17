import { redirect } from "next/navigation";
import { signOut } from "@/app/actions";
import { createClient } from "@/lib/supabase/server";
import PostForm from "@/components/PostForm";
import PostCard from "@/components/PostCard";
import type { Post } from "@/lib/types";

export default async function Home() {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("pseudonym")
    .eq("id", userData.user.id)
    .single();

  const { data: posts } = await supabase
    .from("posts")
    .select(
      "id, body, created_at, author_id, profiles(pseudonym), comments(id, body, created_at, author_id, profiles(pseudonym))"
    )
    .order("created_at", { ascending: false })
    .order("created_at", { ascending: true, referencedTable: "comments" })
    .returns<Post[]>();

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 py-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold">GSB Anon</h1>
          <p className="text-xs text-zinc-500">
            Posting as <span className="font-medium">{profile?.pseudonym ?? "anon"}</span>
          </p>
        </div>
        <form action={signOut}>
          <button type="submit" className="text-sm text-zinc-500 underline">
            Sign out
          </button>
        </form>
      </header>

      <PostForm />

      <div className="flex flex-col gap-4">
        {posts && posts.length > 0 ? (
          posts.map((post) => (
            <PostCard key={post.id} post={post} currentUserId={userData.user.id} />
          ))
        ) : (
          <p className="text-center text-sm text-zinc-500">
            No posts yet. Be the first to say something.
          </p>
        )}
      </div>
    </div>
  );
}
