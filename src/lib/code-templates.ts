import { EasingDefinition, GeneratedSnippet, Platform, SamplePoint, SamplingAccuracy } from "@/types";
import {
  getCssEasingValue,
  getRawParams,
  getSampledPoints,
  isMonotonicPathEasing,
  isOscillationEasing,
} from "./easing";
import { formatCubicBezier, roundTo } from "./bezier";

function r(value: number, decimals: number = 2): string {
  return roundTo(value, decimals).toString();
}

function rf(value: number, decimals: number = 2): string {
  return `${roundTo(value, decimals)}f`;
}

function durationSec(milliseconds: number): string {
  return roundTo(milliseconds / 1000, 2).toString();
}

function toSwiftSamples(samples: SamplePoint[]): string {
  return samples.map((point) => `    (${r(point.x, 3)}, ${r(point.y, 3)})`).join(",\n");
}

function toSwiftScaledProgressValues(samples: SamplePoint[]): string {
  return samples
    .map((point) => `    fromValue + ((toValue - fromValue) * ${r(point.y, 3)})`)
    .join(",\n");
}

function toSwiftAmplitudeValues(samples: SamplePoint[]): string {
  return samples.map((point) => `    amplitude * ${r(point.y, 3)}`).join(",\n");
}

function toSwiftKeyTimes(samples: SamplePoint[]): string {
  return samples.map((point) => `    ${r(point.x, 3)}`).join(",\n");
}

function toKotlinPairs(samples: SamplePoint[]): string {
  return samples.map((point) => `    ${rf(point.x, 3)} to ${rf(point.y, 3)}`).join(",\n");
}

function toKotlinKeyframes(samples: SamplePoint[], duration: number): string {
  return samples
    .map((point) => `    ${rf(point.y, 3)} at ${Math.round(point.x * duration)}`)
    .join("\n");
}

function toPathLines(samples: SamplePoint[]): string {
  return samples
    .slice(1)
    .map((point) => `    lineTo(${rf(point.x, 3)}, ${rf(point.y, 3)})`)
    .join("\n");
}

function toJsonSamples(samples: SamplePoint[]): string {
  return samples.map((point) => `    { "x": ${r(point.x, 3)}, "y": ${r(point.y, 3)} }`).join(",\n");
}

function toCssWiggleKeyframes(samples: SamplePoint[]): string {
  return samples
    .map(
      (point) =>
        `  ${r(point.x * 100, 2)}% { transform: translateX(calc(var(--wiggle-amplitude, 1rem) * ${r(point.y, 3)})); }`
    )
    .join("\n");
}

function sampledSwiftHelper(samples: SamplePoint[], functionName: string): string {
  return `let samples: [(Double, Double)] = [
${toSwiftSamples(samples)}
]

func ${functionName}(_ t: Double) -> Double {
    let clamped = min(max(t, 0), 1)
    for index in 1..<samples.count {
        let previous = samples[index - 1]
        let next = samples[index]
        if clamped <= next.0 {
            let span = max(next.0 - previous.0, 0.0001)
            let localT = (clamped - previous.0) / span
            return previous.1 + (next.1 - previous.1) * localT
        }
    }
    return samples.last?.1 ?? clamped
}`;
}

function sampledComposeHelper(samples: SamplePoint[], variableName: string): string {
  return `val ${variableName} = listOf(
${toKotlinPairs(samples)}
)

fun sampleCurve(input: Float): Float {
    val clamped = input.coerceIn(0f, 1f)
    for (index in 1 until ${variableName}.size) {
        val previous = ${variableName}[index - 1]
        val next = ${variableName}[index]
        if (clamped <= next.first) {
            val span = maxOf(next.first - previous.first, 0.0001f)
            val localT = (clamped - previous.first) / span
            return previous.second + (next.second - previous.second) * localT
        }
    }
    return ${variableName}.last().second
}`;
}

function sampledAndroidHelper(samples: SamplePoint[]): string {
  return `val samples = listOf(
${toKotlinPairs(samples)}
)

val interpolator = TimeInterpolator { input ->
    val clamped = input.coerceIn(0f, 1f)
    for (index in 1 until samples.size) {
        val previous = samples[index - 1]
        val next = samples[index]
        if (clamped <= next.first) {
            val span = maxOf(next.first - previous.first, 0.0001f)
            val localT = (clamped - previous.first) / span
            return@TimeInterpolator previous.second + (next.second - previous.second) * localT
        }
    }
    samples.last().second
}`;
}

function getSamples(easing: EasingDefinition, accuracy: SamplingAccuracy): SamplePoint[] {
  return getSampledPoints(easing, accuracy);
}

function cssSnippet(easing: EasingDefinition, duration: number, accuracy: SamplingAccuracy): GeneratedSnippet {
  if (easing.type === "wiggle") {
    const samples = getSamples(easing, accuracy);

    return {
      code: `@keyframes wiggleOffset {
${toCssWiggleKeyframes(samples)}
}

animation: wiggleOffset ${duration}ms linear 1 both;`,
      note: "Wiggle is exported as additive keyframes. Apply it to a transform offset and tune `--wiggle-amplitude` for the desired strength.",
    };
  }

  const timingFunction =
    easing.type === "bezier"
      ? `cubic-bezier(${formatCubicBezier(easing.curve)})`
      : getCssEasingValue(easing, accuracy);

  return {
    code: `transition-timing-function: ${timingFunction};
transition-duration: ${duration}ms;`,
    note: isOscillationEasing(easing)
      ? "Wiggle returns to 0 and is best used as an additive oscillation, not a one-way transition."
      : undefined,
  };
}

function sampledAppleKeyframeSnippet(
  easing: Exclude<EasingDefinition, { type: "bezier" | "spring" }>,
  duration: number,
  accuracy: SamplingAccuracy
): GeneratedSnippet {
  const samples = getSamples(easing, accuracy);

  if (easing.type === "wiggle") {
    return {
      code: `let amplitude: CGFloat = 32
let animation = CAKeyframeAnimation(keyPath: "transform.translation.x")
animation.values = [
${toSwiftAmplitudeValues(samples)}
].map { NSNumber(value: Double($0)) }
animation.keyTimes = [
${toSwiftKeyTimes(samples)}
].map { NSNumber(value: $0) }
animation.duration = ${durationSec(duration)}
animation.isAdditive = true`,
      note: "Use an additive keyPath such as translation, rotation, or scale for wiggle.",
    };
  }

  return {
    code: `let fromValue: CGFloat = 0
let toValue: CGFloat = 240
let animation = CAKeyframeAnimation(keyPath: "position.x")
animation.values = [
${toSwiftScaledProgressValues(samples)}
].map { NSNumber(value: Double($0)) }
animation.keyTimes = [
${toSwiftKeyTimes(samples)}
].map { NSNumber(value: $0) }
animation.duration = ${durationSec(duration)}
animation.isAdditive = false`,
  };
}

function swiftUiSnippet(
  easing: EasingDefinition,
  duration: number,
  accuracy: SamplingAccuracy
): GeneratedSnippet {
  if (easing.type === "bezier") {
    return {
      code: `Animation.timingCurve(${r(easing.curve.x1)}, ${r(easing.curve.y1)}, ${r(
        easing.curve.x2
      )}, ${r(easing.curve.y2)}, duration: ${durationSec(duration)})`,
    };
  }

  if (easing.type === "spring") {
    return {
      code: `Animation.interpolatingSpring(
    mass: ${r(easing.mass, 1)},
    stiffness: ${r(easing.stiffness)},
    damping: ${r(easing.damping)},
    initialVelocity: 0
)`,
      note: "SwiftUI spring APIs are physical, so the visual timing can diverge slightly from the exact duration in the tool.",
    };
  }

  const samples = getSamples(easing, accuracy);
  const helperName = easing.type === "wiggle" ? "sampledOscillation" : "sampledEase";

  return {
    code: `${sampledSwiftHelper(samples, helperName)}

// Drive rawPhase with a linear animation from 0...1 over ${durationSec(duration)}s.
// For wiggle, apply the returned value as an additive offset around your resting state.`,
    note:
      easing.type === "wiggle"
        ? "SwiftUI has no native oscillation easing primitive here; export is a sampled helper for additive motion."
        : undefined,
  };
}

function uikitSnippet(
  easing: EasingDefinition,
  duration: number,
  accuracy: SamplingAccuracy
): GeneratedSnippet {
  if (easing.type === "bezier") {
    return {
      code: `let cubicTiming = UICubicTimingParameters(
    controlPoint1: CGPoint(x: ${r(easing.curve.x1)}, y: ${r(easing.curve.y1)}),
    controlPoint2: CGPoint(x: ${r(easing.curve.x2)}, y: ${r(easing.curve.y2)})
)
let animator = UIViewPropertyAnimator(
    duration: ${durationSec(duration)},
    timingParameters: cubicTiming
)`,
    };
  }

  if (easing.type === "spring") {
    return {
      code: `let springTiming = UISpringTimingParameters(
    mass: ${r(easing.mass, 1)},
    stiffness: ${r(easing.stiffness)},
    damping: ${r(easing.damping)},
    initialVelocity: CGVector(dx: 0, dy: 0)
)
let animator = UIViewPropertyAnimator(
    duration: ${durationSec(duration)},
    timingParameters: springTiming
)`,
      note: "UIKit spring timing is native but not guaranteed to settle exactly on the same frame budget as the sampled export.",
    };
  }

  return sampledAppleKeyframeSnippet(easing, duration, accuracy);
}

function coreAnimationSnippet(
  easing: EasingDefinition,
  duration: number,
  accuracy: SamplingAccuracy
): GeneratedSnippet {
  if (easing.type === "bezier") {
    return {
      code: `let animation = CABasicAnimation(keyPath: "position.x")
animation.timingFunction = CAMediaTimingFunction(
    controlPoints: ${r(easing.curve.x1)}, ${r(easing.curve.y1)}, ${r(easing.curve.x2)}, ${r(easing.curve.y2)}
)
animation.duration = ${durationSec(duration)}`,
    };
  }

  if (easing.type === "spring") {
    return {
      code: `let animation = CASpringAnimation(keyPath: "position.x")
animation.mass = ${r(easing.mass, 1)}
animation.stiffness = ${r(easing.stiffness)}
animation.damping = ${r(easing.damping)}
animation.initialVelocity = 0
animation.duration = ${durationSec(duration)}`,
      note: "CASpringAnimation is native, but its settling behavior may differ slightly from the sampled CSS export.",
    };
  }

  return sampledAppleKeyframeSnippet(easing, duration, accuracy);
}

function composeSnippet(
  easing: EasingDefinition,
  duration: number,
  accuracy: SamplingAccuracy
): GeneratedSnippet {
  if (easing.type === "bezier") {
    return {
      code: `val easing = CubicBezierEasing(${rf(easing.curve.x1)}, ${rf(easing.curve.y1)}, ${rf(
        easing.curve.x2
      )}, ${rf(easing.curve.y2)})

animateFloatAsState(
    targetValue = targetValue,
    animationSpec = tween(
        durationMillis = ${duration},
        easing = easing
    )
)`,
    };
  }

  const samples = getSamples(easing, accuracy);

  if (easing.type === "wiggle") {
    return {
      code: `val wiggleSpec = keyframes<Float> {
    durationMillis = ${duration}
${toKotlinKeyframes(samples, duration)}
}

// Use wiggleSpec for an additive value such as translation, rotation, or scale.`,
      note: "Compose Easing must map 0->0 and 1->1, so wiggle exports as sampled keyframes instead.",
    };
  }

  return {
    code: `${sampledComposeHelper(samples, "sampledCurve")}

val easing = Easing { fraction -> sampleCurve(fraction) }

animateFloatAsState(
    targetValue = targetValue,
    animationSpec = tween(
        durationMillis = ${duration},
        easing = easing
    )
)`,
  };
}

function androidViewSnippet(
  easing: EasingDefinition,
  duration: number,
  accuracy: SamplingAccuracy
): GeneratedSnippet {
  if (easing.type === "bezier") {
    return {
      code: `val interpolator = PathInterpolator(${rf(easing.curve.x1)}, ${rf(easing.curve.y1)}, ${rf(
        easing.curve.x2
      )}, ${rf(easing.curve.y2)})

ObjectAnimator.ofFloat(view, "translationX", targetValue).apply {
    duration = ${duration}L
    this.interpolator = interpolator
    start()
}`,
    };
  }

  const samples = getSamples(easing, accuracy);
  if (isMonotonicPathEasing(easing)) {
    return {
      code: `val path = Path().apply {
    moveTo(0f, 0f)
${toPathLines(samples)}
}

val interpolator = PathInterpolator(path)

ObjectAnimator.ofFloat(view, "translationX", targetValue).apply {
    duration = ${duration}L
    this.interpolator = interpolator
    start()
}`,
    };
  }

  return {
    code: `${sampledAndroidHelper(samples)}

ObjectAnimator.ofFloat(view, "translationX", 0f, targetValue).apply {
    duration = ${duration}L
    this.interpolator = interpolator
    start()
}`,
    note: "Wiggle returns to 0, so Android View export uses a sampled TimeInterpolator instead of PathInterpolator.",
  };
}

function rawSnippet(easing: EasingDefinition, duration: number, accuracy: SamplingAccuracy): GeneratedSnippet {
  const cssLinear = easing.type === "bezier" ? null : getCssEasingValue(easing, accuracy);
  const samples = easing.type === "bezier" ? [] : getSamples(easing, accuracy);

  return {
    code: `{
  "type": "${easing.type}",
  "params": ${JSON.stringify(getRawParams(easing), null, 2).replace(/\n/g, "\n  ")},
  "duration": ${duration},
  "accuracy": "${accuracy}",${
    easing.type === "bezier"
      ? `
  "rawBezier": [${r(easing.curve.x1)}, ${r(easing.curve.y1)}, ${r(easing.curve.x2)}, ${r(easing.curve.y2)}]`
      : `
  "cssLinear": "${cssLinear}",
  "samples": [
${toJsonSamples(samples)}
  ]`
  }
}`,
  };
}

export const codeGenerators: Record<
  Platform,
  (easing: EasingDefinition, durationMs: number, accuracy: SamplingAccuracy) => GeneratedSnippet
> = {
  css: cssSnippet,
  swiftui: swiftUiSnippet,
  uikit: uikitSnippet,
  coreAnimation: coreAnimationSnippet,
  compose: composeSnippet,
  androidView: androidViewSnippet,
  raw: rawSnippet,
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
