"use client";

import { useCallback, useEffect, useState } from "react";
import { EasingDefinition, EasingToolState, EasingType, SamplingAccuracy } from "@/types";
import { getDefaultEasing, sanitizeEasing, setBezierControlPoint } from "@/lib/easing";
import { decodeEasingFromURL, updateURLState } from "@/lib/url";

export function useCurveState(initialState: EasingToolState) {
  const [easing, setEasingRaw] = useState<EasingDefinition>(initialState.easing);
  const [duration, setDuration] = useState<number>(initialState.duration);
  const [delay, setDelay] = useState<number>(initialState.delay);
  const [accuracy, setAccuracyRaw] = useState<SamplingAccuracy>(initialState.accuracy);
  const [isLocationReady, setIsLocationReady] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const decoded = decodeEasingFromURL(new URLSearchParams(window.location.search));
      setEasingRaw(decoded.easing);
      setDuration(decoded.duration);
      setDelay(decoded.delay);
      setAccuracyRaw(decoded.accuracy);
      setIsLocationReady(true);
    }, 0);

    return () => {
      window.clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    if (!isLocationReady) {
      return;
    }

    const timer = window.setTimeout(() => {
      updateURLState(easing, duration, delay, accuracy);
    }, 300);

    return () => {
      window.clearTimeout(timer);
    };
  }, [accuracy, delay, duration, easing, isLocationReady]);

  const setEasing = useCallback((next: EasingDefinition) => {
    setEasingRaw(sanitizeEasing(next));
  }, []);

  const setType = useCallback((type: EasingType) => {
    setEasingRaw(getDefaultEasing(type));
  }, []);

  const setControlPoint = useCallback((point: "p1" | "p2", x: number, y: number) => {
    setEasingRaw((current) => setBezierControlPoint(current, point, x, y));
  }, []);

  const setAccuracy = useCallback((next: SamplingAccuracy) => {
    setAccuracyRaw(next);
  }, []);

  return {
    easing,
    duration,
    delay,
    accuracy,
    setEasing,
    setType,
    setDuration,
    setDelay,
    setAccuracy,
    setControlPoint,
  };
}
