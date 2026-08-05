import { getCategoryBySlug } from '@/lib/tmdb';
import { Metadata } from 'next';
import MovieGrid from '@/components/ui/MovieGrid';
import { notFound } from 'next/navigation';

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}

// app/search/page.tsx
export const dynamic = 'force-dynamic';

const categoryTitles: Record<string, string> = {
  trending: 'Trending',
  popular: 'Popular',
  'top-rated': 'Top Rated',
  action: 'Action Movies',
  comedy: 'Comedy Movies',
  sitcoms: 'Sitcoms',
  anime: 'Anime & Animation',
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const title = categoryTitles[slug] || 'Category';
  return {
    title: `${title} – MovieWatch`,
    description: `Explore ${title} movies and series`,
  };
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { page = '1' } = await searchParams;
  const currentPage = parseInt(page, 10) || 1;

  if (!categoryTitles[slug]) notFound();

  let data;
  try {
    data = await getCategoryBySlug(slug, currentPage);
  } catch {
    notFound();
  }

  const movies = data.results || [];
  const totalPages = data.total_pages || 1;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-6">{categoryTitles[slug]}</h1>
      <MovieGrid movies={movies} />
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