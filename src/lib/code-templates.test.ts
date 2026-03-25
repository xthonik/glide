import { describe, expect, it } from "vitest";
import { codeGenerators } from "./code-templates";
import { getDefaultEasing } from "./easing";

describe("code generators", () => {
  it("keeps raw export snapshots stable for preset easings", () => {
    const presetCases = [
      getDefaultEasing("bezier"),
      getDefaultEasing("spring"),
      getDefaultEasing("bounce"),
      getDefaultEasing("wiggle"),
      getDefaultEasing("overshoot"),
    ];

    for (const easing of presetCases) {
      expect(codeGenerators.raw(easing, 400, "high").code).toMatchSnapshot();
    }
  });

  it("keeps raw export snapshots stable for custom easings", () => {
    const customCases = [
      { type: "bezier" as const, curve: { x1: 0.16, y1: 1, x2: 0.3, y2: 1 } },
      { type: "spring" as const, preset: null, mass: 4.4, stiffness: 65, damping: 38 },
      { type: "bounce" as const, preset: null, bounces: 7, damping: 24 },
      { type: "wiggle" as const, preset: null, wiggles: 5, damping: 41 },
      { type: "overshoot" as const, preset: null, direction: "in-out" as const, mass: 4.2, damping: 18 },
    ];

    for (const easing of customCases) {
      expect(codeGenerators.raw(easing, 900, "ultra").code).toMatchSnapshot();
    }
  });

  it("marks wiggle exporters as additive where required", () => {
    expect(codeGenerators.css(getDefaultEasing("wiggle"), 400, "medium").note).toContain("additive");
    expect(codeGenerators.compose(getDefaultEasing("wiggle"), 400, "medium").note).toContain("keyframes");
    expect(codeGenerators.androidView(getDefaultEasing("wiggle"), 400, "medium").note).toContain(
      "TimeInterpolator"
    );
  });

  it("exports wiggle CSS as additive keyframes", () => {
    const snippet = codeGenerators.css(getDefaultEasing("wiggle"), 400, "medium");

    expect(snippet.code).toContain("@keyframes wiggleOffset");
    expect(snippet.code).toContain("animation: wiggleOffset 400ms linear 1 both;");
    expect(snippet.code).not.toContain("transition-timing-function");
    expect(snippet.code).not.toContain("delay");
  });

  it("omits delay from non-wiggle CSS and raw exports", () => {
    const cssSnippet = codeGenerators.css(getDefaultEasing("bezier"), 400, "medium");
    const rawSnippet = codeGenerators.raw(getDefaultEasing("spring"), 400, "medium");

    expect(cssSnippet.code).not.toContain("transition-delay");
    expect(rawSnippet.code).not.toContain('"delay"');
  });

  it("scales sampled Apple keyframes with placeholder ranges", () => {
    const overshootSnippet = codeGenerators.uikit(getDefaultEasing("overshoot"), 400, "medium").code;
    const wiggleSnippet = codeGenerators.coreAnimation(getDefaultEasing("wiggle"), 400, "medium").code;

    expect(overshootSnippet).toContain("let fromValue: CGFloat = 0");
    expect(overshootSnippet).toContain("toValue - fromValue");
    expect(wiggleSnippet).toContain("let amplitude: CGFloat = 32");
    expect(wiggleSnippet).toContain('CAKeyframeAnimation(keyPath: "transform.translation.x")');
  });

  it("uses native spring snippets on Apple platforms", () => {
    expect(codeGenerators.swiftui(getDefaultEasing("spring"), 400, "medium").code).toContain(
      "Animation.interpolatingSpring"
    );
    expect(codeGenerators.uikit(getDefaultEasing("spring"), 400, "medium").code).toContain(
      "UISpringTimingParameters"
    );
    expect(codeGenerators.coreAnimation(getDefaultEasing("spring"), 400, "medium").code).toContain(
      "CASpringAnimation"
    );
  });
});
