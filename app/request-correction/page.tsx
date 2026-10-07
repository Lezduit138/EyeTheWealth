"use client";

import { useState } from "react";
import Link from "next/link";

export default function RequestCorrectionPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/v1/corrections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to submit request.");
      } else {
        setSuccess(true);
      }
    } catch {
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="etw-page flex items-center justify-center min-h-[70vh]">
        <div className="w-full max-w-md p-8 border-2 border-black bg-white text-center">
          <h1 className="text-2xl font-black mb-4">REQUEST SUBMITTED</h1>
          <p className="text-sm text-gray-600 mb-8">
            Thank you. Your request for a correction has been submitted and will be reviewed by our team.
          </p>
          <Link href="/" className="etw-btn etw-btn-filled justify-center">
            RETURN HOME
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="etw-page flex items-center justify-center min-h-[70vh] py-12">
      <div className="w-full max-w-md p-8 border-2 border-black bg-white">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-black mb-2">REQUEST CORRECTION</h1>
          <p className="text-sm text-gray-500 uppercase tracking-widest">
            Help us maintain data integrity
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3 border border-red-500 bg-red-50 text-red-700 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="etw-label block mb-2" htmlFor="req-name">Name</label>
            <input
              id="req-name"
              type="text"
              className="etw-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="mb-6">
            <label className="etw-label block mb-2" htmlFor="req-email">Email</label>
            <input
              id="req-email"
              type="email"
              className="etw-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="mb-8">
            <label className="etw-label block mb-2" htmlFor="req-message">Details & Sources</label>
            <textarea
              id="req-message"
              className="etw-input min-h-[120px] resize-y"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Please provide specifics and links to verifiable sources..."
              required
            />
          </div>

          <button
            type="submit"
            className="etw-btn etw-btn-filled w-full justify-center"
            disabled={loading}
          >
            {loading ? "SUBMITTING..." : "SUBMIT REQUEST"}
          </button>
        </form>
      </div>
    </div>
  );
}
