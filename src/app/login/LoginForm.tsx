"use client";

import { useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";
import { ALLOWED_EMAIL_DOMAIN, isAllowedEmail } from "@/lib/allowed-domain";

export default function LoginForm() {
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSendLink(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!isAllowedEmail(email)) {
      setError(`You need a @${ALLOWED_EMAIL_DOMAIN} email address to sign up.`);
      return;
    }

    setLoading(true);
    const { error: otpError } = await supabase.auth.signInWithOtp({
      email: email.trim().toLowerCase(),
      options: {
        shouldCreateUser: true,
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    setLoading(false);

    if (otpError) {
      setError(otpError.message);
      return;
    }
    setSent(true);
  }

  if (sent) {
    return (
      <div className="flex w-full flex-col gap-4">
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          We sent a sign-in link to <span className="font-medium">{email}</span>.
          Open it on this device to continue.
        </p>
        <button
          type="button"
          onClick={() => setSent(false)}
          className="text-sm text-zinc-500 underline"
        >
          Use a different email
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSendLink} className="flex w-full flex-col gap-4">
      <input
        autoFocus
        type="email"
        placeholder={`you@${ALLOWED_EMAIL_DOMAIN}`}
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="rounded-lg border border-zinc-300 px-4 py-2 outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900"
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={loading || !email}
        className="rounded-full bg-black px-5 py-2.5 font-medium text-white disabled:opacity-40 dark:bg-white dark:text-black"
      >
        {loading ? "Sending…" : "Send sign-in link"}
      </button>
    </form>
  );
}
