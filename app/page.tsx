import {
  getTrending,
  getPopularCombined,
  getTopRatedCombined,
  getActionMovies,
  getComedyMovies,
  getAnimeCombined,
} from '@/lib/tmdb';
import CategoryRow from '@/components/ui/CategoryRow';
import FeaturedCarousel from '@/components/ui/FeaturedCarousel';
import { getServerSession, Session } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import { Watchlist } from '@/lib/models/Watchlist';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'FilmHub – Discover Movies & Series',
  description: 'Discover, track, and rate movies. Powered by TMDB.',
};

export const dynamic = 'force-dynamic';

interface Props {
  searchParams?: Promise<{ welcome?: string }>;
}

const categoryConfigs = [
  { slug: 'popular', title: '🌟 Popular', fetcher: getPopularCombined },
  { slug: 'top-rated', title: '⭐ Top Rated', fetcher: getTopRatedCombined },
  { slug: 'action', title: '💥 Action Movies', fetcher: getActionMovies },
  { slug: 'comedy', title: '😂 Comedy Movies', fetcher: getComedyMovies },
  { slug: 'anime', title: '🌸 Anime & Animation', fetcher: getAnimeCombined },
];

const CAROUSEL_LIMIT = 6;
const ROW_LIMIT = 10;

export default async function HomePage({ searchParams }: Props) {
  // Check for welcome parameter
  const params = await searchParams;
  const showWelcome = params?.welcome === 'true';

  // Fetch trending for carousel
  const trendingData = await getTrending(1);
  const carouselMovies = trendingData.results.slice(0, CAROUSEL_LIMIT);

  // Fetch all categories in parallel
  const results = await Promise.all(
    categoryConfigs.map(({ fetcher }) => fetcher(1))
  );

  const categories = categoryConfigs.map((config, index) => ({
    ...config,
    movies: (results[index]?.results || []).slice(0, ROW_LIMIT),
  }));

  // ✅ Explicitly type the session
  const session = (await getServerSession(authOptions)) as Session | null;
  let statusMap: { [movieId: number]: 'want' | 'watching' | 'watched' } = {};

  if (session?.userId) {
    await connectToDatabase();
    const allMovieIds = [
      ...carouselMovies.map((m: any) => m.id),
      ...categories.flatMap((cat) => cat.movies.map((m: any) => m.id)),
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
  }

  const attachStatus = (movies: any[]) =>
    movies.map((m) => ({
      ...m,
      watchlistStatus: statusMap[m.id] || null,
    }));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Welcome banner for first-time users */}
      {showWelcome && session && (
        <div className="bg-primary/10 border border-primary/30 rounded-xl p-4 mb-6 text-center">
          <p className="text-white">
            👋 Welcome, <strong>{session.user?.name}</strong>! Start building your watchlist by adding movies from the sections below.
          </p>
        </div>
      )}

      {/* Featured Carousel */}
      <FeaturedCarousel movies={attachStatus(carouselMovies)} />

      {/* Category rows */}
      <div className="space-y-8">
        {categories.map((cat) => (
          <CategoryRow
            key={cat.slug}
            title={cat.title}
            category={cat.slug}
            movies={attachStatus(cat.movies)}
            showWatchlist={!!session}
          />
        ))}
      </div>
    </div>
  );
}