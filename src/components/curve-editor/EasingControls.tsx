"use client";

import type { ReactNode } from "react";
import { useRef, useState } from "react";
import { EasingDefinition, OvershootDirection, SamplingAccuracy } from "@/types";
import {
  ACCURACY_LABELS,
  markBounceCustom,
  markOvershootCustom,
  markSpringCustom,
  markWiggleCustom,
} from "@/lib/easing";
import { clampX, roundTo } from "@/lib/bezier";

interface EasingControlsProps {
  easing: EasingDefinition;
  accuracy: SamplingAccuracy;
  onEasingChange: (easing: EasingDefinition) => void;
  onAccuracyChange: (accuracy: SamplingAccuracy) => void;
}

interface InputRowProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  clampXAxis?: boolean;
  onChange: (value: number) => void;
}

function InputRow({ label, value, min, max, step, clampXAxis, onChange }: InputRowProps) {
  const [draftValue, setDraftValue] = useState(roundTo(value, step < 1 ? 2 : 0).toString());
  const [isEditing, setIsEditing] = useState(false);
  const formattedValue = roundTo(value, step < 1 ? 2 : 0).toString();

  const commitValue = () => {
    setIsEditing(false);
    let nextValue = parseFloat(draftValue);

    if (Number.isNaN(nextValue)) {
      setDraftValue(formattedValue);
      return;
    }

    if (clampXAxis) {
      nextValue = clampX(nextValue);
    } else {
      nextValue = Math.max(min, Math.min(max, nextValue));
    }

    onChange(nextValue);
    setDraftValue(roundTo(nextValue, step < 1 ? 2 : 0).toString());
  };

  return (
    <div className="flex items-center gap-3">
      <span className="w-[72px] shrink-0 text-[11px] font-semibold uppercase tracking-[0.05em] text-text-secondary">
        {label}
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => {
          let nextValue = parseFloat(event.target.value);
          if (clampXAxis) {
            nextValue = clampX(nextValue);
          }
          onChange(nextValue);
        }}
        className="h-5 flex-1"
      />
      <input
        type="number"
        min={min}
        max={max}
        step={step}
        value={isEditing ? draftValue : formattedValue}
        onFocus={() => {
          setDraftValue(formattedValue);
          setIsEditing(true);
        }}
        onBlur={commitValue}
        onChange={(event) => setDraftValue(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.currentTarget.blur();
          }
        }}
        className="h-[26px] w-16 rounded-[6px] border border-text-secondary bg-transparent px-2 text-right font-mono text-[12px] leading-4 text-text-primary outline-none transition-colors focus:border-accent"
      />
    </div>
  );
}

function ChipButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex h-[30px] items-center justify-center rounded-full border px-3 text-[11px] font-medium uppercase tracking-[0.05em] transition-colors ${
        active
          ? "border-accent bg-accent/10 text-accent"
          : "border-border-light text-text-secondary hover:border-text-secondary/40 hover:text-text-primary"
      }`}
    >
      {children}
    </button>
  );
}

const ACCURACY_OPTIONS: SamplingAccuracy[] = ["low", "medium", "high", "ultra"];

function AccuracyControls({
  value,
  onChange,
}: {
  value: SamplingAccuracy;
  onChange: (accuracy: SamplingAccuracy) => void;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const minIndex = 0;
  const maxIndex = ACCURACY_OPTIONS.length - 1;
  const valueIndex = Math.max(0, ACCURACY_OPTIONS.indexOf(value));
  const progress = maxIndex === minIndex ? 0 : (valueIndex - minIndex) / (maxIndex - minIndex);
  const activeLabel = ACCURACY_LABELS[ACCURACY_OPTIONS[valueIndex]];

  const focusInput = () => {
    inputRef.current?.focus();
  };

  const updateByIndex = (nextIndex: number) => {
    onChange(ACCURACY_OPTIONS[Math.min(maxIndex, Math.max(minIndex, nextIndex))]);
  };

  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={focusInput}
        className="w-[72px] shrink-0 cursor-default text-left text-[11px] font-semibold uppercase tracking-[0.05em] text-text-secondary"
      >
        Accuracy
      </button>
      <div className="group relative h-8 flex-1 select-none">
        <input
          ref={inputRef}
          type="range"
          min={minIndex}
          max={maxIndex}
          step={1}
          value={valueIndex}
          onChange={(event) => updateByIndex(parseInt(event.target.value, 10))}
          className="absolute inset-0 z-0 cursor-ew-resize opacity-0"
          aria-label="Code accuracy"
        />
        <div className="pointer-events-none absolute inset-x-2 inset-y-0">
          <div className="absolute inset-x-0 top-1/2 h-[2px] -translate-y-1/2 rounded-full bg-border-light/70" />
          <div
            className="absolute left-0 top-1/2 h-[2px] -translate-y-1/2 rounded-full bg-text-primary transition-[width] duration-200"
            style={{ width: `${progress * 100}%` }}
          />
          <button
            type="button"
            role="slider"
            tabIndex={0}
            aria-label="Code accuracy"
            aria-valuemin={minIndex}
            aria-valuemax={maxIndex}
            aria-valuenow={valueIndex}
            aria-valuetext={activeLabel}
            onClick={focusInput}
            onKeyDown={(event) => {
              switch (event.key) {
                case "ArrowLeft":
                case "ArrowDown":
                  updateByIndex(valueIndex - 1);
                  event.preventDefault();
                  break;
                case "ArrowRight":
                case "ArrowUp":
                  updateByIndex(valueIndex + 1);
                  event.preventDefault();
                  break;
                case "Home":
                  updateByIndex(minIndex);
                  event.preventDefault();
                  break;
                case "End":
                  updateByIndex(maxIndex);
                  event.preventDefault();
                  break;
              }
            }}
            className="pointer-events-auto absolute top-1/2 z-10 size-7 -translate-x-1/2 -translate-y-1/2 rounded-full bg-bg p-1.5 transition-shadow duration-200 focus:outline-none focus:ring-2 focus:ring-accent/50"
            style={{
              left: `${progress * 100}%`,
              boxShadow:
                "0 0 0 1px rgba(58, 66, 82, 0.7), 0 0 16px rgba(26, 123, 235, 0.18)",
            }}
          >
            <span className="block size-full rounded-full bg-text-primary" />
          </button>
        </div>
        <div className="pointer-events-none absolute inset-x-0 top-1/2 z-10 flex -translate-y-1/2 items-center justify-between">
          {ACCURACY_OPTIONS.map((accuracy, index) => (
            <span
              key={accuracy}
              className={`size-4 rounded-full transition-colors duration-200 ${
                index <= valueIndex ? "border-[5px] border-bg bg-text-primary" : "bg-border-light"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function OvershootDirectionControls({
  value,
  onChange,
}: {
  value: OvershootDirection;
  onChange: (direction: OvershootDirection) => void;
}) {
  const labels: Record<OvershootDirection, string> = {
    in: "In",
    out: "Out",
    "in-out": "In-Out",
  };

  return (
    <div className="flex flex-wrap gap-[6px]">
      {(Object.keys(labels) as OvershootDirection[]).map((direction) => (
        <ChipButton key={direction} active={value === direction} onClick={() => onChange(direction)}>
          {labels[direction]}
        </ChipButton>
      ))}
    </div>
  );
}

export default function EasingControls({
  easing,
  accuracy,
  onEasingChange,
  onAccuracyChange,
}: EasingControlsProps) {
  if (easing.type === "bezier") {
    return (
      <div className="flex flex-col gap-2">
        <InputRow
          label="X1"
          value={easing.curve.x1}
          min={0}
          max={1}
          step={0.01}
          clampXAxis
          onChange={(value) => onEasingChange({ type: "bezier", curve: { ...easing.curve, x1: value } })}
        />
        <InputRow
          label="Y1"
          value={easing.curve.y1}
          min={-1}
          max={2}
          step={0.01}
          onChange={(value) => onEasingChange({ type: "bezier", curve: { ...easing.curve, y1: value } })}
        />
        <InputRow
          label="X2"
          value={easing.curve.x2}
          min={0}
          max={1}
          step={0.01}
          clampXAxis
          onChange={(value) => onEasingChange({ type: "bezier", curve: { ...easing.curve, x2: value } })}
        />
        <InputRow
          label="Y2"
          value={easing.curve.y2}
          min={-1}
          max={2}
          step={0.01}
          onChange={(value) => onEasingChange({ type: "bezier", curve: { ...easing.curve, y2: value } })}
        />
      </div>
    );
  }

  if (easing.type === "spring") {
    return (
      <div className="flex flex-col gap-3">
        <InputRow
          label="Mass"
          value={easing.mass}
          min={1}
          max={5}
          step={0.1}
          onChange={(value) => onEasingChange(markSpringCustom(easing, { mass: value }))}
        />
        <InputRow
          label="Stiffness"
          value={easing.stiffness}
          min={0}
          max={100}
          step={1}
          onChange={(value) => onEasingChange(markSpringCustom(easing, { stiffness: value }))}
        />
        <InputRow
          label="Damping"
          value={easing.damping}
          min={0}
          max={100}
          step={1}
          onChange={(value) => onEasingChange(markSpringCustom(easing, { damping: value }))}
        />
        <AccuracyControls value={accuracy} onChange={onAccuracyChange} />
      </div>
    );
  }

  if (easing.type === "bounce") {
    return (
      <div className="flex flex-col gap-3">
        <InputRow
          label="Bounces"
          value={easing.bounces}
          min={1}
          max={10}
          step={1}
          onChange={(value) => onEasingChange(markBounceCustom(easing, { bounces: value }))}
        />
        <InputRow
          label="Damping"
          value={easing.damping}
          min={0}
          max={100}
          step={1}
          onChange={(value) => onEasingChange(markBounceCustom(easing, { damping: value }))}
        />
        <AccuracyControls value={accuracy} onChange={onAccuracyChange} />
      </div>
    );
  }

  if (easing.type === "wiggle") {
    return (
      <div className="flex flex-col gap-3">
        <InputRow
          label="Wiggles"
          value={easing.wiggles}
          min={1}
          max={10}
          step={1}
          onChange={(value) => onEasingChange(markWiggleCustom(easing, { wiggles: value }))}
        />
        <InputRow
          label="Damping"
          value={easing.damping}
          min={0}
          max={100}
          step={1}
          onChange={(value) => onEasingChange(markWiggleCustom(easing, { damping: value }))}
        />
        <AccuracyControls value={accuracy} onChange={onAccuracyChange} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <OvershootDirectionControls
        value={easing.direction}
        onChange={(direction) => onEasingChange(markOvershootCustom(easing, { direction }))}
      />
      <InputRow
        label="Mass"
        value={easing.mass}
        min={1}
        max={5}
        step={0.1}
        onChange={(value) => onEasingChange(markOvershootCustom(easing, { mass: value }))}
      />
      <InputRow
        label="Damping"
        value={easing.damping}
        min={0}
        max={100}
        step={1}
        onChange={(value) => onEasingChange(markOvershootCustom(easing, { damping: value }))}
      />
      <AccuracyControls value={accuracy} onChange={onAccuracyChange} />
    </div>
  );
}
