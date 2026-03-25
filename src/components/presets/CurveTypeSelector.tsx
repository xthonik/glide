"use client";

import { EasingType } from "@/types";

const types: Array<{ label: string; value: EasingType }> = [
  { label: "Bezier", value: "bezier" },
  { label: "Spring", value: "spring" },
  { label: "Bounce", value: "bounce" },
  { label: "Wiggle", value: "wiggle" },
  { label: "Overshoot", value: "overshoot" },
];

interface CurveTypeSelectorProps {
  value: EasingType;
  onChange: (type: EasingType) => void;
}

export default function CurveTypeSelector({ value, onChange }: CurveTypeSelectorProps) {
  return (
    <div className="flex w-full justify-center overflow-x-auto">
      <div className="mx-auto flex h-full min-w-max gap-1 rounded-[12px] border border-border bg-bg p-[5px]">
        {types.map((type) => (
          <button
            key={type.value}
            onClick={() => onChange(type.value)}
            className={`flex h-full shrink-0 items-center justify-center rounded-[8px] px-5 text-[12px] font-semibold uppercase tracking-[0.05em] transition-colors ${
              value === type.value
                ? "bg-accent text-white shadow-[0_0_12px_rgba(26,123,235,0.3)]"
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            {type.label}
          </button>
        ))}
      </div>
    </div>
  );
}
