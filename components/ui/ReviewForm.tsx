'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Props {
  movieId: number;
  initialReview?: string;
  onSave?: () => void;
  onCancel?: () => void;
}

export default function ReviewForm({
  movieId,
  initialReview = '',
  onSave,
  onCancel,
}: Props) {
  const router = useRouter();
  const [reviewText, setReviewText] = useState(initialReview);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!reviewText.trim()) return alert('Please write a review');
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/watchlist/${movieId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ review: reviewText }),
      });
      if (res.ok) {
        if (onSave) onSave();
        router.refresh();
      } else {
        alert('Failed to save review');
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mt-2 space-y-2">
      <textarea
        value={reviewText}
        onChange={(e) => setReviewText(e.target.value)}
        className="w-full px-3 py-2 rounded-lg bg-background border border-border text-white resize-y"
        rows={3}
        placeholder="Share your thoughts about this movie..."
      />
      <div className="flex gap-2">
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="btn-primary text-sm"
        >
          {isSubmitting ? 'Saving...' : 'Save Review'}
        </button>
        {onCancel && (
          <button onClick={onCancel} className="btn-outline text-sm">
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}