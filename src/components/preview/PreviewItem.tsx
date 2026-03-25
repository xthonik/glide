"use client";

import { AnimationProperty, BezierCurve } from "@/types";
import { roundTo } from "@/lib/bezier";

interface PreviewItemProps {
  property: AnimationProperty;
  curve: BezierCurve;
  duration: number;
  isPlaying: boolean;
  showLinear: boolean;
}

const propertyLabels: Record<AnimationProperty, string> = {
  moveX: "Move X",
  moveY: "Move Y",
  scale: "Scale",
  rotate: "Rotate",
  opacity: "Opacity",
  width: "Width",
  height: "Height",
  rotateX: "Rotate X",
  rotateY: "Rotate Y",
  shape: "Shape",
};

function getStyle(property: AnimationProperty, isEnd: boolean): React.CSSProperties {
  if (!isEnd) {
    return {};
  }
  switch (property) {
    case "moveX":
      return { transform: "translateX(calc(100% - 32px))" };
    case "moveY":
      return { transform: "translateY(20px)" };
    case "scale":
      return { transform: "scale(1.6)" };
    case "rotate":
      return { transform: "rotate(360deg)" };
    case "opacity":
      return { opacity: 0.1 };
    case "width":
      return { width: "100%" };
    case "height":
      return { height: "48px" };
    case "rotateX":
      return { transform: "rotateX(180deg)" };
    case "rotateY":
      return { transform: "rotateY(180deg)" };
    case "shape":
      return { borderRadius: "50%" };
  }
}

export default function PreviewItem({
  property,
  curve,
  duration,
  isPlaying,
  showLinear,
}: PreviewItemProps) {
  const bezierValue = `cubic-bezier(${roundTo(curve.x1)}, ${roundTo(curve.y1)}, ${roundTo(curve.x2)}, ${roundTo(curve.y2)})`;

  const baseBoxStyle: React.CSSProperties = {
    width: 32,
    height: 32,
    borderRadius: 6,
    transitionDuration: `${duration}ms`,
    transitionProperty: "all",
  };

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[10px] text-text-secondary font-medium uppercase tracking-wider">
        {propertyLabels[property]}
      </span>
      <div className="relative bg-surface rounded-lg p-2 h-[52px] flex items-center overflow-hidden">
        {/* Eased box */}
        <div
          style={{
            ...baseBoxStyle,
            transitionTimingFunction: bezierValue,
            ...getStyle(property, isPlaying),
            backgroundColor: "var(--color-accent)",
          }}
        />
        {/* Linear comparison */}
        {showLinear && (
          <div
            className="absolute top-2 left-2"
            style={{
              ...baseBoxStyle,
              transitionTimingFunction: "linear",
              ...getStyle(property, isPlaying),
              backgroundColor: "var(--color-text-secondary)",
              opacity: 0.3,
            }}
          />
        )}
      </div>
    </div>
  );
}
