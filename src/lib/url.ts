import { BezierCurve } from "@/types";
import { roundTo } from "./bezier";

const DEFAULT_CURVE: BezierCurve = { x1: 0.42, y1: 0, x2: 0.58, y2: 1 };
const DEFAULT_DURATION = 400;
const DEFAULT_DELAY = 500;

export function encodeCurveToURL(curve: BezierCurve, duration: number, delay: number): string {
  const params = new URLSearchParams({
    x1: roundTo(curve.x1).toString(),
    y1: roundTo(curve.y1).toString(),
    x2: roundTo(curve.x2).toString(),
    y2: roundTo(curve.y2).toString(),
    d: duration.toString(),
    dl: delay.toString(),
  });
  return `${window.location.origin}${window.location.pathname}?${params.toString()}`;
}

export function decodeCurveFromURL(searchParams: URLSearchParams): {
  curve: BezierCurve;
  duration: number;
  delay: number;
} {
  const parse = (key: string, fallback: number) => {
    const val = searchParams.get(key);
    if (val === null) return fallback;
    const num = parseFloat(val);
    return isNaN(num) ? fallback : num;
  };

  return {
    curve: {
      x1: parse("x1", DEFAULT_CURVE.x1),
      y1: parse("y1", DEFAULT_CURVE.y1),
      x2: parse("x2", DEFAULT_CURVE.x2),
      y2: parse("y2", DEFAULT_CURVE.y2),
    },
    duration: parse("d", DEFAULT_DURATION),
    delay: parse("dl", DEFAULT_DELAY),
  };
}

export function updateURLState(curve: BezierCurve, duration: number, delay: number): void {
  const params = new URLSearchParams({
    x1: roundTo(curve.x1).toString(),
    y1: roundTo(curve.y1).toString(),
    x2: roundTo(curve.x2).toString(),
    y2: roundTo(curve.y2).toString(),
    d: duration.toString(),
    dl: delay.toString(),
  });
  window.history.replaceState(null, "", `?${params.toString()}`);
}
