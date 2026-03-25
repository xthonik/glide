"use client";

import { Preset } from "@/types";
import { generateSVGPath } from "@/lib/bezier";

interface PresetCardProps {
  preset: Preset;
  isActive: boolean;
  onClick: () => void;
}

export default function PresetCard({ preset, isActive, onClick }: PresetCardProps) {
  const path = generateSVGPath(preset.curve);

  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-1.5 p-2 rounded-lg border transition-all cursor-pointer ${
        isActive
          ? "border-accent bg-accent-muted"
          : "border-border bg-surface hover:bg-surface-hover hover:border-text-secondary/30"
      }`}
    >
      <svg viewBox="-0.05 -0.1 1.1 1.2" className="w-full aspect-square">
        <rect x={0} y={0} width={1} height={1} fill="none" stroke="var(--color-border)" strokeWidth={0.02} rx={0.04} />
        <line x1={0} y1={1} x2={1} y2={0} stroke="var(--color-text-secondary)" strokeWidth={0.02} strokeDasharray="0.04 0.03" opacity={0.2} />
        <path
          d={path}
          fill="none"
          stroke={isActive ? "var(--color-accent)" : "var(--color-text-primary)"}
          strokeWidth={0.04}
          strokeLinecap="round"
        />
      </svg>
      <span className="text-[10px] text-text-secondary font-medium leading-tight text-center truncate w-full">
        {preset.name}
      </span>
    </button>
  );
}
