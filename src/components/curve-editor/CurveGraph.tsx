"use client";

import { useMemo, useRef } from "react";
import { EasingDefinition, SamplingAccuracy } from "@/types";
import { formatSvgNumber, generateSVGPath } from "@/lib/bezier";
import { getGraphBounds, getPreviewSamples } from "@/lib/easing";
import GridSurface from "@/components/shared/GridSurface";
import ControlPoint from "./ControlPoint";

interface CurveGraphProps {
  easing: EasingDefinition;
  accuracy: SamplingAccuracy;
  onControlPointDrag: (point: "p1" | "p2", x: number, y: number) => void;
}

function toGraphY(value: number, min: number, max: number, invert: boolean): number {
  const range = max - min || 1;
  const normalized = (value - min) / range;
  return invert ? normalized : 1 - normalized;
}

function buildSamplePath(easing: EasingDefinition, accuracy: SamplingAccuracy): string {
  const samples = getPreviewSamples(easing);
  const bounds = getGraphBounds(easing, accuracy);
  const invert = easing.type === "bounce";

  return samples
    .map((point, index) => {
      const y = toGraphY(point.y, bounds.min, bounds.max, invert);
      return `${index === 0 ? "M" : "L"} ${formatSvgNumber(point.x)},${formatSvgNumber(y)}`;
    })
    .join(" ");
}

export default function CurveGraph({ easing, accuracy, onControlPointDrag }: CurveGraphProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const samplePath = useMemo(() => buildSamplePath(easing, accuracy), [accuracy, easing]);

  return (
    <GridSurface className="relative mx-auto flex aspect-square w-full max-w-[331px] items-center justify-center overflow-visible">
      <svg
        ref={svgRef}
        viewBox="0 0 1 1"
        className="aspect-square h-full w-full"
        style={{ touchAction: easing.type === "bezier" ? "none" : "auto", overflow: "visible" }}
      >
        <defs>
          <linearGradient id="curveGradient" x1="0" y1="1" x2="1" y2="0">
            <stop offset="0%" stopColor="#2b8cff" />
            <stop offset="100%" stopColor="#ffffff" />
          </linearGradient>
          <filter id="curveGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="0.07" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <path
          d={easing.type === "bezier" ? generateSVGPath(easing.curve) : samplePath}
          fill="none"
          stroke="url(#curveGradient)"
          strokeWidth={0.014}
          strokeLinecap="round"
          filter="url(#curveGlow)"
        />

        {easing.type === "bezier" && (
          <>
            <ControlPoint
              x={easing.curve.x1}
              y={easing.curve.y1}
              anchorX={0}
              anchorY={0}
              strokeColor="#1a7beb"
              glowColor="rgba(26, 123, 235, 0.3)"
              onDrag={(x, y) => onControlPointDrag("p1", x, y)}
              svgRef={svgRef}
            />

            <ControlPoint
              x={easing.curve.x2}
              y={easing.curve.y2}
              anchorX={1}
              anchorY={1}
              strokeColor="#ffffff"
              lineColor="rgba(255, 255, 255, 0.8)"
              glowColor="rgba(255, 255, 255, 0.16)"
              onDrag={(x, y) => onControlPointDrag("p2", x, y)}
              svgRef={svgRef}
            />
          </>
        )}
      </svg>
    </GridSurface>
  );
}
