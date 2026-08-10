import { getMovieDetails, getTVDetails } from '@/lib/tmdb';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';

interface Props {
  params: Promise<{ movieId: string }>;
}

// Helper to fetch either movie or TV details based on existence
async function getTitleDetails(id: string) {
  // Try movie first
  const movie = await getMovieDetails(id);
  if (movie) {
    return {
      ...movie,
      title: movie.title || 'Untitled',
      poster_path: movie.poster_path || '',
    };
  }
  // Try TV
  const tv = await getTVDetails(id);
  if (tv) {
    return {
      ...tv,
      title: tv.name || 'Untitled',
      poster_path: tv.poster_path || '',
    };
  }
  return null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { movieId } = await params;
  const titleData = await getTitleDetails(movieId);
  if (!titleData) return { title: 'Not found' };
  return {
    title: `Reviews for ${titleData.title} – CineTracker`,
    description: `Community reviews for ${titleData.title}`,
  };
}

export default async function ReviewsPage({ params }: Props) {
  const { movieId } = await params;
  const titleData = await getTitleDetails(movieId);
  if (!titleData) notFound();

  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
  let reviews = [];
  let fetchError = false;

  try {
    const res = await fetch(`${baseUrl}/api/reviews/${movieId}`, {
      cache: 'no-store',
    });
    if (res.ok) {
      reviews = await res.json();
    } else {
      fetchError = true;
    }
  } catch {
    fetchError = true;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <div className="flex items-center gap-4 mb-6">
        <div className="relative w-16 h-16 rounded overflow-hidden">
          <Image
            src={`https://image.tmdb.org/t/p/w92${titleData.poster_path}`}
            alt={titleData.title}
            fill
            className="object-cover"
          />
        </div>
        <h1 className="text-2xl font-bold">Reviews for {titleData.title}</h1>
      </div>

      {fetchError ? (
        <div className="text-center py-12 bg-surface rounded-xl border border-border">
          <p className="text-red-400">Failed to load reviews. Please try again later.</p>
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-12 bg-surface rounded-xl border border-border">
          <p className="text-gray-400">No reviews yet. Be the first to review!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review: any, index: number) => (
            <div key={review.userId || index} className="bg-surface rounded-xl border border-border p-4">
              <div className="flex justify-between items-start">
                <div>
                  <Link href={`/user/${review.userId}`} className="font-semibold text-white hover:text-primary transition">
                    {review.userName}
                  </Link>
                  <div className="flex items-center gap-2 text-sm text-yellow-400">
                    <span>⭐ {review.rating.toFixed(1)}</span>
                  </div>
                </div>
                <span className="text-xs text-gray-500">
                  {new Date(review.addedAt).toLocaleDateString()}
                </span>
              </div>
              <p className="text-gray-300 mt-2 leading-relaxed">{review.review}</p>
            </div>
          ))}
        </div>
      )}
      <div className="mt-6 flex gap-4">
        <Link href={`/tv/${movieId}`} className="text-sm text-primary hover:underline">
          ← Back to series
        </Link>
        <Link href={`/movie/${movieId}`} className="text-sm text-primary hover:underline">
          ← Back to movie
        </Link>
      </div>
    </div>
  );
}