"use client";

import { BezierCurve } from "@/types";
import { presets } from "@/lib/presets";
import { generateSVGPath } from "@/lib/bezier";

interface PresetGridProps {
  currentCurve: BezierCurve;
  onSelect: (curve: BezierCurve) => void;
}

function curvesMatch(a: BezierCurve, b: BezierCurve): boolean {
  return a.x1 === b.x1 && a.y1 === b.y1 && a.x2 === b.x2 && a.y2 === b.y2;
}

function MiniCurve({ curve, active }: { curve: BezierCurve; active: boolean }) {
  return (
    <svg viewBox="-0.08 -0.08 1.16 1.16" className="h-4 w-4 shrink-0 overflow-visible">
      <path
        d={generateSVGPath(curve)}
        fill="none"
        stroke={active ? "var(--color-accent)" : "var(--color-text-secondary)"}
        strokeWidth={0.085}
        strokeLinecap="round"
      />
    </svg>
  );
}

// Direction presets
const directionPresets = presets.filter((p) =>
  ["ease-in", "ease-out", "ease-in-out"].includes(p.name) ||
  p.name === "linear"
);

// Basis presets grouped
const basisGroups = [
  { names: ["In Quad", "Out Quad", "In-Out Quad"], label: "Quad" },
  { names: ["In Cubic", "Out Cubic", "In-Out Cubic"], label: "Cubic" },
  { names: ["In Quart", "Out Quart", "In-Out Quart"], label: "Quart" },
  { names: ["In Quint", "Out Quint", "In-Out Quint"], label: "Quint" },
  { names: ["In Expo", "Out Expo", "In-Out Expo"], label: "Expo" },
  { names: ["In Circ", "Out Circ", "In-Out Circ"], label: "Circ" },
];

const customPresets = presets.filter((p) => p.category === "custom");

export default function PresetGrid({ currentCurve, onSelect }: PresetGridProps) {
  const renderButton = (name: string, curve: BezierCurve) => {
    const active = curvesMatch(currentCurve, curve);

    return (
      <button
        key={name}
        onClick={() => onSelect(curve)}
        className={`inline-flex h-[30.5px] items-center gap-2 rounded-full border px-3 text-[11px] font-medium uppercase tracking-[0.05em] transition-colors ${
          active
            ? "border-accent bg-accent/10 text-accent"
            : "border-border-light bg-transparent text-text-secondary hover:text-text-primary hover:border-text-secondary/40"
        }`}
      >
        <MiniCurve curve={curve} active={active} />
        {name.replace("In-Out ", "").replace("In ", "").replace("Out ", "")}
      </button>
    );
  };

  return (
    <div className="flex max-w-[332px] flex-col gap-4">
      <div className="flex flex-wrap gap-[6px]">
        {directionPresets.map((p) => renderButton(p.name, p.curve))}
      </div>

      <div className="flex flex-wrap gap-[6px]">
        {basisGroups.map((group) => {
          const preset = presets.find((p) => p.name === group.names[0])!;
          return renderButton(group.label, preset.curve);
        })}
      </div>

      <div className="flex flex-wrap gap-[6px]">
        {customPresets.map((p) => renderButton(p.name, p.curve))}
      </div>
    </div>
  );
}
