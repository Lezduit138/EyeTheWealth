"use client";

import { signIn } from "next-auth/react";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function LoginFormInner({ hasGoogle }: { hasGoogle: boolean }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/account";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email,
        password,
        callbackUrl,
      });

      if (res?.error) {
        setError("Invalid credentials or account disabled.");
      } else if (res?.url) {
        router.push(res.url);
      }
    } catch {
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    signIn("google", { callbackUrl });
  };

  return (
    <div className="w-full max-w-md p-8 border-2 border-black bg-white">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-black mb-2">ETW LOGIN</h1>
        <p className="text-sm text-gray-500 uppercase tracking-widest">Explore. Trace. Understand.</p>
      </div>

      {error && (
        <div className="mb-6 p-3 border border-red-500 bg-red-50 text-red-700 text-sm">
          {error}
        </div>
      )}

      {hasGoogle && (
        <div className="mb-6">
          <button
            onClick={handleGoogleSignIn}
            className="w-full etw-btn etw-btn-ghost justify-center flex items-center gap-2"
          >
            <span>SIGN IN WITH GOOGLE</span>
          </button>
          <div className="flex items-center gap-4 mt-6 mb-6">
            <div className="flex-1 h-px bg-gray-300"></div>
            <span className="text-xs font-bold text-gray-500 tracking-wider">OR EMAIL</span>
            <div className="flex-1 h-px bg-gray-300"></div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <label className="etw-label block mb-2" htmlFor="login-email">Email</label>
          <input
            id="login-email"
            type="email"
            className="etw-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="mb-8">
          <label className="etw-label block mb-2" htmlFor="login-password">Password</label>
          <input
            id="login-password"
            type="password"
            className="etw-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button
          type="submit"
          className="etw-btn etw-btn-filled w-full justify-center"
          disabled={loading}
        >
          {loading ? "AUTHENTICATING..." : "SIGN IN"}
        </button>
      </form>

      <div className="mt-6 text-center text-sm">
        <span className="text-gray-500">Need an account?</span>{" "}
        <Link href={`/signup?callbackUrl=${encodeURIComponent(callbackUrl)}`} className="font-bold underline">
          Sign up
        </Link>
      </div>
    </div>
  );
}

export default function LoginForm({ hasGoogle }: { hasGoogle: boolean }) {
  return (
    <Suspense fallback={
      <div className="w-full max-w-md p-8 border-2 border-black bg-white text-center">
        <p className="etw-label">Loading...</p>
      </div>
    }>
      <LoginFormInner hasGoogle={hasGoogle} />
    </Suspense>
  );
}
