"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";

export function AuthNav() {
  const { data: session } = useSession();

  if (!session) {
    return (
      <Link href="/login" style={{ marginLeft: "auto" }}>
        Sign In
      </Link>
    );
  }

  return (
    <div style={{ marginLeft: "auto", display: "flex", gap: "15px", alignItems: "center" }}>
      <span style={{ fontSize: "14px", color: "#666" }}>{session.user?.email}</span>
      <button
        onClick={() => signOut()}
        style={{
          background: "none",
          border: "none",
          color: "#667eea",
          cursor: "pointer",
          textDecoration: "underline",
          padding: 0
        }}
      >
        Sign Out
      </button>
    </div>
  );
}
