"use client";

import { useEffect, useState } from "react";

interface DurationSliderProps {
  label?: string;
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onChange: (value: number) => void;
}

export default function DurationSlider({
  label = "Duration",
  value,
  min = 100,
  max = 3000,
  step = 50,
  onChange,
}: DurationSliderProps) {
  const [draftValue, setDraftValue] = useState(value.toString());
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (!isEditing) {
      setDraftValue(value.toString());
    }
  }, [isEditing, value]);

  const commitValue = () => {
    setIsEditing(false);

    const nextValue = parseInt(draftValue, 10);
    if (isNaN(nextValue)) {
      setDraftValue(value.toString());
      return;
    }

    const clampedValue = Math.max(min, Math.min(max, nextValue));
    onChange(clampedValue);
    setDraftValue(clampedValue.toString());
  };

  return (
    <div className="flex w-full items-center gap-3">
      <span className="w-[52px] shrink-0 text-[11px] font-medium uppercase tracking-[0.05em] text-text-secondary">
        {label}
      </span>
      <div className="flex-1">
        <div className="mx-auto" style={{ width: "calc(100% - 20px)" }}>
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={(e) => onChange(parseInt(e.target.value, 10))}
            className="block h-5 w-full"
          />
        </div>
      </div>
      <input
        type="number"
        min={min}
        max={max}
        step={step}
        value={draftValue}
        onFocus={() => setIsEditing(true)}
        onBlur={commitValue}
        onChange={(e) => setDraftValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.currentTarget.blur();
          }
        }}
        className="h-[26px] w-14 rounded-[6px] border border-text-secondary bg-transparent px-2 text-right font-mono text-[12px] leading-4 text-text-primary outline-none transition-colors focus:border-accent"
      />
    </div>
  );
}
