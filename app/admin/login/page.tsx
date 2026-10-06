"use client";

// ETW — Admin Login Page

import { signIn } from "next-auth/react";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/admin";

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
        setError("Invalid credentials. Seed data: admin@etw.local / etw-admin-2026");
      } else if (res?.url) {
        router.push(res.url);
      }
    } catch {
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md p-8 border-2 border-black bg-white">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-black mb-2">ETW ADMIN</h1>
        <p className="text-sm text-gray-500 uppercase tracking-widest">Authorised Personnel Only</p>
      </div>

      {error && (
        <div className="mb-6 p-3 border border-red-500 bg-red-50 text-red-700 text-sm">
          {error}
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
          {loading ? "AUTHENTICATING..." : "LOGIN"}
        </button>
      </form>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="etw-page flex items-center justify-center min-h-[70vh]">
      <Suspense fallback={
        <div className="w-full max-w-md p-8 border-2 border-black bg-white text-center">
          <p className="etw-label">Loading...</p>
        </div>
      }>
        <LoginForm />
      </Suspense>
    </div>
  );
}
