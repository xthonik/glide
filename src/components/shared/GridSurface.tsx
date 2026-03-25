"use client";

import type { CSSProperties, ReactNode } from "react";

export const GRID_LINE_COLOR = "#12151A";

interface GridSurfaceProps {
  children: ReactNode;
  cellSize?: string;
  className?: string;
  style?: CSSProperties;
}

export default function GridSurface({
  children,
  cellSize = "12.5%",
  className,
  style,
}: GridSurfaceProps) {
  const gridStyle = {
    backgroundImage: `
      linear-gradient(to right, ${GRID_LINE_COLOR} 1px, transparent 1px),
      linear-gradient(to bottom, ${GRID_LINE_COLOR} 1px, transparent 1px)
    `,
    backgroundPosition: "0 0, 0 0",
    backgroundSize: `${cellSize} 100%, 100% ${cellSize}`,
    boxShadow: `inset 0 0 0 1px ${GRID_LINE_COLOR}`,
    "--preview-grid-cell": cellSize,
    ...style,
  } satisfies CSSProperties & { "--preview-grid-cell": string };

  return (
    <div className={className} style={gridStyle}>
      {children}
    </div>
  );
}
