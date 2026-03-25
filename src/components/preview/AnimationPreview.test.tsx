import { describe, expect, it } from "vitest";
import { progressFrame, progressLoopFrames } from "./AnimationPreview";
import { getDefaultEasing, getPreviewSamples } from "@/lib/easing";

describe("AnimationPreview helpers", () => {
  it("preserves overshoot and anticipation in sampled progress frames", () => {
    expect(progressFrame("moveX", 1.2).transform).toBe("translateX(140.00%)");
    expect(progressFrame("moveX", -0.35).transform).toBe("translateX(-170.00%)");
    expect(progressFrame("scale", 1.2).transform).toBe("scale(2.200)");
  });

  it("still keeps bounded properties valid", () => {
    expect(progressFrame("opacity", 0).opacity).toBe(1);
    expect(progressFrame("opacity", 1).opacity).toBe(0);
    expect(progressFrame("opacity", 1.4).opacity).toBe(0);
    expect(progressFrame("opacity", -0.5).opacity).toBe(1);
    expect(progressFrame("shape", -1).borderRadius).toBe("0.00%");
  });

  it("keeps the return leg reading the easing in the same direction", () => {
    const easing = getDefaultEasing("bounce");
    const duration = 400;
    const delay = 100;
    const totalDuration = duration * 2 + delay * 2;
    const endHoldEnd = (delay * 2 + duration) / totalDuration;
    const halfSample = getPreviewSamples(easing).find((sample) => sample.x === 0.5);

    expect(halfSample).toBeDefined();

    const reverseHalfFrame = progressLoopFrames("moveX", easing, duration, delay).find(
      (frame) => frame.offset === endHoldEnd + 0.5 * (duration / totalDuration)
    );

    expect(reverseHalfFrame?.transform).toBe(progressFrame("moveX", 1 - halfSample!.y).transform);
  });
});
