import { BezierCurve } from "@/types";

/**
 * Generate SVG path d-attribute for a cubic bezier curve.
 * SVG Y-axis is flipped (0 = top), so we use (1 - y).
 */
export function generateSVGPath(curve: BezierCurve): string {
  const { x1, y1, x2, y2 } = curve;
  return `M 0,1 C ${formatSvgNumber(x1)},${formatSvgNumber(1 - y1)} ${formatSvgNumber(x2)},${formatSvgNumber(1 - y2)} 1,0`;
}

/**
 * Generate a mini SVG path for preset cards (viewBox 0 0 1 1).
 */
export function generateMiniPath(curve: BezierCurve): string {
  return generateSVGPath(curve);
}

/**
 * Clamp x values to [0, 1] range (CSS requirement).
 * Y values are unclamped to allow overshoot.
 */
export function clampX(value: number): number {
  return Math.max(0, Math.min(1, value));
}

/**
 * Round a number to N decimal places for display.
 */
export function roundTo(value: number, decimals: number = 2): number {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

export function formatSvgNumber(value: number, decimals: number = 6): string {
  const rounded = roundTo(value, decimals);
  if (Object.is(rounded, -0)) {
    return "0";
  }
  return rounded.toString();
}

/**
 * Compute the cubic bezier value at parameter t.
 * B(t) = (1-t)^3*P0 + 3(1-t)^2*t*P1 + 3(1-t)*t^2*P2 + t^3*P3
 */
function cubicBezier(t: number, p0: number, p1: number, p2: number, p3: number): number {
  const mt = 1 - t;
  return mt * mt * mt * p0 + 3 * mt * mt * t * p1 + 3 * mt * t * t * p2 + t * t * t * p3;
}

/**
 * Compute derivative of cubic bezier at parameter t.
 */
function cubicBezierDerivative(t: number, p0: number, p1: number, p2: number, p3: number): number {
  const mt = 1 - t;
  return 3 * mt * mt * (p1 - p0) + 6 * mt * t * (p2 - p1) + 3 * t * t * (p3 - p2);
}

/**
 * Given an x value (0..1), find the corresponding y value on the bezier curve.
 * Uses Newton's method to find parameter t where Bx(t) = x, then computes By(t).
 */
export function solveForY(curve: BezierCurve, x: number): number {
  const { x1, y1, x2, y2 } = curve;

  // Edge cases
  if (x <= 0) return 0;
  if (x >= 1) return 1;

  // Newton's method to find t where Bx(t) = x
  let t = x; // initial guess
  for (let i = 0; i < 8; i++) {
    const currentX = cubicBezier(t, 0, x1, x2, 1);
    const diff = currentX - x;
    if (Math.abs(diff) < 1e-7) break;

    const derivative = cubicBezierDerivative(t, 0, x1, x2, 1);
    if (Math.abs(derivative) < 1e-7) break;

    t -= diff / derivative;
  }

  // Clamp t to [0, 1]
  t = Math.max(0, Math.min(1, t));

  return cubicBezier(t, 0, y1, y2, 1);
}

/**
 * Sample the curve at multiple points for visualization.
 */
export function sampleCurve(curve: BezierCurve, numPoints: number = 100): { x: number; y: number }[] {
  const points: { x: number; y: number }[] = [];
  for (let i = 0; i <= numPoints; i++) {
    const t = i / numPoints;
    const x = cubicBezier(t, 0, curve.x1, curve.x2, 1);
    const y = cubicBezier(t, 0, curve.y1, curve.y2, 1);
    points.push({ x, y });
  }
  return points;
}

/**
 * Format cubic-bezier values for CSS output.
 */
export function formatCubicBezier(curve: BezierCurve): string {
  return `${roundTo(curve.x1)}, ${roundTo(curve.y1)}, ${roundTo(curve.x2)}, ${roundTo(curve.y2)}`;
}
