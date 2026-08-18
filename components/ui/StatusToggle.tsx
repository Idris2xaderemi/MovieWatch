'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession, signIn } from 'next-auth/react';
import StatusBadge from './StatusBadge';
import RatingStars from './RatingStars';
import ReviewForm from './ReviewForm';
import ConfirmModal from './ConfirmModal';

interface MovieData {
  title: string;
  posterPath: string | null;
  backdropPath: string | null;
  releaseDate: string;
  voteAverage: number;
  mediaType?: 'movie' | 'tv';
}

interface Props {
  movieId: number;
  initialStatus: 'want' | 'watching' | 'watched' | null;
  initialRating?: number;
  initialReview?: string;
  movieData: MovieData;
}

export default function StatusToggle({
  movieId,
  initialStatus,
  initialRating = 0,
  initialReview = '',
  movieData,
}: Props) {
  const { data: session } = useSession();
  const router = useRouter();
  const [status, setStatus] = useState(initialStatus || null);
  const [loading, setLoading] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [showRemoveModal, setShowRemoveModal] = useState(false);

  const statusOrder: ('want' | 'watching' | 'watched')[] = ['want', 'watching', 'watched'];

  const cycleStatus = async () => {
    if (!session) {
      signIn('google');
      return;
    }

    if (!status) {
      // Add to watchlist
      setLoading(true);
      try {
        const res = await fetch('/api/watchlist', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            movieId,
            title: movieData.title,
            posterPath: movieData.posterPath || '',
            backdropPath: movieData.backdropPath || '',
            releaseDate: movieData.releaseDate,
            voteAverage: movieData.voteAverage,
            mediaType: movieData.mediaType || 'movie',
          }),
        });
        if (res.ok) {
          setStatus('want');
          router.refresh();
        } else if (res.status === 409) {
          alert('Already in watchlist');
        } else {
          alert('Error adding movie');
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
      return;
    }

    // Cycle status
    const currentIndex = statusOrder.indexOf(status);
    const nextIndex = currentIndex + 1;

    // If we've reached the end (i.e., status is 'watched'), show modal instead of direct removal
    if (nextIndex >= statusOrder.length) {
      setShowRemoveModal(true);
      return;
    }

    // Otherwise, update to next status
    const newStatus = statusOrder[nextIndex];
    setLoading(true);
    try {
      const res = await fetch(`/api/watchlist/${movieId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setStatus(newStatus);
        if (newStatus !== 'watched') setShowReviewForm(false);
        router.refresh();
      } else {
        alert('Failed to update status');
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveConfirm = async () => {
    setShowRemoveModal(false);
    setLoading(true);
    try {
      const res = await fetch(`/api/watchlist/${movieId}`, { method: 'DELETE' });
      if (res.ok) {
        setStatus(null);
        router.refresh();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to remove from watchlist');
      }
    } catch (error) {
      console.error(error);
      alert('An error occurred while removing the item');
    } finally {
      setLoading(false);
    }
  };

  const handleRatingChange = async (newRating: number) => {
    try {
      await fetch(`/api/watchlist/${movieId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating: newRating }),
      });
      router.refresh();
    } catch (error) {
      console.error(error);
    }
  };

  const handleReviewSaved = () => {
    setShowReviewForm(false);
    router.refresh();
  };

  if (!session) {
    return (
      <button
        onClick={() => signIn('google')}
        className="btn-primary text-sm px-4 py-2 rounded-full"
      >
        Sign in to add to watchlist
      </button>
    );
  }

  if (!status) {
    return (
      <button
        onClick={cycleStatus}
        disabled={loading}
        className="btn-primary text-sm px-4 py-2 rounded-full"
      >
        {loading ? 'Adding...' : '+ Add to Watchlist'}
      </button>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <button
          onClick={cycleStatus}
          disabled={loading}
          className="flex items-center gap-2 text-sm bg-border hover:bg-border/80 px-4 py-2 rounded-full transition"
        >
          <span>Status:</span>
          <StatusBadge status={status} />
          <span className="text-gray-400 text-xs ml-1">(click to cycle)</span>
        </button>
      </div>

      {status !== 'watched' && (
        <p className="text-sm text-gray-500 italic">
          You need to mark this as "watched" before you can rate and review.
        </p>
      )}

      {status === 'watched' && (
        <>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-400">Your rating:</span>
            <RatingStars
              movieId={movieId}
              initialRating={initialRating}
              maxRating={7}
              session={session}
              onRatingChange={handleRatingChange}
            />
          </div>

          {!showReviewForm ? (
            <button
              onClick={() => setShowReviewForm(true)}
              className="text-sm text-primary hover:underline"
            >
              {initialReview ? 'Edit Review' : 'Add Review'}
            </button>
          ) : (
            <ReviewForm
              movieId={movieId}
              initialReview={initialReview}
              onSave={handleReviewSaved}
              onCancel={() => setShowReviewForm(false)}
            />
          )}
        </>
      )}

      {/* Remove confirmation modal */}
      <ConfirmModal
        isOpen={showRemoveModal}
        onClose={() => setShowRemoveModal(false)}
        onConfirm={handleRemoveConfirm}
        title="Remove from watchlist?"
        message="Are you sure you want to remove this from your watchlist?"
        confirmText="Remove"
      />
    </div>
  );
}