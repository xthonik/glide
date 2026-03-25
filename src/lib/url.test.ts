import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { decodeEasingFromURL, encodeEasingToURL } from "./url";
import { getDefaultEasing } from "./easing";

const windowMock = {
  location: {
    origin: "https://example.com",
    pathname: "/tool",
  },
  history: {
    replaceState: vi.fn(),
  },
};

describe("url serialization", () => {
  beforeEach(() => {
    vi.stubGlobal("window", windowMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("round-trips every easing type through query params", () => {
    const cases = [
      getDefaultEasing("bezier"),
      getDefaultEasing("spring"),
      { ...getDefaultEasing("bounce"), preset: null, bounces: 7, damping: 22 },
      getDefaultEasing("wiggle"),
      { ...getDefaultEasing("overshoot"), preset: null, direction: "in-out" as const, mass: 4.2, damping: 18 },
    ];

    for (const easing of cases) {
      const encoded = encodeEasingToURL(easing, 640, 180, "ultra");
      const url = new URL(encoded);
      const decoded = decodeEasingFromURL(url.searchParams);

      expect(decoded.duration).toBe(640);
      expect(decoded.delay).toBe(180);
      expect(decoded.accuracy).toBe("ultra");
      expect(decoded.easing).toMatchObject(easing);
    }
  });

  it("keeps legacy bezier links valid", () => {
    const decoded = decodeEasingFromURL(
      new URLSearchParams("x1=0.1&y1=0.2&x2=0.8&y2=1&d=300&dl=40")
    );

    expect(decoded.duration).toBe(300);
    expect(decoded.delay).toBe(40);
    expect(decoded.easing).toMatchObject({
      type: "bezier",
      curve: { x1: 0.1, y1: 0.2, x2: 0.8, y2: 1 },
    });
  });
});
