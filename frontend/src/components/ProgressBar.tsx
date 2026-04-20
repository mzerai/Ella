/**
 * Warm progress bar with score-based coloring.
 */

interface ProgressBarProps {
  value: number; // 0-100
  className?: string;
}

export default function ProgressBar({
  value,
  className = "",
}: ProgressBarProps) {
  const clampedValue = Math.min(100, Math.max(0, value));

  const getColor = () => {
    if (clampedValue >= 70) return "bg-ella-teal-400";
    if (clampedValue >= 40) return "bg-ella-amber-400";
    return "bg-ella-coral-400";
  };

  return (
    <div className={`progress-bar ${className}`}>
      <div
        className={`progress-bar-fill ${getColor()}`}
        style={{ width: `${clampedValue}%` }}
      />
    </div>
  );
}
