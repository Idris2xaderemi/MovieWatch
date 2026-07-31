// 'use client';

// import { useState } from 'react';
// import { useSession } from 'next-auth/react';

// export default function RatingStars({ movieId, initialRating }: { movieId: number; initialRating: number }) {
//   const { data: session } = useSession();
//   const [rating, setRating] = useState(initialRating || 0);
//   const [hover, setHover] = useState(0);

//   const updateRating = async (value: number) => {
//     if (!session) return alert('Sign in to rate');
//     setRating(value);
//     try {
//       await fetch(`/api/watchlist/${movieId}`, {
//         method: 'PATCH',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ rating: value }),
//       });
//     } catch (error) {
//       console.error(error);
//     }
//   };

//   return (
//     <div className="flex gap-1">
//       {[1, 2, 3, 4, 5, 6, 7].map((star) => (
//         <span
//           key={star}
//           className={`text-2xl cursor-pointer transition ${star <= (hover || rating) ? 'text-yellow-400' : 'text-gray-600'}`}
//           onClick={() => updateRating(star)}
//           onMouseEnter={() => setHover(star)}
//           onMouseLeave={() => setHover(0)}
//         >
//           ★
//         </span>
//       ))}
//     </div>
//   );
// }





'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';

interface Props {
  movieId: number;
  initialRating: number;
  maxRating?: number; // default 7
  onRatingChange?: (rating: number) => void;
}

export default function RatingStars({
  movieId,
  initialRating,
  maxRating = 7,
  onRatingChange,
}: Props) {
  const { data: session } = useSession();
  const [rating, setRating] = useState(initialRating || 0);
  const [hover, setHover] = useState(0);

  const updateRating = async (value: number) => {
    if (!session) return alert('Sign in to rate');
    setRating(value);
    if (onRatingChange) {
      onRatingChange(value);
    } else {
      // default: update via API
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