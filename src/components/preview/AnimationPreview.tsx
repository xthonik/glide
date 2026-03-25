"use client";

import { useState, useRef, useEffect } from "react";
import { AnimationProperty, BezierCurve } from "@/types";
import { roundTo } from "@/lib/bezier";
import GridSurface from "@/components/shared/GridSurface";

interface AnimationPreviewProps {
  curve: BezierCurve;
  duration: number;
  delay: number;
}

const GRID_CELL_SIZE = "12.5%";
const BASE_BOX_SIZE = "calc(var(--preview-grid-cell) * 2)";
const EXPANDED_BOX_SIZE = "calc(var(--preview-grid-cell) * 4)";

const properties: { key: AnimationProperty; label: string }[] = [
  { key: "moveX", label: "Move X" },
  { key: "moveY", label: "Move Y" },
  { key: "width", label: "Width" },
  { key: "height", label: "Height" },
  { key: "scale", label: "Scale" },
  { key: "rotate", label: "Rotate" },
  { key: "opacity", label: "Opacity" },
  { key: "rotateX", label: "Rotate X" },
  { key: "rotateY", label: "Rotate Y" },
  { key: "shape", label: "Shape" },
];

const infinityIcon = "http://localhost:3845/assets/d712f846268664d507f95c46a457c475470519ab.svg";
function getAnimationFrames(property: AnimationProperty): Keyframe[] {
  const startFrame: Keyframe = {
    transform: "none",
    width: BASE_BOX_SIZE,
    height: BASE_BOX_SIZE,
    borderRadius: "16px",
    opacity: 1,
  };

  const endFrame: Keyframe = {
    ...startFrame,
  };

  switch (property) {
    case "moveX":
      startFrame.transform = "translateX(-100%)";
      endFrame.transform = "translateX(100%)";
      break;
    case "moveY":
      startFrame.transform = "translateY(-100%)";
      endFrame.transform = "translateY(100%)";
      break;
    case "scale":
      endFrame.transform = "scale(2)";
      break;
    case "rotate":
      endFrame.transform = "rotate(360deg)";
      break;
    case "opacity":
      endFrame.opacity = 0.1;
      break;
    case "width":
      endFrame.width = EXPANDED_BOX_SIZE;
      break;
    case "height":
      endFrame.height = EXPANDED_BOX_SIZE;
      break;
    case "rotateX":
      endFrame.transform = "rotateX(180deg)";
      break;
    case "rotateY":
      endFrame.transform = "rotateY(180deg)";
      break;
    case "shape":
      endFrame.borderRadius = "50%";
      break;
  }

  return [startFrame, endFrame];
}

function getLoopingAnimationFrames(
  property: AnimationProperty,
  duration: number,
  delay: number,
  easing: string
): Keyframe[] {
  const [startFrame, endFrame] = getAnimationFrames(property);
  const totalDuration = duration * 2 + delay * 2;
  const startHoldEnd = delay / totalDuration;
  const endReach = (delay + duration) / totalDuration;
  const endHoldEnd = (delay * 2 + duration) / totalDuration;

  return [
    { ...startFrame, offset: 0, easing: "linear" },
    { ...startFrame, offset: startHoldEnd, easing },
    { ...endFrame, offset: endReach, easing: "linear" },
    { ...endFrame, offset: endHoldEnd, easing },
    { ...startFrame, offset: 1 },
  ];
}

export default function AnimationPreview({ curve, duration, delay }: AnimationPreviewProps) {
  const [looping, setLooping] = useState(true);
  const [selectedProperty, setSelectedProperty] = useState<AnimationProperty>("moveX");
  const [replayToken, setReplayToken] = useState(0);
  const boxRef = useRef<HTMLDivElement | null>(null);

  const bezierValue = `cubic-bezier(${roundTo(curve.x1)}, ${roundTo(curve.y1)}, ${roundTo(curve.x2)}, ${roundTo(curve.y2)})`;

  useEffect(() => {
    const box = boxRef.current;
    if (!box) return;

    box.getAnimations().forEach((animation) => animation.cancel());

    const animation = looping
      ? box.animate(getLoopingAnimationFrames(selectedProperty, duration, delay, bezierValue), {
          duration: duration * 2 + delay * 2,
          iterations: Infinity,
          fill: "both",
        })
      : box.animate(getAnimationFrames(selectedProperty), {
          delay,
          duration,
          easing: bezierValue,
          iterations: 1,
          fill: "both",
        });

    return () => {
      animation.cancel();
    };
  }, [bezierValue, delay, duration, looping, replayToken, selectedProperty]);

  const needsPerspective = selectedProperty === "rotateX" || selectedProperty === "rotateY";

  const boxStyle: React.CSSProperties = {
    width: BASE_BOX_SIZE,
    height: BASE_BOX_SIZE,
    borderRadius: 16,
    background: "#1a7beb",
    boxShadow: "0 0 20px rgba(168, 85, 247, 0.3)",
  };

  return (
    <div className="flex flex-col gap-3">
      <GridSurface
        className="relative mx-auto flex aspect-square w-full max-w-[331px] items-center justify-center overflow-hidden"
        cellSize={GRID_CELL_SIZE}
        style={{
          perspective: needsPerspective ? "400px" : undefined,
        }}
      >
        <div ref={boxRef} style={boxStyle} />
      </GridSurface>

      <div className="flex w-full items-center justify-between">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setReplayToken((token) => token + 1)}
            className="flex size-7 items-center justify-center rounded-[8px] border border-border-light text-[14px] leading-5 text-text-secondary transition-colors hover:border-text-secondary/40 hover:text-text-primary"
            title="Play Again"
            aria-label="Replay preview"
          >
            ↺
          </button>
          <button
            onClick={() => setLooping((p) => !p)}
            className={`flex size-7 items-center justify-center rounded-[8px] border transition-colors ${
              looping
                ? "border-accent/40 text-accent bg-accent/10"
                : "border-border-light text-text-secondary hover:text-text-primary hover:border-text-secondary/40"
            }`}
            title="Loop preview"
            aria-pressed={looping}
            aria-label="Loop preview"
          >
            <img
              alt=""
              src={infinityIcon}
              className={`h-[8px] w-[14px] ${looping ? "" : "grayscale brightness-75"}`}
            />
          </button>
        </div>
      </div>

      <div className="flex max-w-[292px] flex-wrap gap-2">
        {properties.map((p) => (
          <button
            key={p.key}
            onClick={() => setSelectedProperty(p.key)}
            className={`flex h-[21px] w-[52px] items-center justify-center rounded-[8px] border px-px py-[7px] text-center transition-colors ${
              selectedProperty === p.key
                ? "border-accent/40 bg-accent/10 text-accent"
                : "border-border-light text-text-primary hover:border-text-secondary/40"
            }`}
            title={p.label}
            aria-pressed={selectedProperty === p.key}
          >
            <span className="text-[7px] font-medium uppercase leading-[7px] tracking-[0.05em]">
              {p.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
