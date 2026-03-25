export interface BezierCurve {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export interface SamplePoint {
  x: number;
  y: number;
}

export interface Preset {
  name: string;
  category: PresetCategory;
  direction: PresetDirection;
  curve: BezierCurve;
}

export type PresetCategory =
  | "standard"
  | "quad"
  | "cubic"
  | "quart"
  | "quint"
  | "expo"
  | "circ"
  | "custom";

export type PresetDirection = "in" | "out" | "in-out" | "none";

export type EasingType = "bezier" | "spring" | "bounce" | "wiggle" | "overshoot";

export type SamplingAccuracy = "low" | "medium" | "high" | "ultra";

export type SpringPresetName =
  | "heavy"
  | "bouncy"
  | "drop"
  | "glide"
  | "snap"
  | "lazy"
  | "elastic";

export type BouncePresetName =
  | "firm"
  | "soft"
  | "sharp"
  | "subtle"
  | "playful"
  | "springy";

export type WigglePresetName =
  | "subtle"
  | "energetic"
  | "playful"
  | "sharp"
  | "smooth"
  | "intense"
  | "dynamic";

export type OvershootPresetName = "soft" | "firm" | "smooth" | "dynamic" | "dramatic";

export type OvershootDirection = "in" | "out" | "in-out";

export interface BezierEasingDefinition {
  type: "bezier";
  curve: BezierCurve;
}

export interface SpringEasingDefinition {
  type: "spring";
  preset: SpringPresetName | null;
  mass: number;
  stiffness: number;
  damping: number;
}

export interface BounceEasingDefinition {
  type: "bounce";
  preset: BouncePresetName | null;
  bounces: number;
  damping: number;
}

export interface WiggleEasingDefinition {
  type: "wiggle";
  preset: WigglePresetName | null;
  wiggles: number;
  damping: number;
}

export interface OvershootEasingDefinition {
  type: "overshoot";
  preset: OvershootPresetName | null;
  direction: OvershootDirection;
  mass: number;
  damping: number;
}

export type EasingDefinition =
  | BezierEasingDefinition
  | SpringEasingDefinition
  | BounceEasingDefinition
  | WiggleEasingDefinition
  | OvershootEasingDefinition;

export interface EasingToolState {
  easing: EasingDefinition;
  duration: number;
  delay: number;
  accuracy: SamplingAccuracy;
}

export type AnimationProperty =
  | "moveX"
  | "moveY"
  | "width"
  | "height"
  | "scale"
  | "rotate"
  | "opacity"
  | "rotateX"
  | "rotateY"
  | "shape";

export type Platform =
  | "css"
  | "swiftui"
  | "uikit"
  | "coreAnimation"
  | "compose"
  | "androidView"
  | "raw";

export interface GeneratedSnippet {
  code: string;
  note?: string;
}
