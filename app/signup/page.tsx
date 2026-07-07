"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({ orgName: "", name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function set(k: string, v: string) {
    setForm({ ...form, [k]: v });
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });
    if (res.ok) {
      router.push("/dashboard");
      router.refresh();
    } else {
      const j = await res.json().catch(() => ({}));
      setError(j.error || "Signup failed");
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div className="card" style={{ width: "100%", maxWidth: 420 }}>
        <div style={{ textAlign: "center", marginBottom: 18 }}>
          <div style={{ fontFamily: "Playfair Display, serif", fontSize: "1.5rem", color: "var(--accent)", fontWeight: 800 }}>Baisa OS</div>
          <p className="muted" style={{ marginTop: 4 }}>Create your workspace — free</p>
        </div>
        <form onSubmit={submit}>
          <label className="field">Business name</label>
          <input value={form.orgName} onChange={(e) => set("orgName", e.target.value)} placeholder="e.g. Meera Handlooms" style={{ marginBottom: 12 }} required />
          <label className="field">Your name</label>
          <input value={form.name} onChange={(e) => set("name", e.target.value)} style={{ marginBottom: 12 }} required />
          <label className="field">Email</label>
          <input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} autoComplete="username" style={{ marginBottom: 12 }} required />
          <label className="field">Password</label>
          <input type="password" value={form.password} onChange={(e) => set("password", e.target.value)} autoComplete="new-password" placeholder="min 6 characters" style={{ marginBottom: 16 }} required />
          {error && <div className="badge b-red" style={{ marginBottom: 12, display: "block", padding: "8px 12px" }}>{error}</div>}
          <button className="btn btn-accent" style={{ width: "100%" }} disabled={loading}>
            {loading ? "Creating…" : "Create workspace"}
          </button>
        </form>
        <p className="muted" style={{ marginTop: 14, fontSize: "0.78rem", textAlign: "center" }}>
          Already have an account? <Link href="/login" style={{ color: "var(--accent)" }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}
