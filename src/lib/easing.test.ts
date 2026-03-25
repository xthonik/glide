import { describe, expect, it } from "vitest";
import {
  getCssEasingValue,
  getDefaultEasing,
  getSampledPoints,
  isMonotonicPathEasing,
  isOscillationEasing,
  evaluateAt,
} from "./easing";

describe("easing math", () => {
  it("keeps progress easings normalized from 0 to 1", () => {
    for (const type of ["bezier", "spring", "bounce", "overshoot"] as const) {
      const easing = getDefaultEasing(type);
      expect(evaluateAt(easing, 0)).toBeCloseTo(0, 5);
      expect(evaluateAt(easing, 1)).toBeCloseTo(1, 2);
    }
  });

  it("keeps wiggle centered and returning to zero", () => {
    const easing = getDefaultEasing("wiggle");
    expect(isOscillationEasing(easing)).toBe(true);
    expect(evaluateAt(easing, 0)).toBeCloseTo(0, 5);
    expect(evaluateAt(easing, 1)).toBeCloseTo(0, 5);
  });

  it("returns sampled points sorted by x and retaining endpoints", () => {
    const samples = getSampledPoints(getDefaultEasing("spring"), "high");
    expect(samples[0]).toMatchObject({ x: 0 });
    expect(samples[samples.length - 1]).toMatchObject({ x: 1 });
    for (let index = 1; index < samples.length; index += 1) {
      expect(samples[index].x).toBeGreaterThanOrEqual(samples[index - 1].x);
    }
  });

  it("does not expose wiggle as path-compatible easing", () => {
    expect(isMonotonicPathEasing(getDefaultEasing("wiggle"))).toBe(false);
    expect(getCssEasingValue(getDefaultEasing("wiggle"), "medium")).toContain("linear(");
  });
});
