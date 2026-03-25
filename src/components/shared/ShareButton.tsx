"use client";

import { useState } from "react";
import { EasingDefinition, SamplingAccuracy } from "@/types";
import { encodeEasingToURL } from "@/lib/url";

interface ShareButtonProps {
  easing: EasingDefinition;
  duration: number;
  delay: number;
  accuracy: SamplingAccuracy;
}

export default function ShareButton({ easing, duration, delay, accuracy }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    try {
      const url = encodeEasingToURL(easing, duration, delay, accuracy);
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* noop */
    }
  };

  return (
    <button
      onClick={handleShare}
      className={`flex w-full items-center justify-center gap-2 rounded-[8px] border px-6 py-[11px] text-[12px] font-semibold uppercase leading-4 tracking-[0.05em] transition-colors ${
        copied
          ? "border-accent/40 bg-accent/10 text-accent"
          : "border-border-light text-text-secondary hover:border-text-secondary/40 hover:text-text-primary"
      }`}
    >
      <span>⎘</span>
      {copied ? "Link Copied!" : "Copy Share Link"}
    </button>
  );
}
