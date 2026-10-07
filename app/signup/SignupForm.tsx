"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";

function SignupFormInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/account";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }
    
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/v1/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "An error occurred during signup.");
        setLoading(false);
        return;
      }

      // Auto-login after successful signup
      const loginRes = await signIn("credentials", {
        redirect: false,
        email,
        password,
        callbackUrl,
      });

      if (loginRes?.error) {
         router.push("/login?callbackUrl=" + encodeURIComponent(callbackUrl));
      } else if (loginRes?.url) {
         router.push(loginRes.url);
      }
    } catch {
      setError("An unexpected error occurred.");
    } finally {
      if (!error) setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md p-8 border-2 border-black bg-white">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-black mb-2">ETW SIGNUP</h1>
        <p className="text-sm text-gray-500 uppercase tracking-widest">Create an Account</p>
      </div>

      {error && (
        <div className="mb-6 p-3 border border-red-500 bg-red-50 text-red-700 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <label className="etw-label block mb-2" htmlFor="signup-name">Full Name</label>
          <input
            id="signup-name"
            type="text"
            className="etw-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        
        <div className="mb-6">
          <label className="etw-label block mb-2" htmlFor="signup-email">Email</label>
          <input
            id="signup-email"
            type="email"
            className="etw-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="mb-6">
          <label className="etw-label block mb-2" htmlFor="signup-password">Password</label>
          <input
            id="signup-password"
            type="password"
            className="etw-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
          />
        </div>
        
        <div className="mb-8">
          <label className="etw-label block mb-2" htmlFor="signup-confirm">Confirm Password</label>
          <input
            id="signup-confirm"
            type="password"
            className="etw-input"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            minLength={8}
          />
        </div>

        <button
          type="submit"
          className="etw-btn etw-btn-filled w-full justify-center"
          disabled={loading}
        >
          {loading ? "CREATING ACCOUNT..." : "SIGN UP"}
        </button>
      </form>

      <div className="mt-6 text-center text-sm">
        <span className="text-gray-500">Already have an account?</span>{" "}
        <Link href={`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`} className="font-bold underline">
          Log in
        </Link>
      </div>
    </div>
  );
}

export default function SignupForm() {
  return (
    <Suspense fallback={
      <div className="w-full max-w-md p-8 border-2 border-black bg-white text-center">
        <p className="etw-label">Loading...</p>
      </div>
    }>
      <SignupFormInner />
    </Suspense>
  );
}
