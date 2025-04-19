import React from 'react';

interface InteractiveStarRatingProps {
  rating: number;
  onRate: (rating: number) => void;
}

const starPath =
  "M9.049 2.927C9.317 2.293 9.883 2 10.5 2c.617 0 1.183.293 1.451.927l1.602 3.254a1 1 0 00.762.548l3.42.497a1 1 0 01.555 1.706l-2.475 2.413a1 1 0 00-.287.888l.584 3.412a1 1 0 01-1.45 1.054L10.5 15.347l-3.062 1.612a1 1 0 01-1.45-1.054l.584-3.412a1 1 0 00-.287-.888L3.83 9.982a1 1 0 01.555-1.706l3.42-.497a1 1 0 00.762-.548l1.602-3.254z";

const InteractiveStarRating: React.FC<InteractiveStarRatingProps> = ({ rating, onRate }) => {
  return (
    <div className="flex">
      {[1, 2, 3, 4, 5].map((star) => {
        const fillPercentage = Math.max(0, Math.min(1, rating - (star - 1)));
        
        return (
          <button
            key={star}
            onClick={() => onRate(star)}
            className="relative focus:outline-none"
            aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
          >
            <svg
              className="w-6 h-6"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              {fillPercentage > 0 && (
                <defs>
                  <clipPath id={`clip-star-${star}`} clipPathUnits="userSpaceOnUse">
                    <rect x="0" y="0" width={fillPercentage * 20} height="20" />
                  </clipPath>
                  <linearGradient id={`gradient-${star}`} x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#f59e0b" /> {/* Amber-500 */}
                    <stop offset="100%" stopColor="#fcd34d" /> {/* Amber-300 */}
                  </linearGradient>
                </defs>
              )}
              
              {fillPercentage > 0 && (
                <path
                  d={starPath}
                  fill={`url(#gradient-${star})`}
                  clipPath={`url(#clip-star-${star})`}
                />
              )}
              
              <path
                d={starPath}
                fill="none"
                stroke="currentColor"
                strokeWidth={1}
                className="text-gray-400"
              />
            </svg>
          </button>
        );
      })}
    </div>
  );
};

export default InteractiveStarRating;