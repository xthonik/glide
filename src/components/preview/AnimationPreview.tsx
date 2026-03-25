"use client";

import type { CSSProperties } from "react";
import { useEffect, useRef, useState } from "react";
import { AnimationProperty, EasingDefinition, SamplingAccuracy } from "@/types";
import { getCssEasingValue, getPreviewSamples, isOscillationEasing } from "@/lib/easing";
import GridSurface from "@/components/shared/GridSurface";

interface AnimationPreviewProps {
  easing: EasingDefinition;
  duration: number;
  delay: number;
  accuracy: SamplingAccuracy;
}

const GRID_CELL_SIZE = "12.5%";
const BASE_BOX_SIZE = "calc(var(--preview-grid-cell) * 2)";

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

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function progressFrame(property: AnimationProperty, progress: number): Keyframe {
  const frame: Keyframe = {
    transform: "none",
    width: BASE_BOX_SIZE,
    height: BASE_BOX_SIZE,
    borderRadius: "16px",
    opacity: 1,
  };

  switch (property) {
    case "moveX":
      frame.transform = `translateX(${(-100 + progress * 200).toFixed(2)}%)`;
      break;
    case "moveY":
      frame.transform = `translateY(${(-100 + progress * 200).toFixed(2)}%)`;
      break;
    case "scale":
      frame.transform = `scale(${(1 + progress).toFixed(3)})`;
      break;
    case "rotate":
      frame.transform = `rotate(${(progress * 360).toFixed(2)}deg)`;
      break;
    case "opacity":
      frame.opacity = clamp(1 - progress, 0, 1);
      break;
    case "width":
      frame.width = `calc(var(--preview-grid-cell) * ${(2 + progress * 2).toFixed(3)})`;
      break;
    case "height":
      frame.height = `calc(var(--preview-grid-cell) * ${(2 + progress * 2).toFixed(3)})`;
      break;
    case "rotateX":
      frame.transform = `rotateX(${(progress * 180).toFixed(2)}deg)`;
      break;
    case "rotateY":
      frame.transform = `rotateY(${(progress * 180).toFixed(2)}deg)`;
      break;
    case "shape":
      frame.borderRadius = `${clamp(16 + progress * 34, 0, 100).toFixed(2)}%`;
      break;
  }

  return frame;
}

function oscillationFrame(property: AnimationProperty, value: number): Keyframe {
  const frame: Keyframe = {
    transform: "none",
    width: BASE_BOX_SIZE,
    height: BASE_BOX_SIZE,
    borderRadius: "16px",
    opacity: 1,
  };

  switch (property) {
    case "moveX":
      frame.transform = `translateX(${(value * 60).toFixed(2)}%)`;
      break;
    case "moveY":
      frame.transform = `translateY(${(value * 60).toFixed(2)}%)`;
      break;
    case "scale":
      frame.transform = `scale(${(1 + value * 0.35).toFixed(3)})`;
      break;
    case "rotate":
      frame.transform = `rotate(${(value * 65).toFixed(2)}deg)`;
      break;
    case "opacity":
      frame.opacity = clamp(1 - Math.abs(value), 0, 1);
      break;
    case "width":
      frame.width = `calc(var(--preview-grid-cell) * ${(2 + value * 0.9).toFixed(3)})`;
      break;
    case "height":
      frame.height = `calc(var(--preview-grid-cell) * ${(2 + value * 0.9).toFixed(3)})`;
      break;
    case "rotateX":
      frame.transform = `rotateX(${(value * 45).toFixed(2)}deg)`;
      break;
    case "rotateY":
      frame.transform = `rotateY(${(value * 45).toFixed(2)}deg)`;
      break;
    case "shape":
      frame.borderRadius = `${clamp(28 + value * 26, 6, 60).toFixed(2)}%`;
      break;
  }

  return frame;
}

export function progressLoopFrames(
  property: AnimationProperty,
  easing: EasingDefinition,
  duration: number,
  delay: number
): Keyframe[] {
  const samples = getPreviewSamples(easing);
  const totalDuration = duration * 2 + delay * 2;
  const startHoldEnd = delay / totalDuration;
  const forwardEnd = (delay + duration) / totalDuration;
  const endHoldEnd = (delay * 2 + duration) / totalDuration;

  const frames: Keyframe[] = [
    { ...progressFrame(property, 0), offset: 0 },
    { ...progressFrame(property, 0), offset: startHoldEnd },
  ];

  for (const sample of samples) {
    frames.push({
      ...progressFrame(property, sample.y),
      offset: startHoldEnd + sample.x * (duration / totalDuration),
    });
  }

  frames.push(
    { ...progressFrame(property, 1), offset: forwardEnd },
    { ...progressFrame(property, 1), offset: endHoldEnd }
  );

  for (const sample of samples) {
    frames.push({
      ...progressFrame(property, 1 - sample.y),
      offset: endHoldEnd + sample.x * (duration / totalDuration),
    });
  }

  frames.push({ ...progressFrame(property, 0), offset: 1 });
  return frames;
}

function oscillationLoopFrames(property: AnimationProperty, easing: EasingDefinition, duration: number, delay: number): Keyframe[] {
  const samples = getPreviewSamples(easing);
  const totalDuration = duration + delay * 2;
  const startHoldEnd = delay / totalDuration;
  const motionEnd = (delay + duration) / totalDuration;

  const frames: Keyframe[] = [
    { ...oscillationFrame(property, 0), offset: 0 },
    { ...oscillationFrame(property, 0), offset: startHoldEnd },
  ];

  for (const sample of samples) {
    frames.push({
      ...oscillationFrame(property, sample.y),
      offset: startHoldEnd + sample.x * (duration / totalDuration),
    });
  }

  frames.push(
    { ...oscillationFrame(property, 0), offset: motionEnd },
    { ...oscillationFrame(property, 0), offset: 1 }
  );
  return frames;
}

function sampledOneShotFrames(property: AnimationProperty, easing: EasingDefinition): Keyframe[] {
  const samples = getPreviewSamples(easing);
  const toFrame = isOscillationEasing(easing) ? oscillationFrame : progressFrame;

  return samples.map((sample) => ({
    ...toFrame(property, sample.y),
    offset: sample.x,
  }));
}

function bezierOneShotFrames(property: AnimationProperty): Keyframe[] {
  return [progressFrame(property, 0), progressFrame(property, 1)];
}

function bezierLoopFrames(property: AnimationProperty, duration: number, delay: number, easingValue: string): Keyframe[] {
  const totalDuration = duration * 2 + delay * 2;
  const startHoldEnd = delay / totalDuration;
  const endReach = (delay + duration) / totalDuration;
  const endHoldEnd = (delay * 2 + duration) / totalDuration;

  return [
    { ...progressFrame(property, 0), offset: 0, easing: "linear" },
    { ...progressFrame(property, 0), offset: startHoldEnd, easing: easingValue },
    { ...progressFrame(property, 1), offset: endReach, easing: "linear" },
    { ...progressFrame(property, 1), offset: endHoldEnd, easing: easingValue },
    { ...progressFrame(property, 0), offset: 1 },
  ];
}

export default function AnimationPreview({ easing, duration, delay, accuracy }: AnimationPreviewProps) {
  const [looping, setLooping] = useState(true);
  const [selectedProperty, setSelectedProperty] = useState<AnimationProperty>("moveX");
  const [replayToken, setReplayToken] = useState(0);
  const boxRef = useRef<HTMLDivElement | null>(null);
  const easingValue = getCssEasingValue(easing, accuracy);

  useEffect(() => {
    const box = boxRef.current;
    if (!box) return;

    box.getAnimations().forEach((animation) => animation.cancel());

    const animation =
      easing.type === "bezier"
        ? looping
          ? box.animate(bezierLoopFrames(selectedProperty, duration, delay, easingValue), {
              duration: duration * 2 + delay * 2,
              iterations: Infinity,
              fill: "both",
            })
          : box.animate(bezierOneShotFrames(selectedProperty), {
              delay,
              duration,
              easing: easingValue,
              iterations: 1,
              fill: "both",
            })
        : looping
        ? box.animate(
            isOscillationEasing(easing)
              ? oscillationLoopFrames(selectedProperty, easing, duration, delay)
              : progressLoopFrames(selectedProperty, easing, duration, delay),
            {
              duration: isOscillationEasing(easing) ? duration + delay * 2 : duration * 2 + delay * 2,
              iterations: Infinity,
              fill: "both",
            }
          )
        : box.animate(sampledOneShotFrames(selectedProperty, easing), {
            delay,
            duration,
            iterations: 1,
            fill: "both",
          });

    return () => {
      animation.cancel();
    };
  }, [accuracy, delay, duration, easing, easingValue, looping, replayToken, selectedProperty]);

  const needsPerspective = selectedProperty === "rotateX" || selectedProperty === "rotateY";

  const boxStyle: CSSProperties = {
    width: BASE_BOX_SIZE,
    height: BASE_BOX_SIZE,
    borderRadius: 16,
    background: "#1a7beb",
    boxShadow: "0 0 20px rgba(26, 123, 235, 0.3)",
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
            onClick={() => setLooping((current) => !current)}
            className={`flex size-7 items-center justify-center rounded-[8px] border transition-colors ${
              looping
                ? "border-accent/40 bg-accent/10 text-accent"
                : "border-border-light text-text-secondary hover:border-text-secondary/40 hover:text-text-primary"
            }`}
            title="Loop preview"
            aria-pressed={looping}
            aria-label="Loop preview"
          >
            <svg aria-hidden="true" viewBox="0 0 14 8" className="h-[8px] w-[14px]" fill="none">
              <path
                d="M1 4c1.1-1.33 2.17-2 3.2-2 1.7 0 2.27 1.1 2.8 2 .53.9 1.1 2 2.8 2 1.03 0 2.1-.67 3.2-2"
                stroke="currentColor"
                strokeLinecap="round"
                strokeWidth="1.4"
              />
              <path
                d="M1 4c1.1 1.33 2.17 2 3.2 2 1.7 0 2.27-1.1 2.8-2 .53-.9 1.1-2 2.8-2 1.03 0 2.1.67 3.2 2"
                stroke="currentColor"
                strokeLinecap="round"
                strokeWidth="1.4"
              />
            </svg>
          </button>
        </div>
      </div>

      {isOscillationEasing(easing) && (
        <p className="text-[12px] leading-[19.5px] text-text-secondary">
          Wiggle is previewed as additive motion around a neutral state.
        </p>
      )}

      <div className="flex max-w-[292px] flex-wrap gap-2">
        {properties.map((property) => (
          <button
            key={property.key}
            onClick={() => setSelectedProperty(property.key)}
            className={`flex h-[21px] w-[52px] items-center justify-center rounded-[8px] border px-px py-[7px] text-center transition-colors ${
              selectedProperty === property.key
                ? "border-accent/40 bg-accent/10 text-accent"
                : "border-border-light text-text-primary hover:border-text-secondary/40"
            }`}
            title={property.label}
            aria-pressed={selectedProperty === property.key}
          >
            <span className="text-[7px] font-medium uppercase leading-[7px] tracking-[0.05em]">
              {property.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
