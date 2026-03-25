"use client";

import { useState } from "react";
import { BezierCurve, Platform } from "@/types";
import { codeGenerators, platformLabels } from "@/lib/code-templates";

interface CodePanelProps {
  curve: BezierCurve;
  duration: number;
}

const platforms: Platform[] = [
  "css",
  "swiftui",
  "uikit",
  "coreAnimation",
  "compose",
  "androidView",
  "raw",
];

export default function CodePanel({ curve, duration }: CodePanelProps) {
  const [platform, setPlatform] = useState<Platform>("css");
  const [copied, setCopied] = useState(false);

  const code = codeGenerators[platform](curve, duration);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* noop */
    }
  };

  return (
    <div className="flex min-w-0 flex-col gap-3">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex flex-wrap items-center gap-1">
          {platforms.map((p) => (
            <button
              key={p}
              onClick={() => setPlatform(p)}
              className={`rounded-[6px] px-[10px] py-1 text-[10px] font-semibold uppercase leading-[15px] tracking-[0.05em] transition-colors ${
                platform === p
                  ? "bg-accent text-white"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              {platformLabels[p]}
            </button>
          ))}
        </div>
        <button
          onClick={handleCopy}
          className="flex h-[29px] shrink-0 items-center gap-[6px] self-start rounded-[6px] border border-border-light px-[13px] py-[7px] text-[10px] font-semibold uppercase leading-[15px] tracking-[0.05em] text-text-secondary transition-colors hover:border-text-secondary/40 hover:text-text-primary"
        >
          <span>{copied ? "✓" : "⎘"}</span>
          {copied ? "Copied" : "Copy to Clipboard"}
        </button>
      </div>

      <div className="rounded-[12px] border border-border bg-bg px-[17px] pb-4 pt-[17px]">
        <pre className="m-0 overflow-x-auto">
          <code className="block whitespace-pre-wrap break-all font-mono text-[12px] leading-[19.5px] text-text-primary sm:whitespace-pre">
            {code}
          </code>
        </pre>
      </div>
    </div>
  );
}
