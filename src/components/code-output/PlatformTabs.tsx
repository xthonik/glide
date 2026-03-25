"use client";

import { Platform } from "@/types";
import { platformLabels } from "@/lib/code-templates";

interface PlatformTabsProps {
  selected: Platform;
  onChange: (p: Platform) => void;
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

export default function PlatformTabs({ selected, onChange }: PlatformTabsProps) {
  return (
    <div className="flex flex-wrap gap-1">
      {platforms.map((p) => (
        <button
          key={p}
          onClick={() => onChange(p)}
          className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition-colors ${
            selected === p
              ? "bg-accent text-white"
              : "bg-surface text-text-secondary hover:text-text-primary hover:bg-surface-hover"
          }`}
        >
          {platformLabels[p]}
        </button>
      ))}
    </div>
  );
}
