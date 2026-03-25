"use client";

import { useCallback, useRef } from "react";

interface ControlPointProps {
  x: number;
  y: number;
  anchorX: number;
  anchorY: number;
  strokeColor: string;
  lineColor?: string;
  glowColor?: string;
  onDrag: (x: number, y: number) => void;
  svgRef: React.RefObject<SVGSVGElement | null>;
}

export default function ControlPoint({
  x,
  y,
  anchorX,
  anchorY,
  strokeColor,
  lineColor,
  glowColor,
  onDrag,
  svgRef,
}: ControlPointProps) {
  const isDragging = useRef(false);

  const svgX = x;
  const svgY = 1 - y;
  const svgAnchorX = anchorX;
  const svgAnchorY = 1 - anchorY;

  const getPosition = useCallback(
    (e: React.PointerEvent) => {
      const svg = svgRef.current;
      if (!svg) return null;
      const ctm = svg.getScreenCTM();
      if (!ctm) return null;
      const point = svg.createSVGPoint();
      point.x = e.clientX;
      point.y = e.clientY;
      const svgPoint = point.matrixTransform(ctm.inverse());
      return { x: svgPoint.x, y: 1 - svgPoint.y };
    },
    [svgRef]
  );

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault();
      e.stopPropagation();
      isDragging.current = true;
      (e.target as Element).setPointerCapture(e.pointerId);
    },
    []
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isDragging.current) return;
      const pos = getPosition(e);
      if (pos) onDrag(pos.x, pos.y);
    },
    [getPosition, onDrag]
  );

  const onPointerUp = useCallback(() => {
    isDragging.current = false;
  }, []);

  return (
    <g>
      {/* Control arm line */}
      <line
        x1={svgAnchorX}
        y1={svgAnchorY}
        x2={svgX}
        y2={svgY}
        stroke={lineColor ?? strokeColor}
        strokeWidth={0.006}
        opacity={0.72}
      />
      <circle
        cx={svgX}
        cy={svgY}
        r={0.06}
        fill={glowColor ?? strokeColor}
        opacity={0.18}
      />
      <circle
        cx={svgX}
        cy={svgY}
        r={0.028}
        fill="#080808"
        stroke={strokeColor}
        strokeWidth={0.009}
        cursor="grab"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        style={{ touchAction: "none" }}
      />
    </g>
  );
}
