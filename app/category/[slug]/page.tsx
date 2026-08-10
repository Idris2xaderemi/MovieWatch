import { getCategoryBySlug } from '@/lib/tmdb';
import { Metadata } from 'next';
import MovieGrid from '@/components/ui/MovieGrid';
import { notFound } from 'next/navigation';
import { getServerSession, Session } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import { Watchlist } from '@/lib/models/Watchlist';

export const dynamic = 'force-dynamic';

const categoryTitles: Record<string, string> = {
  'popular-movies': '🎬 Popular Movies',
  'action-movies': '💥 Action Movies',
  'comedy-movies': '😂 Comedy Movies',
  'animations': '🎨 Animations',
  'top-rated-series': '⭐ Top Rated Series',
  'anime-series': '🌸 Anime Series',
  'sitcoms': '📺 Sitcoms',
};

const movieSlugs = ['popular-movies', 'action-movies', 'comedy-movies', 'animations'];
const tvSlugs = ['top-rated-series', 'anime-series', 'sitcoms'];

function getMediaType(slug: string): 'movie' | 'tv' {
  if (movieSlugs.includes(slug)) return 'movie';
  if (tvSlugs.includes(slug)) return 'tv';
  return 'movie'; 
}

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const title = categoryTitles[slug] || 'Category';
  return {
    title: `${title} – FilmHive`,
    description: `Explore ${title} on FilmHive`,
  };
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { page = '1' } = await searchParams;
  const currentPage = parseInt(page, 10) || 1;

  if (!categoryTitles[slug]) notFound();

  const data = await getCategoryBySlug(slug, currentPage);
  const movies = data.results || [];
  const totalPages = data.total_pages || 1;

  const session = (await getServerSession(authOptions)) as Session | null;
  let statusMap: { [id: number]: 'want' | 'watching' | 'watched' } = {};

  // Only fetch watchlist statuses for movie categories
  const isMovieCategory = movieSlugs.includes(slug);
  if (session?.userId && movies.length > 0 && isMovieCategory) {
    await connectToDatabase();
    const ids = movies.map((m: any) => m.id);
    const entries = await Watchlist.find({
      userId: session.userId,
      movieId: { $in: ids },
    }).lean();
    entries.forEach((entry: any) => {
      statusMap[entry.movieId] = entry.status;
    });
  }

  const moviesWithStatus = movies.map((m: any) => ({
    ...m,
    watchlistStatus: statusMap[m.id] || null,
  }));

  const mediaType = getMediaType(slug);
  const showWatchlist = isMovieCategory && !!session;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-6">{categoryTitles[slug]}</h1>
      <MovieGrid
        movies={moviesWithStatus}
        showWatchlist={showWatchlist}
        mediaType={mediaType}
      />
      {totalPages > 1 && (
        <div className="flex justify-center gap-3 mt-8">
          {currentPage > 1 && (
            <a
              href={`/category/${slug}?page=${currentPage - 1}`}
              className="btn-outline px-4 py-2 text-sm"
            >
              Previous
            </a>
          )}
          <span className="text-sm text-gray-400 self-center">
            Page {currentPage} of {totalPages}
          </span>
          {currentPage < totalPages && (
            <a
              href={`/category/${slug}?page=${currentPage + 1}`}
              className="btn-outline px-4 py-2 text-sm"
            >
              Next
            </a>
          )}
        </div>
      )}
    </div>
  );
}