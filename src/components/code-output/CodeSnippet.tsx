"use client";

import { useState } from "react";

interface CodeSnippetProps {
  code: string;
}

export default function CodeSnippet({ code }: CodeSnippetProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  return (
    <div className="relative">
      <pre className="bg-surface border border-border rounded-lg p-3 overflow-x-auto">
        <code className="text-xs font-mono text-text-primary leading-relaxed whitespace-pre">
          {code}
        </code>
      </pre>
      <button
        onClick={handleCopy}
        className="absolute top-2 right-2 px-2.5 py-1 text-[10px] font-medium rounded-md bg-surface-hover border border-border text-text-secondary hover:text-text-primary transition-colors"
      >
        {copied ? "Copied!" : "Copy"}
      </button>
    </div>
  );
}
