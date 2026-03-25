"use client";

const types = [
  { label: "Bezier", active: true },
  { label: "Spring", active: false },
  { label: "Bounce", active: false },
  { label: "Wiggle", active: false },
  { label: "Overshoot", active: false },
];

export default function CurveTypeSelector() {
  return (
    <div className="flex w-full justify-center overflow-x-auto">
      <div className="mx-auto flex h-full min-w-max gap-1 rounded-[12px] border border-border bg-bg p-[5px]">
        {types.map((t) => (
          <button
            key={t.label}
            disabled={!t.active}
            className={`flex h-full shrink-0 items-center justify-center rounded-[8px] px-5 text-[12px] font-semibold uppercase tracking-[0.05em] transition-colors ${
              t.active
                ? "bg-accent text-white shadow-[0_0_12px_rgba(26,123,235,0.3)]"
                : "cursor-not-allowed text-text-secondary"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
    </div>
  );
}
