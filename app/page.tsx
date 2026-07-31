import {
  getTrending,
  getPopularCombined,
  getTopRatedCombined,
  getActionMovies,
  getComedyMovies,
  getSitcoms,
  getAnimeCombined,
} from '@/lib/tmdb';
import CategorySection from '@/components/ui/CategorySection';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import { Watchlist } from '@/lib/models/Watchlist';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'MovieWatch – Discover Movies & Series',
};

// Define categories and their fetch functions
const categoryConfigs = [
  { slug: 'trending', title: '🔥 Trending', fetcher: getTrending },
  { slug: 'popular', title: '🌟 Popular', fetcher: getPopularCombined },
  { slug: 'top-rated', title: '⭐ Top Rated', fetcher: getTopRatedCombined },
  { slug: 'action', title: '💥 Action Movies', fetcher: getActionMovies },
  { slug: 'comedy', title: '😂 Comedy Movies', fetcher: getComedyMovies },
  { slug: 'sitcoms', title: '📺 Sitcoms', fetcher: getSitcoms },
  { slug: 'anime', title: '🌸 Anime & Animation', fetcher: getAnimeCombined },
];

const INITIAL_LIMIT = 10; // Number of movies per category on the homepage

export default async function HomePage() {
  // Fetch data for all categories in parallel
  const results = await Promise.all(
    categoryConfigs.map(({ fetcher }) => fetcher(1))
  );

  // Build the categories array with limited movies
  const categories = categoryConfigs.map((config, index) => ({
    ...config,
    movies: (results[index]?.results || []).slice(0, INITIAL_LIMIT),
  }));

  // Get user session and watchlist statuses
  const session = await getServerSession(authOptions);
  let statusMap: { [movieId: number]: 'want' | 'watching' | 'watched' } = {};
  if (session?.userId) {
    await connectToDatabase();
    const allMovieIds = results.flatMap((r) => r?.results?.map((m: any) => m.id) || []);
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Hero section */}
      <section className="relative overflow-hidden rounded-2xl mb-10 bg-linear-to-r from-primary/20 via-background to-background border border-border/50">
        <div className="absolute inset-0 bg-[url('https://image.tmdb.org/t/p/original/8s4h9friP6Ci3adRGahHARVd76E.jpg')] bg-cover bg-center opacity-5"></div>
        <div className="relative px-6 py-16 md:py-20 backdrop-blur-sm">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-6xl font-extrabold leading-tight">
              Discover. Track. <br />
              <span className="text-primary">Watch.</span>
            </h1>
            <p className="mt-4 text-lg text-gray-300 max-w-lg">
              Explore thousands of movies and series. Build your watchlist, rate, and review.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a href="#categories" className="btn-primary">Explore Now</a>
              {session && (
                <a href="/watchlist" className="btn-outline">My Watchlist</a>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Render categories */}
      <div id="categories" className="space-y-10">
        {categories.map((cat) => (
          <CategorySection
            key={cat.slug}
            title={cat.title}
            category={cat.slug}
            initialMovies={cat.movies.map((m: any) => ({
              ...m,
              watchlistStatus: statusMap[m.id] || null,
            }))}
            showWatchlist={!!session}
          />
        ))}
      </div>
    </div>
  );
}