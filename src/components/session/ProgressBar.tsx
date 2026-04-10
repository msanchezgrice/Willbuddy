'use client';

interface ProgressBarProps {
  completed: number;
  total: number;
}

export default function ProgressBar({ completed, total }: ProgressBarProps) {
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="w-full">
      <div className="h-1 w-full rounded-full bg-[#E8E0D6]">
        <div
          className="h-1 rounded-full bg-[#5B7A5E] transition-all duration-500 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
