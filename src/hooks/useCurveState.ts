"use client";

import { useCallback, useEffect, useState } from "react";
import { EasingDefinition, EasingType, SamplingAccuracy } from "@/types";
import {
  DEFAULT_ACCURACY,
  DEFAULT_DELAY,
  DEFAULT_DURATION,
  getDefaultEasing,
  sanitizeEasing,
  setBezierControlPoint,
} from "@/lib/easing";
import { decodeEasingFromURL, updateURLState } from "@/lib/url";

function getInitialState() {
  if (typeof window === "undefined") {
    return {
      easing: getDefaultEasing("bezier"),
      duration: DEFAULT_DURATION,
      delay: DEFAULT_DELAY,
      accuracy: DEFAULT_ACCURACY,
    };
  }

  return decodeEasingFromURL(new URLSearchParams(window.location.search));
}

export function useCurveState() {
  const initialState = getInitialState();
  const [easing, setEasingRaw] = useState<EasingDefinition>(initialState.easing);
  const [duration, setDuration] = useState<number>(initialState.duration);
  const [delay, setDelay] = useState<number>(initialState.delay);
  const [accuracy, setAccuracyRaw] = useState<SamplingAccuracy>(initialState.accuracy);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      updateURLState(easing, duration, delay, accuracy);
    }, 300);

    return () => {
      window.clearTimeout(timer);
    };
  }, [accuracy, delay, duration, easing]);

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
