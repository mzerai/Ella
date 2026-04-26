"use client";

/**
 * FrozenLakeGrid — interactive grid showing V(s), Q(s,a), and policy arrows.
 * Each cell is a 3x3 CSS sub-grid:
 *   - Center: V(s)
 *   - Top: Q(s, UP=3)
 *   - Bottom: Q(s, DOWN=1)
 *   - Left: Q(s, LEFT=0)
 *   - Right: Q(s, RIGHT=2)
 * FrozenLake action mapping: 0=LEFT, 1=DOWN, 2=RIGHT, 3=UP
 */

interface FrozenLakeGridProps {
  grid: string[][];
  gridSize: number;
  V: number[];
  Q: number[][];
  policy: number[][];
}

const TILE_ICONS: Record<string, string> = {
  S: "🏠",
  F: "❄️",
  H: "🕳️",
  G: "🏆",
};

// FrozenLake actions: 0=LEFT, 1=DOWN, 2=RIGHT, 3=UP
const ACTION_LABELS = ["←", "↓", "→", "↑"];

function fmt(v: number): string {
  if (Math.abs(v) < 0.0001) return "0";
  if (Math.abs(v) >= 100) return v.toFixed(0);
  if (Math.abs(v) >= 10) return v.toFixed(1);
  return v.toFixed(3);
}

export default function FrozenLakeGrid({
  grid,
  gridSize,
  V,
  Q,
  policy,
}: FrozenLakeGridProps) {
  const vMax = Math.max(...V.map(Math.abs), 0.001);

  return (
    <div className="overflow-x-auto pb-2">
      <div
        className="inline-grid gap-1"
        style={{
          gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
        }}
      >
        {grid.flat().map((tile, idx) => {
          const row = Math.floor(idx / gridSize);
          const col = idx % gridSize;
          const s = row * gridSize + col;

          const isTerminal = tile === "H" || tile === "G";
          const vNorm = vMax > 0 ? V[s] / vMax : 0;
          const greenIntensity = Math.max(0, Math.min(1, vNorm));

          const qValues = Q[s] || [0, 0, 0, 0];
          const policyRow = policy[s] || [0.25, 0.25, 0.25, 0.25];

          // Background color: green intensity for V(s), gray for terminals
          const bgColor = isTerminal
            ? "rgb(243, 244, 246)"
            : `rgba(46, 204, 113, ${greenIntensity * 0.35})`;

          return (
            <div
              key={s}
              className={`relative border rounded-lg font-mono transition-colors ${
                isTerminal
                  ? "border-dashed border-ella-gray-300 bg-ella-gray-100"
                  : "border-ella-gray-200"
              }`}
              style={{
                backgroundColor: isTerminal ? undefined : bgColor,
                width: "clamp(80px, 12vw, 120px)",
                height: "clamp(80px, 12vw, 120px)",
              }}
            >
              {/* State label top-left */}
              <span className="absolute top-0.5 left-1 text-[8px] text-ella-gray-500 font-bold leading-none select-none">
                s{s}
              </span>

              {/* Tile icon bottom-right */}
              <span className="absolute bottom-0.5 right-1 text-[10px] leading-none select-none">
                {TILE_ICONS[tile] || tile}
                <span className="text-[7px] text-ella-gray-400">{tile}</span>
              </span>

              {/* 3x3 sub-grid for Q-values and V */}
              <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 items-center justify-items-center p-0.5">
                {/* Row 0: _, UP(3), _ */}
                <span />
                <QCell
                  value={qValues[3]}
                  label={ACTION_LABELS[3]}
                  selected={policyRow[3] > 0}
                />
                <span />

                {/* Row 1: LEFT(0), V(s), RIGHT(2) */}
                <QCell
                  value={qValues[0]}
                  label={ACTION_LABELS[0]}
                  selected={policyRow[0] > 0}
                />
                <span className="text-[10px] sm:text-xs font-bold text-ella-gray-900 leading-none text-center">
                  {fmt(V[s])}
                </span>
                <QCell
                  value={qValues[2]}
                  label={ACTION_LABELS[2]}
                  selected={policyRow[2] > 0}
                />

                {/* Row 2: _, DOWN(1), _ */}
                <span />
                <QCell
                  value={qValues[1]}
                  label={ACTION_LABELS[1]}
                  selected={policyRow[1] > 0}
                />
                <span />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function QCell({
  value,
  label,
  selected,
}: {
  value: number;
  label: string;
  selected: boolean;
}) {
  return (
    <span
      className={`text-[7px] sm:text-[8px] leading-none rounded px-0.5 text-center truncate w-full ${
        selected
          ? "bg-purple-50 text-purple-700 font-bold"
          : "text-ella-gray-500"
      }`}
      title={`${label} Q=${value.toFixed(4)}`}
    >
      {label}
      {fmt(value)}
    </span>
  );
}
