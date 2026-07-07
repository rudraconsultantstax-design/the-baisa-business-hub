"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("founder@baisajaipur.in");
  const [password, setPassword] = useState("baisa123");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });
    if (res.ok) {
      router.push("/dashboard");
      router.refresh();
    } else {
      const j = await res.json().catch(() => ({}));
      setError(j.error || "Login failed");
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div className="card" style={{ width: "100%", maxWidth: 400 }}>
        <div style={{ textAlign: "center", marginBottom: 18 }}>
          <div style={{ fontFamily: "Playfair Display, serif", fontSize: "1.5rem", color: "var(--accent)", fontWeight: 800 }}>
            Baisa OS
          </div>
          <p className="muted" style={{ marginTop: 4 }}>
            Business Operating System
          </p>
        </div>
        <form onSubmit={submit}>
          <label className="field">Email</label>
          <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" autoComplete="username" style={{ marginBottom: 12 }} />
          <label className="field">Password</label>
          <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" autoComplete="current-password" style={{ marginBottom: 16 }} />
          {error && (
            <div className="badge b-red" style={{ marginBottom: 12, display: "block", padding: "8px 12px" }}>
              {error}
            </div>
          )}
          <button className="btn btn-accent" style={{ width: "100%" }} disabled={loading}>
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>
        <p className="muted" style={{ marginTop: 14, fontSize: "0.74rem", textAlign: "center" }}>
          Demo: founder@baisajaipur.in / baisa123
        </p>
        <p className="muted" style={{ marginTop: 6, fontSize: "0.78rem", textAlign: "center" }}>
          New here? <Link href="/signup" style={{ color: "var(--accent)" }}>Create a free workspace</Link>
        </p>
        <p style={{ marginTop: 10, textAlign: "center" }}>
          <Link href="/" className="muted" style={{ fontSize: "0.78rem" }}>
            ← Back home
          </Link>
        </p>
      </div>
    </div>
  );
}
