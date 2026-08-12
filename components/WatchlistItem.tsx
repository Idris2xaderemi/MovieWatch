'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import StatusBadge from './ui/StatusBadge';
import RatingStars from './ui/RatingStars';
import ReviewForm from './ui/ReviewForm';

interface WatchlistEntry {
  _id: string;
  movieId: number;
  title: string;
  posterPath: string;
  backdropPath: string;
  releaseDate: string;
  voteAverage: number;
  status: 'want' | 'watching' | 'watched';
  rating: number;
  review?: string;
  mediaType?: 'movie' | 'tv';
}

interface Props {
  entry: WatchlistEntry;
}

export default function WatchlistItem({ entry }: Props) {
  const router = useRouter();
  const { data: session } = useSession();
  const [status, setStatus] = useState(entry.status);
  const [rating, setRating] = useState(entry.rating || 0);
  const [loading, setLoading] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);

  const statusOrder: ('want' | 'watching' | 'watched')[] = ['want', 'watching', 'watched'];
  const mediaType = entry.mediaType || 'movie';
  const detailLink = `/${mediaType === 'tv' ? 'tv' : 'movie'}/${entry.movieId}`;

  const handleStatusToggle = async () => {
    const currentIndex = statusOrder.indexOf(status);
    const nextIndex = (currentIndex + 1) % statusOrder.length;
    const newStatus = statusOrder[nextIndex];
    setLoading(true);
    try {
      const res = await fetch(`/api/watchlist/${entry.movieId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, rating }),
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

  const handleRatingChange = async (newRating: number) => {
    setRating(newRating);
    setLoading(true);
    try {
      const res = await fetch(`/api/watchlist/${entry.movieId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, rating: newRating }),
      });
      if (!res.ok) alert('Failed to update rating');
      router.refresh();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleReviewSaved = () => {
    setShowReviewForm(false);
    router.refresh();
  };

  return (
    <div className="card-hover rounded-xl overflow-hidden bg-surface border border-border group">
      <Link href={detailLink}>
        <div className="relative aspect-[2/3] overflow-hidden bg-surface">
          {entry.posterPath ? (
            <Image
              src={`https://image.tmdb.org/t/p/w500${entry.posterPath}`}
              alt={entry.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-border text-gray-500">
              No image
            </div>
          )}
          <div className="absolute top-2 right-2">
            <span className="px-2 py-1 text-xs font-bold bg-primary rounded-md text-white shadow-lg">
              {Math.round(entry.voteAverage * 10)}%
            </span>
          </div>
        </div>
      </Link>
      <div className="p-3 md:p-4">
        <Link href={detailLink}>
          <h3 className="font-semibold text-sm md:text-base truncate text-white hover:text-primary transition">
            {entry.title}
          </h3>
        </Link>
        <div className="flex items-center justify-between mt-1.5 text-xs text-gray-400">
          <span>{entry.releaseDate?.split('-')[0] || 'N/A'}</span>
          <div className="flex items-center gap-1">
            <span className="text-yellow-400">★</span>
            <span>{entry.voteAverage.toFixed(1)}</span>
          </div>
        </div>

        <div className="mt-3 space-y-2">
          <button
            onClick={handleStatusToggle}
            disabled={loading}
            className="w-full text-xs bg-border hover:bg-border/80 text-white px-3 py-1.5 rounded-full transition flex items-center justify-center gap-1"
          >
            <span>Status: </span>
            <StatusBadge status={status} />
            <span className="text-gray-400 text-[10px] ml-1">(click to cycle)</span>
          </button>

          {status === 'watched' && (
            <>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">Your rating:</span>
                <RatingStars
                  movieId={entry.movieId}
                  initialRating={rating}
                  maxRating={7}
                  session={session}
                  onRatingChange={handleRatingChange}
                />
              </div>

              {!showReviewForm ? (
                <button
                  onClick={() => setShowReviewForm(true)}
                  className="text-xs text-primary hover:underline"
                >
                  {entry.review ? 'Edit Review' : 'Add Review'}
                </button>
              ) : (
                <ReviewForm
                  movieId={entry.movieId}
                  initialReview={entry.review || ''}
                  onSave={handleReviewSaved}
                  onCancel={() => setShowReviewForm(false)}
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}