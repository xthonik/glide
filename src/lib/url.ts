import {
  BouncePresetName,
  EasingDefinition,
  EasingToolState,
  EasingType,
  OvershootDirection,
  OvershootPresetName,
  SamplingAccuracy,
  SpringPresetName,
  WigglePresetName,
} from "@/types";
import {
  BOUNCE_PRESETS,
  DEFAULT_ACCURACY,
  DEFAULT_DELAY,
  DEFAULT_DURATION,
  DEFAULT_BEZIER_CURVE,
  OVERSHOOT_PRESETS,
  SPRING_PRESETS,
  WIGGLE_PRESETS,
  getDefaultEasing,
  sanitizeEasing,
} from "./easing";
import { roundTo } from "./bezier";

const VALID_TYPES: EasingType[] = ["bezier", "spring", "bounce", "wiggle", "overshoot"];
const VALID_ACCURACY: SamplingAccuracy[] = ["low", "medium", "high", "ultra"];
const VALID_OVERSHOOT_DIRECTIONS: OvershootDirection[] = ["in", "out", "in-out"];
const VALID_SPRING_PRESETS = Object.keys(SPRING_PRESETS) as SpringPresetName[];
const VALID_BOUNCE_PRESETS = Object.keys(BOUNCE_PRESETS) as BouncePresetName[];
const VALID_WIGGLE_PRESETS = Object.keys(WIGGLE_PRESETS) as WigglePresetName[];
const VALID_OVERSHOOT_PRESETS = Object.keys(OVERSHOOT_PRESETS.out) as OvershootPresetName[];

function parseNumber(searchParams: URLSearchParams, key: string, fallback: number): number {
  const value = searchParams.get(key);
  if (value === null) return fallback;

  const parsed = parseFloat(value);
  return Number.isNaN(parsed) ? fallback : parsed;
}

function parseInteger(searchParams: URLSearchParams, key: string, fallback: number): number {
  const value = searchParams.get(key);
  if (value === null) return fallback;

  const parsed = parseInt(value, 10);
  return Number.isNaN(parsed) ? fallback : parsed;
}

function parseEnum<T extends string>(value: string | null, allowed: readonly T[]): T | null {
  if (value && allowed.includes(value as T)) {
    return value as T;
  }
  return null;
}

function encodeBaseParams(state: EasingToolState): URLSearchParams {
  const params = new URLSearchParams({
    type: state.easing.type,
    d: state.duration.toString(),
    dl: state.delay.toString(),
    accuracy: state.accuracy,
  });

  switch (state.easing.type) {
    case "bezier":
      params.set("x1", roundTo(state.easing.curve.x1).toString());
      params.set("y1", roundTo(state.easing.curve.y1).toString());
      params.set("x2", roundTo(state.easing.curve.x2).toString());
      params.set("y2", roundTo(state.easing.curve.y2).toString());
      break;
    case "spring":
      if (state.easing.preset) {
        params.set("springPreset", state.easing.preset);
      } else {
        params.set("springMass", roundTo(state.easing.mass, 1).toString());
        params.set("springStiffness", roundTo(state.easing.stiffness).toString());
        params.set("springDamping", roundTo(state.easing.damping).toString());
      }
      break;
    case "bounce":
      if (state.easing.preset) {
        params.set("bouncePreset", state.easing.preset);
      } else {
        params.set("bounceBounces", roundTo(state.easing.bounces).toString());
        params.set("bounceDamping", roundTo(state.easing.damping).toString());
      }
      break;
    case "wiggle":
      if (state.easing.preset) {
        params.set("wigglePreset", state.easing.preset);
      } else {
        params.set("wiggleWiggles", roundTo(state.easing.wiggles).toString());
        params.set("wiggleDamping", roundTo(state.easing.damping).toString());
      }
      break;
    case "overshoot":
      params.set("overshootDirection", state.easing.direction);
      if (state.easing.preset) {
        params.set("overshootPreset", state.easing.preset);
      } else {
        params.set("overshootMass", roundTo(state.easing.mass, 1).toString());
        params.set("overshootDamping", roundTo(state.easing.damping).toString());
      }
      break;
  }

  return params;
}

export function encodeEasingToURL(
  easing: EasingDefinition,
  duration: number,
  delay: number,
  accuracy: SamplingAccuracy
): string {
  const params = encodeBaseParams({ easing, duration, delay, accuracy });
  return `${window.location.origin}${window.location.pathname}?${params.toString()}`;
}

function decodeBezier(searchParams: URLSearchParams): EasingDefinition {
  return sanitizeEasing({
    type: "bezier",
    curve: {
      x1: parseNumber(searchParams, "x1", DEFAULT_BEZIER_CURVE.x1),
      y1: parseNumber(searchParams, "y1", DEFAULT_BEZIER_CURVE.y1),
      x2: parseNumber(searchParams, "x2", DEFAULT_BEZIER_CURVE.x2),
      y2: parseNumber(searchParams, "y2", DEFAULT_BEZIER_CURVE.y2),
    },
  });
}

function decodeSpring(searchParams: URLSearchParams): EasingDefinition {
  const preset = parseEnum(searchParams.get("springPreset"), VALID_SPRING_PRESETS);
  if (preset) {
    return { type: "spring", preset, ...SPRING_PRESETS[preset] };
  }

  const defaults = getDefaultEasing("spring");
  return sanitizeEasing({
    type: "spring",
    preset: null,
    mass: parseNumber(searchParams, "springMass", defaults.type === "spring" ? defaults.mass : 3.5),
    stiffness: parseNumber(
      searchParams,
      "springStiffness",
      defaults.type === "spring" ? defaults.stiffness : 20
    ),
    damping: parseNumber(searchParams, "springDamping", defaults.type === "spring" ? defaults.damping : 26),
  });
}

function decodeBounce(searchParams: URLSearchParams): EasingDefinition {
  const preset = parseEnum(searchParams.get("bouncePreset"), VALID_BOUNCE_PRESETS);
  if (preset) {
    return { type: "bounce", preset, ...BOUNCE_PRESETS[preset] };
  }

  const defaults = getDefaultEasing("bounce");
  return sanitizeEasing({
    type: "bounce",
    preset: null,
    bounces: parseNumber(searchParams, "bounceBounces", defaults.type === "bounce" ? defaults.bounces : 4),
    damping: parseNumber(searchParams, "bounceDamping", defaults.type === "bounce" ? defaults.damping : 60),
  });
}

function decodeWiggle(searchParams: URLSearchParams): EasingDefinition {
  const preset = parseEnum(searchParams.get("wigglePreset"), VALID_WIGGLE_PRESETS);
  if (preset) {
    return { type: "wiggle", preset, ...WIGGLE_PRESETS[preset] };
  }

  const defaults = getDefaultEasing("wiggle");
  return sanitizeEasing({
    type: "wiggle",
    preset: null,
    wiggles: parseNumber(searchParams, "wiggleWiggles", defaults.type === "wiggle" ? defaults.wiggles : 2),
    damping: parseNumber(searchParams, "wiggleDamping", defaults.type === "wiggle" ? defaults.damping : 75),
  });
}

function decodeOvershoot(searchParams: URLSearchParams): EasingDefinition {
  const direction =
    parseEnum(searchParams.get("overshootDirection"), VALID_OVERSHOOT_DIRECTIONS) ?? ("out" satisfies OvershootDirection);
  const preset = parseEnum(searchParams.get("overshootPreset"), VALID_OVERSHOOT_PRESETS);
  if (preset) {
    return { type: "overshoot", direction, preset, ...OVERSHOOT_PRESETS[direction][preset] };
  }

  const defaults = getDefaultEasing("overshoot");
  return sanitizeEasing({
    type: "overshoot",
    direction,
    preset: null,
    mass: parseNumber(searchParams, "overshootMass", defaults.type === "overshoot" ? defaults.mass : 2),
    damping: parseNumber(searchParams, "overshootDamping", defaults.type === "overshoot" ? defaults.damping : 60),
  });
}

function getDecodedType(searchParams: URLSearchParams): EasingType {
  const explicitType = parseEnum(searchParams.get("type"), VALID_TYPES);
  if (explicitType) {
    return explicitType;
  }

  const hasLegacyBezierParams = ["x1", "y1", "x2", "y2"].some((key) => searchParams.has(key));
  return hasLegacyBezierParams ? "bezier" : "bezier";
}

export function decodeEasingFromURL(searchParams: URLSearchParams): EasingToolState {
  const type = getDecodedType(searchParams);
  const accuracy = parseEnum(searchParams.get("accuracy"), VALID_ACCURACY) ?? DEFAULT_ACCURACY;
  const duration = parseInteger(searchParams, "d", DEFAULT_DURATION);
  const delay = parseInteger(searchParams, "dl", DEFAULT_DELAY);

  let easing: EasingDefinition;
  switch (type) {
    case "spring":
      easing = decodeSpring(searchParams);
      break;
    case "bounce":
      easing = decodeBounce(searchParams);
      break;
    case "wiggle":
      easing = decodeWiggle(searchParams);
      break;
    case "overshoot":
      easing = decodeOvershoot(searchParams);
      break;
    case "bezier":
    default:
      easing = decodeBezier(searchParams);
      break;
  }

  return {
    easing,
    duration,
    delay,
    accuracy,
  };
}

export function updateURLState(
  easing: EasingDefinition,
  duration: number,
  delay: number,
  accuracy: SamplingAccuracy
): void {
  const params = encodeBaseParams({ easing, duration, delay, accuracy });
  window.history.replaceState(null, "", `?${params.toString()}`);
}
