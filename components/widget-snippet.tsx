"use client";

import { useEffect, useMemo, useState } from "react";

const DEFAULT_ORIGIN = "https://YOUR_DOMAIN";

export default function WidgetSnippet() {
  const [origin, setOrigin] = useState(DEFAULT_ORIGIN);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setOrigin(window.location.origin);
    }
  }, []);

  useEffect(() => {
    if (!copied) {
      return;
    }

    const timeout = window.setTimeout(() => setCopied(false), 2000);
    return () => window.clearTimeout(timeout);
  }, [copied]);

  const snippet = useMemo(
    () =>
      `<script src="${origin}/widget.js" data-business="YOUR_BUSINESS_ID"></script>`,
    [origin]
  );

  const handleCopy = async () => {
    await navigator.clipboard.writeText(snippet);
    setCopied(true);
  };

  return (
    <div className="code-snippet">
      <div className="code-snippet-header">
        <p>Install snippet</p>
        <button type="button" onClick={handleCopy} className="copy-button">
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="code-block">
        <code>{snippet}</code>
      </pre>
      <p className="sr-only" aria-live="polite">
        {copied ? "Snippet copied to clipboard" : ""}
      </p>
    </div>
  );
}
