import { Preset } from "@/types";

export const presets: Preset[] = [
  // Standard
  { name: "linear", category: "standard", direction: "none", curve: { x1: 0, y1: 0, x2: 1, y2: 1 } },
  { name: "ease", category: "standard", direction: "none", curve: { x1: 0.25, y1: 0.1, x2: 0.25, y2: 1 } },
  { name: "ease-in", category: "standard", direction: "in", curve: { x1: 0.42, y1: 0, x2: 1, y2: 1 } },
  { name: "ease-out", category: "standard", direction: "out", curve: { x1: 0, y1: 0, x2: 0.58, y2: 1 } },
  { name: "ease-in-out", category: "standard", direction: "in-out", curve: { x1: 0.42, y1: 0, x2: 0.58, y2: 1 } },

  // Quad
  { name: "In Quad", category: "quad", direction: "in", curve: { x1: 0.55, y1: 0.085, x2: 0.68, y2: 0.53 } },
  { name: "Out Quad", category: "quad", direction: "out", curve: { x1: 0.25, y1: 0.46, x2: 0.45, y2: 0.94 } },
  { name: "In-Out Quad", category: "quad", direction: "in-out", curve: { x1: 0.455, y1: 0.03, x2: 0.515, y2: 0.955 } },

  // Cubic
  { name: "In Cubic", category: "cubic", direction: "in", curve: { x1: 0.55, y1: 0.055, x2: 0.675, y2: 0.19 } },
  { name: "Out Cubic", category: "cubic", direction: "out", curve: { x1: 0.215, y1: 0.61, x2: 0.355, y2: 1 } },
  { name: "In-Out Cubic", category: "cubic", direction: "in-out", curve: { x1: 0.645, y1: 0.045, x2: 0.355, y2: 1 } },

  // Quart
  { name: "In Quart", category: "quart", direction: "in", curve: { x1: 0.895, y1: 0.03, x2: 0.685, y2: 0.22 } },
  { name: "Out Quart", category: "quart", direction: "out", curve: { x1: 0.165, y1: 0.84, x2: 0.44, y2: 1 } },
  { name: "In-Out Quart", category: "quart", direction: "in-out", curve: { x1: 0.77, y1: 0, x2: 0.175, y2: 1 } },

  // Quint
  { name: "In Quint", category: "quint", direction: "in", curve: { x1: 0.755, y1: 0.05, x2: 0.855, y2: 0.06 } },
  { name: "Out Quint", category: "quint", direction: "out", curve: { x1: 0.23, y1: 1, x2: 0.32, y2: 1 } },
  { name: "In-Out Quint", category: "quint", direction: "in-out", curve: { x1: 0.86, y1: 0, x2: 0.07, y2: 1 } },

  // Expo
  { name: "In Expo", category: "expo", direction: "in", curve: { x1: 0.95, y1: 0.05, x2: 0.795, y2: 0.035 } },
  { name: "Out Expo", category: "expo", direction: "out", curve: { x1: 0.19, y1: 1, x2: 0.22, y2: 1 } },
  { name: "In-Out Expo", category: "expo", direction: "in-out", curve: { x1: 1, y1: 0, x2: 0, y2: 1 } },

  // Circ
  { name: "In Circ", category: "circ", direction: "in", curve: { x1: 0.6, y1: 0.04, x2: 0.98, y2: 0.335 } },
  { name: "Out Circ", category: "circ", direction: "out", curve: { x1: 0.075, y1: 0.82, x2: 0.165, y2: 1 } },
  { name: "In-Out Circ", category: "circ", direction: "in-out", curve: { x1: 0.785, y1: 0.135, x2: 0.15, y2: 0.86 } },

  // Custom named
  { name: "Anticipate", category: "custom", direction: "in", curve: { x1: 0.36, y1: 0, x2: 0.66, y2: -0.56 } },
  { name: "Quick Out", category: "custom", direction: "out", curve: { x1: 0.14, y1: 1, x2: 0.34, y2: 1 } },
  { name: "Overshoot Out", category: "custom", direction: "out", curve: { x1: 0.34, y1: 1.56, x2: 0.64, y2: 1 } },
  { name: "Swift Out", category: "custom", direction: "out", curve: { x1: 0.55, y1: 0, x2: 0.1, y2: 1 } },
  { name: "Snappy Out", category: "custom", direction: "out", curve: { x1: 0.16, y1: 1, x2: 0.3, y2: 1 } },
];
