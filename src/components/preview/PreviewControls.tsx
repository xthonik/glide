"use client";

import { AnimationProperty } from "@/types";

interface PreviewControlsProps {
  isPlaying: boolean;
  onPlay: () => void;
  onReplay: () => void;
  showLinear: boolean;
  onToggleLinear: () => void;
  activeProperties: AnimationProperty[];
  onToggleProperty: (p: AnimationProperty) => void;
}

const allProperties: { key: AnimationProperty; label: string }[] = [
  { key: "moveX", label: "Move X" },
  { key: "moveY", label: "Move Y" },
  { key: "scale", label: "Scale" },
  { key: "rotate", label: "Rotate" },
  { key: "opacity", label: "Opacity" },
  { key: "width", label: "Width" },
  { key: "height", label: "Height" },
];

export default function PreviewControls({
  isPlaying,
  onPlay,
  onReplay,
  showLinear,
  onToggleLinear,
  activeProperties,
  onToggleProperty,
}: PreviewControlsProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <button
          onClick={onPlay}
          className="px-3 py-1.5 bg-accent text-white text-xs font-semibold rounded-md hover:bg-accent-hover transition-colors"
        >
          {isPlaying ? "Reset" : "Play"}
        </button>
        <button
          onClick={onReplay}
          className="px-3 py-1.5 bg-surface border border-border text-text-primary text-xs font-semibold rounded-md hover:bg-surface-hover transition-colors"
        >
          Replay
        </button>
        <button
          onClick={onToggleLinear}
          className={`ml-auto px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors ${
            showLinear
              ? "bg-accent-muted text-accent border border-accent/30"
              : "bg-surface text-text-secondary border border-border hover:bg-surface-hover"
          }`}
        >
          Linear
        </button>
      </div>
      <div className="flex flex-wrap gap-1">
        {allProperties.map((p) => (
          <button
            key={p.key}
            onClick={() => onToggleProperty(p.key)}
            className={`px-2 py-1 text-[10px] font-medium rounded transition-colors ${
              activeProperties.includes(p.key)
                ? "bg-accent/20 text-accent"
                : "bg-surface text-text-secondary hover:text-text-primary"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>
    </div>
  );
}
