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
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import { Watchlist } from '@/lib/models/Watchlist';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'MovieWatch – Discover Movies & Series',
};

export const dynamic = 'force-dynamic';

const categoryConfigs = [
  { slug: 'popular', title: '🌟 Popular', fetcher: getPopularCombined },
  { slug: 'top-rated', title: '⭐ Top Rated', fetcher: getTopRatedCombined },
  { slug: 'action', title: '💥 Action Movies', fetcher: getActionMovies },
  { slug: 'comedy', title: '😂 Comedy Movies', fetcher: getComedyMovies },
  { slug: 'anime', title: '🌸 Anime & Animation', fetcher: getAnimeCombined },
];

const CAROUSEL_LIMIT = 6;
const ROW_LIMIT = 10;

export default async function HomePage() {
  const trendingData = await getTrending(1);
  const carouselMovies = trendingData.results.slice(0, CAROUSEL_LIMIT);

  const results = await Promise.all(
    categoryConfigs.map(({ fetcher }) => fetcher(1))
  );

  const categories = categoryConfigs.map((config, index) => ({
    ...config,
    movies: (results[index]?.results || []).slice(0, ROW_LIMIT),
  }));

  const session = await getServerSession(authOptions);
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
      <FeaturedCarousel movies={attachStatus(carouselMovies)} />

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