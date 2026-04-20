/**
 * Lab card for the course page — shows title, description, progress.
 */

import Link from "next/link";
import ProgressBar from "./ProgressBar";

interface LabCardProps {
  number: string;
  title: string;
  description: string;
  progress: number;  // 0-100
  href: string;
  locked?: boolean;
}

export default function LabCard({
  number,
  title,
  description,
  progress,
  href,
  locked = false,
}: LabCardProps) {
  const card = (
    <div
      className={`ella-card ${locked ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
    >
      <div className="flex items-center gap-3 mb-3">
        <div
          className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-medium ${
            locked
              ? "bg-ella-gray-200 text-ella-gray-500"
              : "bg-ella-amber-100 text-ella-amber-800"
          }`}
        >
          {number}
        </div>
        <h3 className="font-body font-medium text-base">{title}</h3>
      </div>
      <p className="text-sm text-ella-gray-700 mb-4 leading-relaxed">
        {description}
      </p>
      <div className="flex items-center gap-2">
        <ProgressBar value={progress} className="flex-1" />
        <span
          className={`text-xs font-medium ${
            locked ? "text-ella-gray-500" : progress > 0 ? "text-ella-teal-600" : "text-ella-gray-500"
          }`}
        >
          {locked ? "Verrouillé" : `${progress}%`}
        </span>
      </div>
    </div>
  );

  if (locked) return card;
  return <Link href={href}>{card}</Link>;
}
