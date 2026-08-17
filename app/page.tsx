import {
  getTrending,
  getPopularMovies,
  getTopRatedTV,
  getActionMovies,
  getComedyMovies,
  getAnimeTV,
  getAnimeMovies,
  getSitcoms,
} from '@/lib/tmdb';
import CategoryRow from '@/components/ui/CategoryRow';
import FeaturedCarousel from '@/components/ui/FeaturedCarousel';
import { getServerSession, Session } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import { Watchlist } from '@/lib/models/Watchlist';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'FilmHive – Discover Movies & Series',
  description: 'Discover, track, and rate movies and series. Powered by TMDB.',
};

export const dynamic = 'force-dynamic';

interface Props {
  searchParams?: Promise<{ welcome?: string }>;
}

const categoryConfigs = [
  // Movies
  { slug: 'popular-movies', title: '🎬 Popular Movies', fetcher: getPopularMovies, type: 'movie' },
  { slug: 'action-movies', title: '💥 Action Movies', fetcher: getActionMovies, type: 'movie' },
  { slug: 'comedy-movies', title: '😂 Comedy Movies', fetcher: getComedyMovies, type: 'movie' },
  { slug: 'animations', title: '🎨 Animations', fetcher: getAnimeMovies, type: 'movie' },
  // TV Series
  { slug: 'top-rated-series', title: '⭐ Top Rated Series', fetcher: getTopRatedTV, type: 'tv' },
  { slug: 'anime-series', title: '🌸 Anime Series', fetcher: getAnimeTV, type: 'tv' },
  { slug: 'sitcoms', title: '📺 Sitcoms', fetcher: getSitcoms, type: 'tv' },
];

const CAROUSEL_LIMIT = 6;
const ROW_LIMIT = 10;

export default async function HomePage({ searchParams }: Props) {
  const params = await searchParams;
  const showWelcome = params?.welcome === 'true';

  // ✅ Trending with error handling and type guard
  let carouselMovies: any[] = [];
  try {
    const trendingData = await getTrending(1);
    carouselMovies = trendingData.results
      .filter((item: any) => item.media_type === 'movie' && item.id)
      .slice(0, CAROUSEL_LIMIT);
  } catch (error) {
    console.error('Failed to fetch trending:', error);
  }

  // ✅ Categories with individual error handling
  const categories = await Promise.all(
    categoryConfigs.map(async (config) => {
      try {
        const data = await config.fetcher(1);
        return {
          ...config,
          movies: (data.results || [])
            .filter((m: any) => m.id)
            .slice(0, ROW_LIMIT),
        };
      } catch (error) {
        console.error(`Failed to fetch ${config.slug}:`, error);
        return {
          ...config,
          movies: [],
        };
      }
    })
  );

  // ✅ Session and watchlist statuses
  const session = (await getServerSession(authOptions)) as Session | null;
  let statusMap: { [movieId: number]: 'want' | 'watching' | 'watched' } = {};

  if (session?.userId) {
    try {
      await connectToDatabase();
      const allMovieIds = [
        ...carouselMovies.map((m) => m.id),
        ...categories.flatMap((cat) => cat.movies.map((m) => m.id)),
      ];
      if (allMovieIds.length > 0) {
        const entries = await Watchlist.find({
          userId: session.userId,
          movieId: { $in: allMovieIds },
        }).lean();
        entries.forEach((entry: any) => {
          statusMap[entry.movieId] = entry.status;
        });
      }
    } catch (error) {
      console.error('Failed to fetch watchlist statuses:', error);
    }
  }

  const attachStatus = (movies: any[]) =>
    movies.map((m) => ({
      ...m,
      watchlistStatus: statusMap[m.id] || null,
    }));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {showWelcome && session && (
        <div className="bg-primary/10 border border-primary/30 rounded-xl p-4 mb-6 text-center">
          <p className="text-white">
            👋 Welcome, <strong>{session.user?.name}</strong>! Start building your watchlist by adding movies from the sections below.
          </p>
        </div>
      )}

      {carouselMovies.length > 0 && (
        <FeaturedCarousel movies={attachStatus(carouselMovies)} />
      )}

      <div className="space-y-8">
        {categories.map((cat) => (
          <CategoryRow
            key={cat.slug}
            title={cat.title}
            category={cat.slug}
            movies={attachStatus(cat.movies)}
            showWatchlist={!!session}
            mediaType={cat.type as 'movie' | 'tv'}
          />
        ))}
      </div>
    </div>
  );
}