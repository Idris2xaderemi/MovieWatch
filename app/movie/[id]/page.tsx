import { getMovieDetails, getMovieWatchProviders } from '@/lib/tmdb';
import { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import RatingStars from '@/components/ui/RatingStars';
import { getServerSession } from 'next-auth';
import { connectToDatabase } from '@/lib/mongodb';
import { Watchlist } from '@/lib/models/Watchlist';
import StatusToggle from '@/components/ui/StatusToggle';
import { authOptions } from '@/lib/auth';
import Link from 'next/link';

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const movie = await getMovieDetails(id);
  if (!movie) return { title: 'Movie not found' };
  return {
    title: `${movie.title} – FilmHub`,
    description: movie.overview.slice(0, 160),
  };
}

export default async function MovieDetailPage({ params }: Props) {
  const { id } = await params;
  const movie = await getMovieDetails(id);
  if (!movie) notFound();

  // Fetch watch providers (gracefully handle 404)
  let providersData = null;
  try {
    providersData = await getMovieWatchProviders(id);
  } catch {
    // ignore – providers not available
  }
  const usProviders = providersData?.results?.US;

  // ✅ Cast session to any to avoid userId TypeScript errors
  const session = (await getServerSession(authOptions)) as any;
  let watchlistEntry = null;
  let avgUserRating = 0;
  let totalUserRatings = 0;

  await connectToDatabase();

  // Get all ratings for this movie (from all users)
  const allEntries = await Watchlist.find({
    movieId: parseInt(id),
    rating: { $gt: 0 },
  }).lean();

  if (allEntries.length > 0) {
    avgUserRating = allEntries.reduce((acc, e) => acc + e.rating, 0) / allEntries.length;
    totalUserRatings = allEntries.length;
  }

  if (session) {
    watchlistEntry = await Watchlist.findOne({
      userId: session.userId,
      movieId: parseInt(id),
    });
  }

  const canRate = watchlistEntry?.status === 'watched';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-1 relative aspect-2/3 rounded-xl overflow-hidden bg-surface">
          <Image
            src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
            alt={movie.title || 'Movie poster'}
            fill
            className="object-cover"
            priority
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        </div>
        <div className="md:col-span-2 space-y-4">
          <h1 className="text-3xl md:text-4xl font-bold">{movie.title}</h1>
          <div className="flex flex-wrap gap-4 text-sm text-gray-400">
            <span>{movie.release_date?.split('-')[0]}</span>
            <span>⭐ {movie.vote_average.toFixed(1)} (TMDB)</span>
            <span>🕐 {movie.runtime} min</span>
          </div>

          {avgUserRating > 0 && (
            <div className="text-sm text-gray-300">
              <span className="font-semibold">App Users Rating:</span> ⭐ {avgUserRating.toFixed(1)} ({totalUserRatings} ratings)
            </div>
          )}

          <p className="text-gray-300 leading-relaxed">{movie.overview}</p>
          <div className="flex flex-wrap gap-2">
            {movie.genres?.map((g: any) => (
              <span key={g.id} className="px-3 py-1 rounded-full bg-border text-xs text-gray-300">
                {g.name}
              </span>
            ))}
          </div>

          {/* Watch Providers */}
          {usProviders && (
            <div className="pt-2">
              <h3 className="text-sm font-semibold text-gray-400 mb-2">Where to Watch</h3>
              <div className="flex flex-wrap gap-4">
                {usProviders.flatrate && (
                  <div>
                    <p className="text-xs text-gray-500">Streaming</p>
                    <div className="flex gap-2 mt-1">
                      {usProviders.flatrate.map((p: any) => (
                        <div key={p.provider_id} className="w-8 h-8 rounded bg-white/10 flex items-center justify-center">
                          <Image
                            src={`https://image.tmdb.org/t/p/original${p.logo_path}`}
                            alt={p.provider_name}
                            width={32}
                            height={32}
                            className="rounded"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {usProviders.rent && (
                  <div>
                    <p className="text-xs text-gray-500">Rent</p>
                    <div className="flex gap-2 mt-1">
                      {usProviders.rent.map((p: any) => (
                        <div key={p.provider_id} className="w-8 h-8 rounded bg-white/10 flex items-center justify-center">
                          <Image
                            src={`https://image.tmdb.org/t/p/original${p.logo_path}`}
                            alt={p.provider_name}
                            width={32}
                            height={32}
                            className="rounded"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {usProviders.buy && (
                  <div>
                    <p className="text-xs text-gray-500">Buy</p>
                    <div className="flex gap-2 mt-1">
                      {usProviders.buy.map((p: any) => (
                        <div key={p.provider_id} className="w-8 h-8 rounded bg-white/10 flex items-center justify-center">
                          <Image
                            src={`https://image.tmdb.org/t/p/original${p.logo_path}`}
                            alt={p.provider_name}
                            width={32}
                            height={32}
                            className="rounded"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <p className="text-xs text-gray-500 w-full">Data from JustWatch</p>
              </div>
            </div>
          )}

          <div className="flex items-center gap-4 flex-wrap pt-4 border-t border-border">
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
            {canRate && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-400">Your rating:</span>
                <RatingStars movieId={parseInt(id)} initialRating={watchlistEntry?.rating || 0} />
              </div>
            )}
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
                {movie.credits.cast.slice(0, 6).map((actor: any) => (
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
}