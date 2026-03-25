import { BezierCurve, Platform } from "@/types";
import { roundTo } from "./bezier";

function r(v: number): string {
  return roundTo(v, 2).toString();
}

function rf(v: number): string {
  return roundTo(v, 2) + "f";
}

function durationSec(ms: number): string {
  return roundTo(ms / 1000, 2).toString();
}

export const codeGenerators: Record<Platform, (c: BezierCurve, durationMs: number) => string> = {
  css: (c, d) =>
    `transition-timing-function: cubic-bezier(${r(c.x1)}, ${r(c.y1)}, ${r(c.x2)}, ${r(c.y2)});
transition-duration: ${d}ms;`,

  swiftui: (c, d) =>
    `Animation.timingCurve(${r(c.x1)}, ${r(c.y1)}, ${r(c.x2)}, ${r(c.y2)}, duration: ${durationSec(d)})`,

  uikit: (c, d) =>
    `let cubicTiming = UICubicTimingParameters(
    controlPoint1: CGPoint(x: ${r(c.x1)}, y: ${r(c.y1)}),
    controlPoint2: CGPoint(x: ${r(c.x2)}, y: ${r(c.y2)})
)
let animator = UIViewPropertyAnimator(
    duration: ${durationSec(d)},
    timingParameters: cubicTiming
)`,

  coreAnimation: (c, d) =>
    `let animation = CABasicAnimation(keyPath: "position")
animation.timingFunction = CAMediaTimingFunction(
    controlPoints: ${r(c.x1)}, ${r(c.y1)}, ${r(c.x2)}, ${r(c.y2)}
)
animation.duration = ${durationSec(d)}`,

  compose: (c, d) =>
    `val easing = CubicBezierEasing(${rf(c.x1)}, ${rf(c.y1)}, ${rf(c.x2)}, ${rf(c.y2)})

animateFloatAsState(
    targetValue = targetValue,
    animationSpec = tween(
        durationMillis = ${d},
        easing = easing
    )
)`,

  androidView: (c, d) =>
    `val interpolator = PathInterpolator(${rf(c.x1)}, ${rf(c.y1)}, ${rf(c.x2)}, ${rf(c.y2)})

ObjectAnimator.ofFloat(view, "translationX", targetValue).apply {
    duration = ${d}L
    this.interpolator = interpolator
    start()
}`,

  raw: (c) =>
    `${r(c.x1)}, ${r(c.y1)}, ${r(c.x2)}, ${r(c.y2)}`,
};

export const platformLabels: Record<Platform, string> = {
  css: "CSS",
  swiftui: "SwiftUI",
  uikit: "UIKit",
  coreAnimation: "Core Animation",
  compose: "Compose",
  androidView: "Android View",
  raw: "Raw",
};
