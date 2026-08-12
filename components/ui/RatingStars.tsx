'use client';

import { useState } from 'react';
import { Session } from 'next-auth';

interface Props {
  movieId: number;
  initialRating: number;
  maxRating?: number;
  session: Session | null; // ✅ required
  onRatingChange?: (rating: number) => void;
}

export default function RatingStars({
  movieId,
  initialRating,
  maxRating = 7,
  session,
  onRatingChange,
}: Props) {
  const [rating, setRating] = useState(initialRating || 0);
  const [hover, setHover] = useState(0);

  const updateRating = async (value: number) => {
    if (!session) {
      alert('Sign in to rate');
      return;
    }
    setRating(value);
    if (onRatingChange) {
      onRatingChange(value);
    } else {
      try {
        await fetch(`/api/watchlist/${movieId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ rating: value }),
        });
      } catch (error) {
        console.error('Failed to update rating', error);
      }
    }
  };

  return (
    <div className="flex gap-1">
      {[...Array(maxRating)].map((_, i) => {
        const starValue = i + 1;
        return (
          <span
            key={starValue}
            className={`text-2xl cursor-pointer transition ${
              starValue <= (hover || rating) ? 'text-yellow-400' : 'text-gray-600'
            }`}
            onClick={() => updateRating(starValue)}
            onMouseEnter={() => setHover(starValue)}
            onMouseLeave={() => setHover(0)}
          >
            ★
          </span>
        );
      })}
    </div>
  );
}