import LoginForm from "./LoginForm";
import { ALLOWED_EMAIL_DOMAIN } from "@/lib/allowed-domain";

export default function LoginPage() {
  return (
    <div className="flex flex-1 items-center justify-center bg-zinc-50 px-6 dark:bg-black">
      <div className="w-full max-w-sm rounded-2xl border border-zinc-200 p-8 dark:border-zinc-800">
        <h1 className="mb-1 text-xl font-semibold">GSB Anon</h1>
        <p className="mb-6 text-sm text-zinc-600 dark:text-zinc-400">
          Sign in with your @{ALLOWED_EMAIL_DOMAIN} email. Your posts are shown
          under a random pseudonym — never your name or email.
        </p>
        <LoginForm />
      </div>
    </div>
  );
}
