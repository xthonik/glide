"use client";

import { useState } from "react";
import { BezierCurve } from "@/types";
import { roundTo, clampX } from "@/lib/bezier";

interface NumericInputsProps {
  curve: BezierCurve;
  onChange: (curve: BezierCurve) => void;
}

function InputRow({
  label,
  value,
  onChange,
  min,
  max,
  clamp,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  clamp?: boolean;
}) {
  const [draftValue, setDraftValue] = useState(roundTo(value).toString());
  const [isEditing, setIsEditing] = useState(false);
  const formattedValue = roundTo(value).toString();
  const displayValue = isEditing ? draftValue : formattedValue;

  const commitValue = () => {
    setIsEditing(false);

    let nextValue = parseFloat(draftValue);
    if (isNaN(nextValue)) {
      setDraftValue(formattedValue);
      return;
    }

    if (clamp) nextValue = clampX(nextValue);
    onChange(nextValue);
    setDraftValue(roundTo(nextValue).toString());
  };

  return (
    <div className="flex items-center gap-3">
      <span className="w-6 text-[11px] font-semibold uppercase tracking-[0.05em] text-text-secondary">
        {label}
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={0.01}
        value={value}
        onChange={(e) => {
          let v = parseFloat(e.target.value);
          if (clamp) v = clampX(v);
          onChange(v);
        }}
        className="h-5 flex-1"
      />
      <input
        type="number"
        step={0.01}
        min={min}
        max={max}
        value={displayValue}
        onFocus={() => {
          setDraftValue(formattedValue);
          setIsEditing(true);
        }}
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

export default function NumericInputs({ curve, onChange }: NumericInputsProps) {
  return (
    <div className="flex flex-col gap-2">
      <InputRow
        label="X1"
        value={curve.x1}
        min={0}
        max={1}
        clamp
        onChange={(v) => onChange({ ...curve, x1: v })}
      />
      <InputRow
        label="Y1"
        value={curve.y1}
        min={-1}
        max={2}
        onChange={(v) => onChange({ ...curve, y1: v })}
      />
      <InputRow
        label="X2"
        value={curve.x2}
        min={0}
        max={1}
        clamp
        onChange={(v) => onChange({ ...curve, x2: v })}
      />
      <InputRow
        label="Y2"
        value={curve.y2}
        min={-1}
        max={2}
        onChange={(v) => onChange({ ...curve, y2: v })}
      />
    </div>
  );
}
