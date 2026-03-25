"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { BezierCurve } from "@/types";
import { clampX } from "@/lib/bezier";
import { decodeCurveFromURL, updateURLState } from "@/lib/url";

const DEFAULT_CURVE: BezierCurve = { x1: 0.42, y1: 0, x2: 0.58, y2: 1 };
const DEFAULT_DURATION = 400;
const DEFAULT_DELAY = 500;

export function useCurveState() {
  const [curve, setCurveRaw] = useState<BezierCurve>(DEFAULT_CURVE);
  const [duration, setDuration] = useState(DEFAULT_DURATION);
  const [delay, setDelay] = useState(DEFAULT_DELAY);
  const urlUpdateTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Read from URL on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const { curve: urlCurve, duration: urlDuration, delay: urlDelay } = decodeCurveFromURL(params);
    setCurveRaw(urlCurve);
    setDuration(urlDuration);
    setDelay(urlDelay);
  }, []);

  // Debounced URL update
  const scheduleURLUpdate = useCallback((c: BezierCurve, d: number, dl: number) => {
    if (urlUpdateTimer.current) clearTimeout(urlUpdateTimer.current);
    urlUpdateTimer.current = setTimeout(() => updateURLState(c, d, dl), 300);
  }, []);

  const setCurve = useCallback(
    (newCurve: BezierCurve) => {
      const clamped: BezierCurve = {
        x1: clampX(newCurve.x1),
        y1: newCurve.y1,
        x2: clampX(newCurve.x2),
        y2: newCurve.y2,
      };
      setCurveRaw(clamped);
      scheduleURLUpdate(clamped, duration, delay);
    },
    [delay, duration, scheduleURLUpdate]
  );

  const setControlPoint = useCallback(
    (point: "p1" | "p2", x: number, y: number) => {
      setCurveRaw((prev) => {
        const next =
          point === "p1"
            ? { ...prev, x1: clampX(x), y1: y }
            : { ...prev, x2: clampX(x), y2: y };
        scheduleURLUpdate(next, duration, delay);
        return next;
      });
    },
    [delay, duration, scheduleURLUpdate]
  );

  const handleSetDuration = useCallback(
    (d: number) => {
      setDuration(d);
      scheduleURLUpdate(curve, d, delay);
    },
    [curve, delay, scheduleURLUpdate]
  );

  const handleSetDelay = useCallback(
    (nextDelay: number) => {
      setDelay(nextDelay);
      scheduleURLUpdate(curve, duration, nextDelay);
    },
    [curve, duration, scheduleURLUpdate]
  );

  return {
    curve,
    duration,
    delay,
    setCurve,
    setDuration: handleSetDuration,
    setDelay: handleSetDelay,
    setControlPoint,
  };
}
