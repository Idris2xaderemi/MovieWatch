import { getTVDetails, getTVWatchProviders, TVDetail } from '@/lib/tmdb';
import { Metadata } from 'next';
import Image from 'next/image';
import { notFound, redirect } from 'next/navigation';
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
    const tvId = parseInt(id, 10);
    if (isNaN(tvId) || tvId <= 0) return { title: 'Invalid series' };
    const tv = await getTVDetails(String(tvId));
    if (!tv) return { title: 'Series not found' };
    return {
      title: `${tv.name} – FilmHive`,
      description: tv.overview?.slice(0, 160) || '',
    };
  } catch {
    return { title: 'Error loading series' };
  }
}

export default async function TVDetailPage({ params }: Props) {
  try {
    const { id } = await params;
    const tvId = parseInt(id, 10);
    if (isNaN(tvId) || tvId <= 0) redirect('/');

    const tv = await getTVDetails(String(tvId));
    if (!tv) notFound();

    // Fetch watch providers (silent fail)
    let usProviders = null;
    try {
      const providersData = await getTVWatchProviders(String(tvId));
      usProviders = providersData?.results?.US || null;
    } catch { /* ignore */ }

    const session = (await getServerSession(authOptions)) as Session | null;
    const userId = getUserId(session);

    let watchlistEntry = null;
    let avgUserRating = 0;
    let totalUserRatings = 0;

    await connectToDatabase();

    // Compute average rating from all users
    const allEntries = await Watchlist.find({
      movieId: tvId,
      rating: { $gt: 0 },
    }).lean();

    if (allEntries.length > 0) {
      avgUserRating = allEntries.reduce((acc, e) => acc + e.rating, 0) / allEntries.length;
      totalUserRatings = allEntries.length;
    }

    // Get current user's watchlist entry
    if (userId) {
      watchlistEntry = await Watchlist.findOne({
        userId,
        movieId: tvId,
      });
    }

    const posterUrl = tv.poster_path
      ? `https://image.tmdb.org/t/p/w500${tv.poster_path}`
      : '/default-poster.png';

    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Poster */}
          <div className="md:col-span-1 relative aspect-2/3 rounded-xl overflow-hidden bg-surface">
            <Image
              src={posterUrl}
              alt={tv.name || 'Series poster'}
              fill
              className="object-cover"
              priority
            />
          </div>

          {/* Details */}
          <div className="md:col-span-2 space-y-4">
            <h1 className="text-3xl md:text-4xl font-bold">{tv.name || 'Untitled'}</h1>
            <div className="flex flex-wrap gap-4 text-sm text-gray-400">
              <span>{tv.first_air_date?.split('-')[0] || 'N/A'}</span>
              <span>⭐ {tv.vote_average?.toFixed(1) || 'N/A'}</span>
              {tv.number_of_seasons && <span>📺 {tv.number_of_seasons} seasons</span>}
            </div>

            {avgUserRating > 0 && (
              <div className="text-sm text-gray-300">
                <span className="font-semibold">App Users Rating:</span> ⭐ {avgUserRating.toFixed(1)} ({totalUserRatings} ratings)
              </div>
            )}

            <p className="text-gray-300 leading-relaxed">{tv.overview || 'No description available.'}</p>

            {/* Genres */}
            <div className="flex flex-wrap gap-2">
              {tv.genres?.map((g: any) => (
                <span key={g.id} className="px-3 py-1 rounded-full bg-border text-xs text-gray-300">
                  {g.name}
                </span>
              ))}
            </div>

            {/* Where to Watch */}
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

            {/* ✅ Only StatusToggle – it handles everything */}
            <div className="pt-4 border-t border-border">
              <StatusToggle
                movieId={tvId}
                initialStatus={watchlistEntry?.status || null}
                initialRating={watchlistEntry?.rating || 0}
                initialReview={watchlistEntry?.review || ''}
                movieData={{
                  title: tv.name || 'Untitled',
                  posterPath: tv.poster_path || '',
                  backdropPath: tv.backdrop_path || '',
                  releaseDate: tv.first_air_date || '',
                  voteAverage: tv.vote_average || 0,
                }}
              />
            </div>

            {/* Reviews link */}
            <div className="pt-2">
              <Link
                href={`/reviews/${tvId}`}
                className="text-sm text-primary hover:underline inline-flex items-center gap-1"
              >
                View community reviews →
              </Link>
            </div>

            {/* Cast */}
            {tv.credits?.cast && (
              <div className="pt-4">
                <h3 className="font-semibold text-lg mb-2">Cast</h3>
                <div className="flex flex-wrap gap-3 text-sm">
                  {tv.credits.cast.slice(0, 6).map((actor) => (
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
    console.error('TV detail error:', error);
    redirect('/');
  }
}