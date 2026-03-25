import {
  BezierCurve,
  BounceEasingDefinition,
  BouncePresetName,
  EasingDefinition,
  EasingType,
  OvershootDirection,
  OvershootEasingDefinition,
  OvershootPresetName,
  SamplePoint,
  SamplingAccuracy,
  SpringEasingDefinition,
  SpringPresetName,
  WiggleEasingDefinition,
  WigglePresetName,
} from "@/types";
import { clampX, formatCubicBezier, roundTo, solveForY } from "./bezier";

export const DEFAULT_BEZIER_CURVE: BezierCurve = { x1: 0.42, y1: 0, x2: 0.58, y2: 1 };
export const DEFAULT_DURATION = 400;
export const DEFAULT_DELAY = 500;
export const DEFAULT_ACCURACY: SamplingAccuracy = "high";

interface AccuracyConfig {
  points: number;
  epsilon: number;
}

interface SpringParams {
  mass: number;
  stiffness: number;
  damping: number;
}

interface BounceParams {
  bounces: number;
  damping: number;
}

interface WiggleParams {
  wiggles: number;
  damping: number;
}

interface OvershootParams {
  mass: number;
  damping: number;
}

export const SPRING_PRESETS: Record<SpringPresetName, SpringParams> = {
  heavy: { mass: 3.5, stiffness: 20, damping: 26 },
  bouncy: { mass: 1, stiffness: 80, damping: 0 },
  drop: { mass: 4, stiffness: 10, damping: 5 },
  glide: { mass: 1, stiffness: 10, damping: 75 },
  snap: { mass: 1, stiffness: 90, damping: 95 },
  lazy: { mass: 2.5, stiffness: 4, damping: 15 },
  elastic: { mass: 1, stiffness: 30, damping: 50 },
};

export const BOUNCE_PRESETS: Record<BouncePresetName, BounceParams> = {
  firm: { bounces: 4, damping: 60 },
  soft: { bounces: 2, damping: 75 },
  sharp: { bounces: 3, damping: 85 },
  subtle: { bounces: 1, damping: 55 },
  playful: { bounces: 6, damping: 35 },
  springy: { bounces: 8, damping: 10 },
};

export const WIGGLE_PRESETS: Record<WigglePresetName, WiggleParams> = {
  subtle: { wiggles: 2, damping: 75 },
  energetic: { wiggles: 6, damping: 25 },
  playful: { wiggles: 4, damping: 50 },
  sharp: { wiggles: 3, damping: 90 },
  smooth: { wiggles: 1, damping: 100 },
  intense: { wiggles: 8, damping: 10 },
  dynamic: { wiggles: 10, damping: 0 },
};

const SHARED_OVERSHOOT_PRESETS: Record<OvershootPresetName, OvershootParams> = {
  soft: { mass: 2, damping: 60 },
  firm: { mass: 3, damping: 80 },
  smooth: { mass: 3.5, damping: 70 },
  dynamic: { mass: 4, damping: 20 },
  dramatic: { mass: 5, damping: 0 },
};

export const OVERSHOOT_PRESETS: Record<OvershootDirection, Record<OvershootPresetName, OvershootParams>> = {
  in: SHARED_OVERSHOOT_PRESETS,
  out: SHARED_OVERSHOOT_PRESETS,
  "in-out": SHARED_OVERSHOOT_PRESETS,
};

export const SPRING_PRESET_LABELS: Record<SpringPresetName, string> = {
  heavy: "Heavy",
  bouncy: "Bouncy",
  drop: "Drop",
  glide: "Glide",
  snap: "Snap",
  lazy: "Lazy",
  elastic: "Elastic",
};

export const BOUNCE_PRESET_LABELS: Record<BouncePresetName, string> = {
  firm: "Firm",
  soft: "Soft",
  sharp: "Sharp",
  subtle: "Subtle",
  playful: "Playful",
  springy: "Springy",
};

export const WIGGLE_PRESET_LABELS: Record<WigglePresetName, string> = {
  subtle: "Subtle",
  energetic: "Energetic",
  playful: "Playful",
  sharp: "Sharp",
  smooth: "Smooth",
  intense: "Intense",
  dynamic: "Dynamic",
};

export const OVERSHOOT_PRESET_LABELS: Record<OvershootPresetName, string> = {
  soft: "Soft",
  firm: "Firm",
  smooth: "Smooth",
  dynamic: "Dynamic",
  dramatic: "Dramatic",
};

export const ACCURACY_LABELS: Record<SamplingAccuracy, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  ultra: "Ultra",
};

const ACCURACY_CONFIG: Record<SamplingAccuracy, AccuracyConfig> = {
  low: { points: 250, epsilon: 0.04 },
  medium: { points: 500, epsilon: 0.02 },
  high: { points: 1000, epsilon: 0.005 },
  ultra: { points: 1000, epsilon: 0.001 },
};

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function mapRange(value: number, inMin: number, inMax: number, outMin: number, outMax: number): number {
  return outMin + ((value - inMin) * (outMax - outMin)) / (inMax - inMin);
}

export function getDefaultEasing(type: EasingType): EasingDefinition {
  switch (type) {
    case "bezier":
      return { type: "bezier", curve: DEFAULT_BEZIER_CURVE };
    case "spring":
      return { type: "spring", preset: "heavy", ...SPRING_PRESETS.heavy };
    case "bounce":
      return { type: "bounce", preset: "firm", ...BOUNCE_PRESETS.firm };
    case "wiggle":
      return { type: "wiggle", preset: "subtle", ...WIGGLE_PRESETS.subtle };
    case "overshoot":
      return { type: "overshoot", direction: "out", preset: "soft", ...OVERSHOOT_PRESETS.out.soft };
  }
}

export function sanitizeEasing(easing: EasingDefinition): EasingDefinition {
  switch (easing.type) {
    case "bezier":
      return {
        type: "bezier",
        curve: {
          x1: clampX(easing.curve.x1),
          y1: easing.curve.y1,
          x2: clampX(easing.curve.x2),
          y2: easing.curve.y2,
        },
      };
    case "spring":
      return {
        ...easing,
        mass: clamp(roundTo(easing.mass, 1), 1, 5),
        stiffness: clamp(roundTo(easing.stiffness), 0, 100),
        damping: clamp(roundTo(easing.damping), 0, 100),
      };
    case "bounce":
      return {
        ...easing,
        bounces: clamp(roundTo(easing.bounces), 1, 10),
        damping: clamp(roundTo(easing.damping), 0, 100),
      };
    case "wiggle":
      return {
        ...easing,
        wiggles: clamp(roundTo(easing.wiggles), 1, 10),
        damping: clamp(roundTo(easing.damping), 0, 100),
      };
    case "overshoot":
      return {
        ...easing,
        mass: clamp(roundTo(easing.mass, 1), 1, 5),
        damping: clamp(roundTo(easing.damping), 0, 100),
      };
  }
}

export function setBezierControlPoint(
  easing: EasingDefinition,
  point: "p1" | "p2",
  x: number,
  y: number
): EasingDefinition {
  if (easing.type !== "bezier") {
    return easing;
  }

  return sanitizeEasing({
    type: "bezier",
    curve:
      point === "p1"
        ? { ...easing.curve, x1: x, y1: y }
        : { ...easing.curve, x2: x, y2: y },
  });
}

export function isProgressEasing(easing: EasingDefinition): boolean {
  return easing.type !== "wiggle";
}

export function isOscillationEasing(easing: EasingDefinition): boolean {
  return easing.type === "wiggle";
}

function createSpringMath({ stiffness, mass, damping }: SpringParams): (t: number) => number {
  const mappedStiffness = mapRange(stiffness, 0, 100, 1, 500);
  const mappedDamping = mapRange(damping, 0, 100, 5, 25);
  const angularFrequency = Math.sqrt(mappedStiffness / mass);
  const dampingRatio = mappedDamping / (2 * Math.sqrt(mappedStiffness * mass));

  if (dampingRatio < 1) {
    const dampedFrequency = angularFrequency * Math.sqrt(1 - dampingRatio * dampingRatio);
    const phaseFactor = dampingRatio / Math.sqrt(1 - dampingRatio * dampingRatio);
    return (t) => {
      const decay = Math.exp(-dampingRatio * angularFrequency * t);
      const cosine = Math.cos(dampedFrequency * t);
      const sine = phaseFactor * Math.sin(dampedFrequency * t);
      return 1 - decay * (cosine + sine);
    };
  }

  if (dampingRatio === 1) {
    return (t) => 1 - Math.exp(-angularFrequency * t) * (1 + angularFrequency * t);
  }

  const overdampedFrequency = angularFrequency * Math.sqrt(dampingRatio * dampingRatio - 1);
  const coefficient1 = (overdampedFrequency + dampingRatio * angularFrequency) / (2 * overdampedFrequency);
  const coefficient2 = 1 - coefficient1;
  return (t) => {
    const part1 = Math.exp((-dampingRatio * angularFrequency + overdampedFrequency) * t);
    const part2 = Math.exp((-dampingRatio * angularFrequency - overdampedFrequency) * t);
    return 1 - coefficient1 * part1 - coefficient2 * part2;
  };
}

function createBounceMath({ bounces, damping }: BounceParams): (t: number) => number {
  const mappedDamping = mapRange(damping, 0, 100, -2, 2);
  return (t) => {
    let progress = t;
    if (progress > 1) progress = 1;
    return (
      1 -
      Math.pow(1 - progress, 1.5) *
        Math.abs(Math.cos(Math.pow(progress, 2) * (bounces + 0.5) * Math.PI)) *
        Math.exp(-mappedDamping * progress)
    );
  };
}

function createWiggleMath({ wiggles, damping }: WiggleParams): (t: number) => number {
  const mappedDamping = mapRange(damping, 0, 100, 0, 0.2);
  const baseFrequency = wiggles * Math.PI;
  const dampingFactor = mappedDamping;
  const dampedFrequency = baseFrequency * Math.sqrt(1 - dampingFactor * dampingFactor);
  const phaseOffset = Math.atan(dampedFrequency / (dampingFactor * baseFrequency)) / dampedFrequency;
  const normalization =
    1 / (Math.exp(-dampingFactor * baseFrequency * phaseOffset) * Math.sin(dampedFrequency * phaseOffset));

  return (t) => {
    if (t < 0 || t > 1) {
      return 0;
    }

    const decay = Math.exp(-dampingFactor * baseFrequency * t);
    const oscillation = normalization * decay * Math.sin(dampedFrequency * t);
    const envelope = 0.5 * (1 + Math.cos(Math.PI * t));
    return oscillation * envelope;
  };
}

function createOvershootMath({
  damping,
  mass,
  direction,
}: OvershootParams & { direction: OvershootDirection }): (t: number) => number {
  const boundedMass = Math.min(Math.max(mass, 1), 10);
  const mappedDamping = mapRange(damping, 0, 100, 0.5, 1);
  const easeInBase = (t: number) => {
    if (direction === "in-out") {
      return t < 0.5 ? Math.pow(t * 2, 1 / mappedDamping) / 2 : 1 - Math.pow((1 - t) * 2, 1 / mappedDamping) / 2;
    }
    return Math.pow(t, 1 / mappedDamping);
  };

  const easeIn = (t: number) => {
    const value = easeInBase(t);
    return value * value * ((boundedMass + 1) * value - boundedMass);
  };
  const easeOut = (t: number) => 1 - easeIn(1 - t);
  const easeInOut = (t: number) => {
    let value = easeInBase(t) * 2;
    if (value < 1) {
      return 0.5 * (value * value * ((boundedMass * 1.525 + 1) * value - boundedMass * 1.525));
    }
    value -= 2;
    return 0.5 * (value * value * ((boundedMass * 1.525 + 1) * value + boundedMass * 1.525) + 2);
  };

  switch (direction) {
    case "in":
      return easeIn;
    case "out":
      return easeOut;
    case "in-out":
      return easeInOut;
  }
}

function getMathFunction(easing: Exclude<EasingDefinition, { type: "bezier" }>): (t: number) => number {
  switch (easing.type) {
    case "spring":
      return createSpringMath(easing);
    case "bounce":
      return createBounceMath(easing);
    case "wiggle":
      return createWiggleMath(easing);
    case "overshoot":
      return createOvershootMath(easing);
  }
}

function findSettlingDuration(mathFunction: (t: number) => number, expectedEndValue: number): number {
  let time = 0;
  const step = 0.016;
  let previousValue = mathFunction(time);
  let velocity = 1;
  const threshold = 0.005;
  let stableFrames = 0;

  while (Math.abs(velocity) > threshold || stableFrames < 25) {
    time += step;
    const currentValue = mathFunction(time);
    velocity = (currentValue - previousValue) / step;
    previousValue = currentValue;

    if (Math.abs(velocity) < threshold) {
      stableFrames += 1;
    } else {
      stableFrames = 0;
    }

    if (time > 25) {
      break;
    }
  }

  while (roundTo(previousValue, 2) !== expectedEndValue) {
    time += step;
    previousValue = roundTo(mathFunction(time), 2);
  }

  return Math.round(time * 10) / 10;
}

export function getNormalizedDuration(easing: EasingDefinition): number {
  if (easing.type === "bezier") {
    return 1;
  }

  if (easing.type === "spring") {
    return findSettlingDuration(getMathFunction(easing), 1);
  }

  return 1;
}

export function evaluateAt(easing: EasingDefinition, x: number): number {
  const clampedX = clamp(x, 0, 1);

  if (easing.type === "bezier") {
    return solveForY(easing.curve, clampedX);
  }

  const normalizedDuration = getNormalizedDuration(easing);
  const mathFunction = getMathFunction(easing);
  return mathFunction(clampedX * normalizedDuration);
}

function buildDenseSamples(easing: EasingDefinition, count: number): SamplePoint[] {
  const points: SamplePoint[] = [];

  for (let index = 0; index <= count; index += 1) {
    const x = index / count;
    points.push({
      x,
      y: evaluateAt(easing, x),
    });
  }

  return points;
}

interface RdpPoint {
  t: number;
  y: number;
}

function perpendicularDistance(point: RdpPoint, start: RdpPoint, end: RdpPoint): number {
  const numerator = Math.abs(
    (end.y - start.y) * point.t - (end.t - start.t) * point.y + end.t * start.y - end.y * start.t
  );
  const denominator = Math.sqrt((end.y - start.y) ** 2 + (end.t - start.t) ** 2);
  return numerator / denominator;
}

function simplifyPoints(points: RdpPoint[], epsilon: number): RdpPoint[] {
  const stack: Array<{ startIndex: number; endIndex: number }> = [{ startIndex: 0, endIndex: points.length - 1 }];
  const keep = Array.from({ length: points.length }).fill(false);
  keep[0] = true;
  keep[points.length - 1] = true;

  while (stack.length > 0) {
    const current = stack.pop();
    if (!current) continue;

    let maxDistance = 0;
    let splitIndex = -1;
    for (let index = current.startIndex + 1; index < current.endIndex; index += 1) {
      const distance = perpendicularDistance(points[index], points[current.startIndex], points[current.endIndex]);
      if (distance > maxDistance) {
        maxDistance = distance;
        splitIndex = index;
      }
    }

    if (maxDistance > epsilon && splitIndex !== -1) {
      keep[splitIndex] = true;
      stack.push({ startIndex: current.startIndex, endIndex: splitIndex });
      stack.push({ startIndex: splitIndex, endIndex: current.endIndex });
    }
  }

  return points.filter((_, index) => keep[index]);
}

export function getSampledPoints(
  easing: EasingDefinition,
  accuracy: SamplingAccuracy = DEFAULT_ACCURACY,
  mode: "dense" | "reduced" = "reduced"
): SamplePoint[] {
  if (easing.type === "bezier") {
    return buildDenseSamples(easing, mode === "dense" ? 120 : 40);
  }

  const config = ACCURACY_CONFIG[accuracy];
  const source = buildDenseSamples(easing, config.points);
  if (mode === "dense") {
    return source;
  }

  const simplified = simplifyPoints(
    source.map((point) => ({ t: point.x, y: point.y })),
    config.epsilon
  ).map((point) => ({ x: point.t, y: point.y }));

  const first = source[0];
  const last = source[source.length - 1];

  if (simplified[0]?.x !== first.x) {
    simplified.unshift(first);
  }
  if (simplified[simplified.length - 1]?.x !== last.x) {
    simplified.push(last);
  }

  return simplified.sort((a, b) => a.x - b.x);
}

export function getPreviewSamples(easing: EasingDefinition): SamplePoint[] {
  return buildDenseSamples(easing, easing.type === "wiggle" ? 160 : 120);
}

function formatNumber(value: number, decimals: number = 3): string {
  const rounded = roundTo(value, decimals);
  if (Object.is(rounded, -0)) {
    return "0";
  }
  return rounded.toString();
}

export function getLinearEasingValue(easing: EasingDefinition, accuracy: SamplingAccuracy = DEFAULT_ACCURACY): string {
  const samples = getSampledPoints(easing, accuracy);
  const parts = samples.map((point, index) => {
    const value = formatNumber(point.y, 3);
    if (index === 0 || index === samples.length - 1) {
      return value;
    }
    return `${value} ${formatNumber(point.x * 100, 2)}%`;
  });

  return `linear(${parts.join(", ")})`;
}

export function getCssEasingValue(easing: EasingDefinition, accuracy: SamplingAccuracy = DEFAULT_ACCURACY): string {
  if (easing.type === "bezier") {
    return `cubic-bezier(${formatCubicBezier(easing.curve)})`;
  }

  return getLinearEasingValue(easing, accuracy);
}

export function getGraphBounds(easing: EasingDefinition, accuracy: SamplingAccuracy = DEFAULT_ACCURACY): {
  min: number;
  max: number;
} {
  const samples = getSampledPoints(easing, accuracy, "dense");
  const values = samples.map((point) => point.y);

  if (isProgressEasing(easing)) {
    values.push(0, 1);
  } else {
    values.push(0);
  }

  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const padding = range * 0.08 + 0.04;

  return {
    min: min - padding,
    max: max + padding,
  };
}

export function getCurrentPresetLabel(easing: EasingDefinition): string | null {
  switch (easing.type) {
    case "bezier":
      return null;
    case "spring":
      return easing.preset ? SPRING_PRESET_LABELS[easing.preset] : null;
    case "bounce":
      return easing.preset ? BOUNCE_PRESET_LABELS[easing.preset] : null;
    case "wiggle":
      return easing.preset ? WIGGLE_PRESET_LABELS[easing.preset] : null;
    case "overshoot":
      return easing.preset ? OVERSHOOT_PRESET_LABELS[easing.preset] : null;
  }
}

export function isMonotonicPathEasing(easing: EasingDefinition): boolean {
  return easing.type !== "wiggle";
}

export function getRawParams(easing: EasingDefinition): Record<string, unknown> {
  switch (easing.type) {
    case "bezier":
      return { ...easing.curve };
    case "spring":
      return {
        preset: easing.preset,
        mass: easing.mass,
        stiffness: easing.stiffness,
        damping: easing.damping,
      };
    case "bounce":
      return {
        preset: easing.preset,
        bounces: easing.bounces,
        damping: easing.damping,
      };
    case "wiggle":
      return {
        preset: easing.preset,
        wiggles: easing.wiggles,
        damping: easing.damping,
      };
    case "overshoot":
      return {
        preset: easing.preset,
        direction: easing.direction,
        mass: easing.mass,
        damping: easing.damping,
      };
  }
}

export function describeAccuracy(accuracy: SamplingAccuracy): string {
  return ACCURACY_LABELS[accuracy];
}

export function getBezierCurve(easing: EasingDefinition): BezierCurve | null {
  return easing.type === "bezier" ? easing.curve : null;
}

export function markSpringCustom(easing: SpringEasingDefinition, patch: Partial<SpringParams>): SpringEasingDefinition {
  return sanitizeEasing({ ...easing, ...patch, preset: null }) as SpringEasingDefinition;
}

export function markBounceCustom(easing: BounceEasingDefinition, patch: Partial<BounceParams>): BounceEasingDefinition {
  return sanitizeEasing({ ...easing, ...patch, preset: null }) as BounceEasingDefinition;
}

export function markWiggleCustom(easing: WiggleEasingDefinition, patch: Partial<WiggleParams>): WiggleEasingDefinition {
  return sanitizeEasing({ ...easing, ...patch, preset: null }) as WiggleEasingDefinition;
}

export function markOvershootCustom(
  easing: OvershootEasingDefinition,
  patch: Partial<OvershootParams & { direction: OvershootDirection }>
): OvershootEasingDefinition {
  return sanitizeEasing({ ...easing, ...patch, preset: null }) as OvershootEasingDefinition;
}
