"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ALLOWED_EMAIL_DOMAIN, isAllowedEmail } from "@/lib/allowed-domain";

type Step = "email" | "code";

export default function LoginForm() {
  const router = useRouter();
  const supabase = createClient();

  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSendCode(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!isAllowedEmail(email)) {
      setError(`You need a @${ALLOWED_EMAIL_DOMAIN} email address to sign up.`);
      return;
    }

    setLoading(true);
    const { error: otpError } = await supabase.auth.signInWithOtp({
      email: email.trim().toLowerCase(),
      options: { shouldCreateUser: true },
    });
    setLoading(false);

    if (otpError) {
      setError(otpError.message);
      return;
    }
    setStep("code");
  }

  async function handleVerifyCode(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error: verifyError } = await supabase.auth.verifyOtp({
      email: email.trim().toLowerCase(),
      token: code.trim(),
      type: "email",
    });

    setLoading(false);

    if (verifyError) {
      setError(verifyError.message);
      return;
    }

    router.push("/");
    router.refresh();
  }

  if (step === "code") {
    return (
      <form onSubmit={handleVerifyCode} className="flex w-full flex-col gap-4">
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          We sent a 6-digit code to <span className="font-medium">{email}</span>.
        </p>
        <input
          autoFocus
          inputMode="numeric"
          placeholder="123456"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="rounded-lg border border-zinc-300 px-4 py-2 text-lg tracking-widest outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900"
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={loading || code.length < 6}
          className="rounded-full bg-black px-5 py-2.5 font-medium text-white disabled:opacity-40 dark:bg-white dark:text-black"
        >
          {loading ? "Verifying…" : "Verify & continue"}
        </button>
        <button
          type="button"
          onClick={() => setStep("email")}
          className="text-sm text-zinc-500 underline"
        >
          Use a different email
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={handleSendCode} className="flex w-full flex-col gap-4">
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
        {loading ? "Sending…" : "Send code"}
      </button>
    </form>
  );
}
