"use client";

import { useState } from "react";

export function CopyBrief({ text }: { text: string }) {
  const [done, setDone] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // Fallback for non-secure contexts
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setDone(true);
    setTimeout(() => setDone(false), 2000);
  }

  const waUrl = "https://wa.me/?text=" + encodeURIComponent(text);

  return (
    <div className="row" style={{ gap: 8 }}>
      <button className="btn btn-sm" onClick={copy}>
        {done ? "Copied ✓" : "📋 Copy brief"}
      </button>
      <a className="btn btn-sm" href={waUrl} target="_blank" rel="noreferrer">
        💬 Send on WhatsApp
      </a>
    </div>
  );
}
