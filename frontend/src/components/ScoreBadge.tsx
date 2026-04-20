/**
 * Score badge with encouraging labels.
 */

interface ScoreBadgeProps {
  score: number;
  maxScore: number;
  size?: "sm" | "md" | "lg";
}

function getScoreLabel(score: number, maxScore: number): string {
  const pct = (score / maxScore) * 100;
  if (pct >= 80) return "Excellent !";
  if (pct >= 60) return "Très bien !";
  if (pct >= 40) return "En bonne voie";
  if (pct >= 20) return "On progresse !";
  return "On s'accroche !";
}

function getScoreStyle(score: number, maxScore: number): string {
  const pct = (score / maxScore) * 100;
  if (pct >= 70) return "score-excellent";
  if (pct >= 40) return "score-good";
  return "score-needs-work";
}

export default function ScoreBadge({
  score,
  maxScore,
  size = "md",
}: ScoreBadgeProps) {
  const label = getScoreLabel(score, maxScore);
  const style = getScoreStyle(score, maxScore);

  const sizeStyles = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-5 py-3 text-base",
  };

  return (
    <div
      className={`inline-flex items-center gap-2 rounded-lg font-medium ${style} ${sizeStyles[size]}`}
    >
      <span className="text-xl font-semibold">{score}</span>
      <span className="opacity-70">/{maxScore}</span>
      <span className="ml-1">{label}</span>
    </div>
  );
}
