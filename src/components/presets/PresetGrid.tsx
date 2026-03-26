"use client";

import { EasingDefinition, SamplePoint, SamplingAccuracy } from "@/types";
import { presets } from "@/lib/presets";
import {
  BOUNCE_PRESETS,
  BOUNCE_PRESET_LABELS,
  OVERSHOOT_PRESETS,
  OVERSHOOT_PRESET_LABELS,
  SPRING_PRESETS,
  SPRING_PRESET_LABELS,
  WIGGLE_PRESETS,
  WIGGLE_PRESET_LABELS,
  getGraphBounds,
  getPreviewSamples,
} from "@/lib/easing";
import { formatSvgNumber, generateSVGPath } from "@/lib/bezier";

interface PresetGridProps {
  easing: EasingDefinition;
  accuracy: SamplingAccuracy;
  onSelect: (easing: EasingDefinition) => void;
}

function curvesMatch(a: EasingDefinition, b: EasingDefinition): boolean {
  if (a.type !== "bezier" || b.type !== "bezier") {
    return false;
  }

  return (
    a.curve.x1 === b.curve.x1 &&
    a.curve.y1 === b.curve.y1 &&
    a.curve.x2 === b.curve.x2 &&
    a.curve.y2 === b.curve.y2
  );
}

function buildMiniPath(points: SamplePoint[], min: number, max: number, invert: boolean): string {
  const range = max - min || 1;
  return points
    .map((point, index) => {
      const normalized = (point.y - min) / range;
      const y = invert ? normalized : 1 - normalized;
      return `${index === 0 ? "M" : "L"} ${formatSvgNumber(point.x)},${formatSvgNumber(y)}`;
    })
    .join(" ");
}

function MiniCurve({
  easing,
  accuracy,
  active,
}: {
  easing: EasingDefinition;
  accuracy: SamplingAccuracy;
  active: boolean;
}) {
  const path =
    easing.type === "bezier"
      ? generateSVGPath(easing.curve)
      : buildMiniPath(
          getPreviewSamples(easing),
          getGraphBounds(easing, accuracy).min,
          getGraphBounds(easing, accuracy).max,
          easing.type === "bounce"
        );

  return (
    <svg viewBox="-0.08 -0.08 1.16 1.16" className="h-4 w-4 shrink-0 overflow-visible">
      <path
        d={path}
        fill="none"
        stroke={active ? "var(--color-accent)" : "var(--color-text-secondary)"}
        strokeWidth={0.085}
        strokeLinecap="round"
      />
    </svg>
  );
}

const directionPresets = presets.filter((preset) =>
  ["ease-in", "ease-out", "ease-in-out"].includes(preset.name) || preset.name === "linear"
);

const basisGroups = [
  { names: ["In Quad", "Out Quad", "In-Out Quad"], label: "Quad" },
  { names: ["In Cubic", "Out Cubic", "In-Out Cubic"], label: "Cubic" },
  { names: ["In Quart", "Out Quart", "In-Out Quart"], label: "Quart" },
  { names: ["In Quint", "Out Quint", "In-Out Quint"], label: "Quint" },
  { names: ["In Expo", "Out Expo", "In-Out Expo"], label: "Expo" },
  { names: ["In Circ", "Out Circ", "In-Out Circ"], label: "Circ" },
];

const customPresets = presets.filter((preset) => preset.category === "custom");

export default function PresetGrid({ easing, accuracy, onSelect }: PresetGridProps) {
  const renderButton = (label: string, nextEasing: EasingDefinition, active: boolean) => (
    <button
      key={label}
      onClick={() => onSelect(nextEasing)}
      className={`inline-flex h-[30.5px] items-center gap-2 rounded-[8px] border px-3 text-[11px] font-medium uppercase tracking-[0.05em] transition-colors ${
        active
          ? "border-accent bg-accent/10 text-accent"
          : "border-border-light bg-transparent text-text-secondary hover:text-text-primary hover:border-text-secondary/40"
      }`}
    >
      <MiniCurve easing={nextEasing} accuracy={accuracy} active={active} />
      {label}
    </button>
  );

  if (easing.type === "bezier") {
    return (
      <div className="flex max-w-[332px] flex-col gap-4">
        <div className="flex flex-wrap gap-[6px]">
          {directionPresets.map((preset) =>
            renderButton(
              preset.name.replace("ease-", "Ease ").replace("linear", "Linear"),
              { type: "bezier", curve: preset.curve },
              curvesMatch(easing, { type: "bezier", curve: preset.curve })
            )
          )}
        </div>

        <div className="flex flex-wrap gap-[6px]">
          {basisGroups.map((group) => {
            const preset = presets.find((item) => item.name === group.names[0]);
            if (!preset) return null;

            return renderButton(
              group.label,
              { type: "bezier", curve: preset.curve },
              curvesMatch(easing, { type: "bezier", curve: preset.curve })
            );
          })}
        </div>

        <div className="flex flex-wrap gap-[6px]">
          {customPresets.map((preset) =>
            renderButton(preset.name, { type: "bezier", curve: preset.curve }, curvesMatch(easing, { type: "bezier", curve: preset.curve }))
          )}
        </div>
      </div>
    );
  }

  if (easing.type === "spring") {
    const groups: Array<Array<keyof typeof SPRING_PRESETS>> = [
      ["heavy", "bouncy", "drop", "glide"],
      ["snap", "lazy", "elastic"],
    ];

    return (
      <div className="flex max-w-[332px] flex-col gap-4">
        {groups.map((group, index) => (
          <div key={index} className="flex flex-wrap gap-[6px]">
            {group.map((preset) =>
              renderButton(
                SPRING_PRESET_LABELS[preset],
                { type: "spring", preset, ...SPRING_PRESETS[preset] },
                easing.preset === preset
              )
            )}
          </div>
        ))}
      </div>
    );
  }

  if (easing.type === "bounce") {
    const groups: Array<Array<keyof typeof BOUNCE_PRESETS>> = [
      ["firm", "soft", "sharp"],
      ["subtle", "playful", "springy"],
    ];

    return (
      <div className="flex max-w-[332px] flex-col gap-4">
        {groups.map((group, index) => (
          <div key={index} className="flex flex-wrap gap-[6px]">
            {group.map((preset) =>
              renderButton(
                BOUNCE_PRESET_LABELS[preset],
                { type: "bounce", preset, ...BOUNCE_PRESETS[preset] },
                easing.preset === preset
              )
            )}
          </div>
        ))}
      </div>
    );
  }

  if (easing.type === "wiggle") {
    const groups: Array<Array<keyof typeof WIGGLE_PRESETS>> = [
      ["subtle", "energetic", "playful", "sharp"],
      ["smooth", "intense", "dynamic"],
    ];

    return (
      <div className="flex max-w-[332px] flex-col gap-4">
        {groups.map((group, index) => (
          <div key={index} className="flex flex-wrap gap-[6px]">
            {group.map((preset) =>
              renderButton(
                WIGGLE_PRESET_LABELS[preset],
                { type: "wiggle", preset, ...WIGGLE_PRESETS[preset] },
                easing.preset === preset
              )
            )}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex max-w-[332px] flex-col gap-4">
      <div className="flex flex-wrap gap-[6px]">
        {(Object.keys(OVERSHOOT_PRESETS[easing.direction]) as Array<keyof typeof OVERSHOOT_PRESETS.out>).map((preset) =>
          renderButton(
            OVERSHOOT_PRESET_LABELS[preset],
            { type: "overshoot", direction: easing.direction, preset, ...OVERSHOOT_PRESETS[easing.direction][preset] },
            easing.preset === preset
          )
        )}
      </div>
    </div>
  );
}
