import { getMovieDetails, getMovieWatchProviders } from '@/lib/tmdb';
import { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getServerSession, Session } from 'next-auth';
import { connectToDatabase } from '@/lib/mongodb';
import { Watchlist } from '@/lib/models/Watchlist';
import StatusToggle from '@/components/ui/StatusToggle';
import { authOptions } from '@/lib/auth';
import Link from 'next/link';

interface Props {
  params: Promise<{ id: string }>;
}

function getUserId(session: Session | null): string | null {
  if (!session) return null;
  return session.userId || session.user?.id || null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const { id } = await params;
    const movie = await getMovieDetails(id);
    if (!movie) return { title: 'Movie not found' };
    return {
      title: `${movie.title} – FilmHive`,
      description: movie.overview?.slice(0, 160) || '',
    };
  } catch {
    return { title: 'Error loading movie' };
  }
}

export default async function MovieDetailPage({ params }: Props) {
  try {
    const { id } = await params;

    const movie = await getMovieDetails(id);
    if (!movie) notFound();

    let usProviders = null;
    try {
      const providersData = await getMovieWatchProviders(id);
      usProviders = providersData?.results?.US || null;
    } catch { /* ignore */ }

    const session = (await getServerSession(authOptions)) as Session | null;
    const userId = getUserId(session);

    let watchlistEntry = null;
    let avgUserRating = 0;
    let totalUserRatings = 0;

    await connectToDatabase();

    const allEntries = await Watchlist.find({
      movieId: parseInt(id),
      rating: { $gt: 0 },
    }).lean();

    if (allEntries.length > 0) {
      avgUserRating = allEntries.reduce((acc, e) => acc + e.rating, 0) / allEntries.length;
      totalUserRatings = allEntries.length;
    }

    if (userId) {
      watchlistEntry = await Watchlist.findOne({
        userId,
        movieId: parseInt(id),
      });
    }

    const posterUrl = movie.poster_path
      ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
      : '/default-poster.png';

    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-1 relative aspect-2/3 rounded-xl overflow-hidden bg-surface">
            <Image
              src={posterUrl}
              alt={movie.title || 'Movie poster'}
              fill
              className="object-cover"
              priority
            />
          </div>

          <div className="md:col-span-2 space-y-4">
            <h1 className="text-3xl md:text-4xl font-bold">{movie.title || 'Untitled'}</h1>
            <div className="flex flex-wrap gap-4 text-sm text-gray-400">
              <span>{movie.release_date?.split('-')[0] || 'N/A'}</span>
              <span>⭐ {movie.vote_average?.toFixed(1) || 'N/A'}</span>
              {movie.runtime && <span>🕐 {movie.runtime} min</span>}
            </div>

            {avgUserRating > 0 && (
              <div className="text-sm text-gray-300">
                <span className="font-semibold">App Users Rating:</span> ⭐ {avgUserRating.toFixed(1)} ({totalUserRatings} ratings)
              </div>
            )}

            <p className="text-gray-300 leading-relaxed">{movie.overview || 'No description available.'}</p>

            <div className="flex flex-wrap gap-2">
              {movie.genres?.map((g: any) => (
                <span key={g.id} className="px-3 py-1 rounded-full bg-border text-xs text-gray-300">
                  {g.name}
                </span>
              ))}
            </div>

            {usProviders && (
              <div className="pt-2">
                <h3 className="text-sm font-semibold text-gray-400 mb-2">Where to Watch</h3>
                <div className="flex flex-wrap gap-4">
                  {/* ... provider display ... */}
                  <p className="text-xs text-gray-500 w-full">Data from JustWatch</p>
                </div>
              </div>
            )}

            {/* ✅ Only StatusToggle – it handles everything */}
            <div className="pt-4 border-t border-border">
              <StatusToggle
                movieId={parseInt(id)}
                initialStatus={watchlistEntry?.status || null}
                initialRating={watchlistEntry?.rating || 0}
                initialReview={watchlistEntry?.review || ''}
                movieData={{
                  title: movie.title || 'Untitled',
                  posterPath: movie.poster_path || '',
                  backdropPath: movie.backdrop_path || '',
                  releaseDate: movie.release_date || '',
                  voteAverage: movie.vote_average || 0,
                }}
              />
            </div>

            <div className="pt-2">
              <Link
                href={`/reviews/${id}`}
                className="text-sm text-primary hover:underline inline-flex items-center gap-1"
              >
                View community reviews →
              </Link>
            </div>

            {movie.credits?.cast && (
              <div className="pt-4">
                <h3 className="font-semibold text-lg mb-2">Cast</h3>
                <div className="flex flex-wrap gap-3 text-sm">
                  {movie.credits.cast.slice(0, 6).map((actor) => (
                    <span key={actor.name} className="bg-surface px-3 py-1 rounded-full border border-border">
                      {actor.name} <span className="text-gray-500">as {actor.character}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('Movie detail error:', error);
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h2 className="text-2xl font-bold text-red-400">Something went wrong</h2>
        <p className="text-gray-400 mt-2">We couldn't load this movie. Please try again later.</p>
      </div>
    );
  }
}