"use client";

import { PresetDirection } from "@/types";

type FilterValue = PresetDirection | "all";

interface PresetFilterProps {
  value: FilterValue;
  onChange: (v: FilterValue) => void;
}

const filters: { label: string; value: FilterValue }[] = [
  { label: "All", value: "all" },
  { label: "In", value: "in" },
  { label: "Out", value: "out" },
  { label: "In-Out", value: "in-out" },
];

export default function PresetFilter({ value, onChange }: PresetFilterProps) {
  return (
    <div className="flex gap-1">
      {filters.map((f) => (
        <button
          key={f.value}
          onClick={() => onChange(f.value)}
          className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
            value === f.value
              ? "bg-accent text-white"
              : "bg-surface text-text-secondary hover:text-text-primary hover:bg-surface-hover"
          }`}
        >
          {f.label}
        </button>
      ))}
    </div>
  );
}
