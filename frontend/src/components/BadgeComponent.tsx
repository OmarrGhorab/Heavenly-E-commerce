import { useEffect, useState, useMemo } from 'react';
import { Badge } from './ui/Badge';
import { Timer } from 'lucide-react';
import { cn } from '@/lib/utils';

// Type definitions
interface TimeBadgeProps {
  date?: Date | string | number;
  className?: string;
}

interface SaleBadgeProps extends TimeBadgeProps {
  discount: number;
  isActive: boolean;
}

// Custom hook for time management
const useTimer = (targetDate?: Date | string | number) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  const validTarget = useMemo(() => {
    if (!targetDate) return null;
    const date = new Date(targetDate);
    return isNaN(date.getTime()) ? null : date;
  }, [targetDate]);

  useEffect(() => {
    if (!validTarget) return;
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, [validTarget]);

  return { currentTime, validTarget };
};

// Time formatting utility
const formatTimeLeft = (endDate: Date, currentTime: Date): string | null => {
  const diff = endDate.getTime() - currentTime.getTime();
  if (diff <= 0) return null;

  const timeUnits = [
    { value: Math.floor(diff / 86400000), label: 'd' },
    { value: Math.floor((diff % 86400000) / 3600000), label: 'h' },
    { value: Math.floor((diff % 3600000) / 60000), label: 'm' },
    { value: Math.floor((diff % 60000) / 1000), label: 's' },
  ].filter(unit => unit.value > 0);

  return timeUnits.slice(0, 2).map(unit => `${unit.value}${unit.label}`).join(' ') + ' left';
};

// Badge container styles
const badgeContainerClasses = "absolute top-4 left-4 flex flex-col gap-2 z-10";
const baseBadgeClasses = "px-3 py-1.5 text-sm font-medium shadow-lg rounded-lg";

// Sale Badge Component
export const SaleBadge = ({ discount, isActive, date, className }: SaleBadgeProps) => {
  const { currentTime, validTarget } = useTimer(date);
  const timeLeft = useMemo(() => validTarget ? formatTimeLeft(validTarget, currentTime) : null, [validTarget, currentTime]);

  if (!isActive) return null;

  return (
    <div className={badgeContainerClasses} role="status" aria-live="polite">
      <Badge
        variant="destructive"
        className={cn(baseBadgeClasses, 'animate-bounce hover:scale-105 bg-red-600 text-white', className)}
        aria-label={`${discount}% discount active`}
      >
        {discount}% OFF
      </Badge>
      {timeLeft && (
        <Badge
          variant="secondary"
          className={cn(baseBadgeClasses, 'bg-gray-800 text-white flex items-center', 'hover:bg-gray-700 transition-colors')}
          aria-label={`Time remaining: ${timeLeft}`}
        >
          <Timer size={14} className="mr-1.5" aria-hidden="true" />
          {timeLeft}
        </Badge>
      )}
    </div>
  );
};

// Coming Soon Badge Component
export const ComingSoonBadge = ({ date }: TimeBadgeProps) => {
  const { currentTime, validTarget } = useTimer(date);
  if (!validTarget) return null;

  const diffDays = (validTarget.getTime() - currentTime.getTime()) / 86400000;
  if (diffDays > 2 || diffDays <= 0) return null;

  return (
    <div className={badgeContainerClasses} role="status" aria-live="polite">
      <Badge
        variant="secondary"
        className={cn(baseBadgeClasses, 'bg-yellow-500 text-black animate-pulse hover:scale-105')}
        aria-label="Sale starting soon"
      >
        Starting Soon
      </Badge>
    </div>
  );
};

// Sale Ended Badge Component
export const SaleEndedBadge = ({ date }: TimeBadgeProps) => {
  const { currentTime, validTarget } = useTimer(date);
  if (!validTarget || currentTime < validTarget) return null;

  return (
    <div className={badgeContainerClasses} role="status" aria-live="polite">
      <Badge
        variant="secondary"
        className={cn(baseBadgeClasses, 'bg-gray-500 text-white hover:bg-gray-400')}
        aria-label="Sale ended"
      >
        Sale Ended
      </Badge>
    </div>
  );
};
