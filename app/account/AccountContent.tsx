/* eslint-disable */
"use client";

import { signOut } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";

export default function AccountContent({ user }: { user: any }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      return;
    }
    
    setLoading(true);
    try {
      const res = await fetch("/api/v1/auth/delete", { method: "DELETE" });
      if (res.ok) {
        signOut({ callbackUrl: "/" });
      } else {
        const data = await res.json();
        setError(data.error || "Failed to delete account");
      }
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-black mb-8 border-b-4 border-black pb-4">MY ACCOUNT</h1>
      
      {error && (
        <div className="mb-6 p-3 border border-red-500 bg-red-50 text-red-700 text-sm">
          {error}
        </div>
      )}

      <div className="etw-card mb-8">
        <div className="mb-6">
          <p className="etw-label mb-1">Name</p>
          <p className="font-medium text-lg">{user.name || "N/A"}</p>
        </div>
        
        <div className="mb-6">
          <p className="etw-label mb-1">Email</p>
          <p className="font-medium text-lg">{user.email}</p>
        </div>
        
        <div className="mb-6">
          <p className="etw-label mb-1">Role</p>
          <span className="etw-badge etw-badge-official text-sm">{user.role}</span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-12">
        {["ADMIN", "EDITOR"].includes(user.role) && (
          <Link href="/admin" className="etw-btn etw-btn-filled text-center justify-center">
            GO TO ADMIN DASHBOARD
          </Link>
        )}
        <button 
          onClick={() => signOut({ callbackUrl: "/" })}
          className="etw-btn etw-btn-ghost justify-center"
        >
          SIGN OUT
        </button>
      </div>

      <div className="border-t-2 border-dashed border-gray-300 pt-8 mt-12">
        <h2 className="text-xl font-bold mb-4 text-red-600">Danger Zone</h2>
        <p className="text-sm text-gray-600 mb-4">
          Once you delete your account, there is no going back. Please be certain.
        </p>
        <button 
          onClick={handleDelete}
          disabled={loading}
          className="border-2 border-red-600 text-red-600 px-4 py-2 text-xs font-bold tracking-wider hover:bg-red-600 hover:text-white transition-colors"
        >
          {loading ? "DELETING..." : "DELETE MY ACCOUNT"}
        </button>
      </div>
    </div>
  );
}

