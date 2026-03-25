"use client";

import { useCallback, useRef } from "react";

interface UseDragOptions {
  onDrag: (x: number, y: number) => void;
  onDragEnd?: () => void;
}

export function useDrag({ onDrag, onDragEnd }: UseDragOptions) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const isDragging = useRef(false);

  const getPosition = useCallback(
    (e: PointerEvent | React.PointerEvent) => {
      const svg = svgRef.current;
      if (!svg) return null;

      const ctm = svg.getScreenCTM();
      if (!ctm) return null;

      const inverse = ctm.inverse();
      const point = svg.createSVGPoint();
      point.x = e.clientX;
      point.y = e.clientY;
      const svgPoint = point.matrixTransform(inverse);

      // Convert from SVG coords (Y-flipped) to math coords
      return { x: svgPoint.x, y: 1 - svgPoint.y };
    },
    []
  );

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault();
      e.stopPropagation();
      isDragging.current = true;
      (e.target as Element).setPointerCapture(e.pointerId);
    },
    []
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isDragging.current) return;
      const pos = getPosition(e);
      if (pos) onDrag(pos.x, pos.y);
    },
    [getPosition, onDrag]
  );

  const handlePointerUp = useCallback(
    () => {
      isDragging.current = false;
      onDragEnd?.();
    },
    [onDragEnd]
  );

  return {
    svgRef,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
  };
}
