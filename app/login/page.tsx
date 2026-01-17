"use client";

import { FormEvent, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/admin";

  const [email, setEmail] = useState("admin@example.com");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
        callbackUrl
      });

      if (result?.error) {
        setError("Invalid email or password");
      } else if (result?.ok) {
        router.push(callbackUrl);
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "100px auto", padding: "20px" }}>
      <h1>Admin Login</h1>
      <p style={{ color: "#666", marginBottom: "30px" }}>
        Sign in to manage your support portal
      </p>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "15px" }}>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
            placeholder="admin@example.com"
          />
        </div>

        <div style={{ marginBottom: "20px" }}>
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
            placeholder="Enter password"
          />
        </div>

        {error && (
          <div
            style={{
              color: "#d32f2f",
              marginBottom: "15px",
              padding: "10px",
              backgroundColor: "#ffebee",
              borderRadius: "4px"
            }}
          >
            {error}
          </div>
        )}

        <button type="submit" disabled={isLoading} style={{ width: "100%" }}>
          {isLoading ? "Signing in..." : "Sign In"}
        </button>
      </form>

      <hr style={{ margin: "30px 0" }} />

      <div style={{ fontSize: "14px", color: "#666" }}>
        <p>
          <strong>Demo credentials:</strong>
          <br />
          Email: admin@example.com
          <br />
          Password: (set via ADMIN_PASSWORD_HASH env var)
        </p>
      </div>

      <div style={{ marginTop: "20px", textAlign: "center" }}>
        <Link href="/widget" style={{ color: "#667eea", textDecoration: "none" }}>
          Back to widget
        </Link>
      </div>
    </div>
  );
}
