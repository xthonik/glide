export interface BezierCurve {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
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
