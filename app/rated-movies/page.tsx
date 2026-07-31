import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Top User Rated Movies – MovieWatch",
  description: "Movies rated highest by the MovieWatch community",
};

export default async function RatedMoviesPage() {
  const res = await fetch(`${process.env.NEXTAUTH_URL}/api/movies/rated`, {
    cache: "no-store",
  });
  const movies = await res.json();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <div className="section-title mb-6">
        <span className="accent"></span> 🏆 Top User Rated Movies
      </div>

      {movies.length === 0 ? (
        <div className="text-center py-16 bg-surface rounded-xl border border-border">
          <p className="text-gray-400">No movies rated yet. Start rating!</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {movies.map((movie: any) => (
            <Link href={`/movie/${movie._id}`} key={movie._id}>
              <div className="card-hover rounded-xl overflow-hidden bg-surface border border-border group">
                <div className="relative aspect-[2/3] overflow-hidden bg-surface">
                  <Image
                    src={`https://image.tmdb.org/t/p/w500${movie.posterPath}`}
                    alt={movie.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                    <div className="flex items-center gap-2 text-white">
                      <span className="text-yellow-400">⭐</span>
                      <span className="font-semibold">
                        {movie.avgRating.toFixed(1)}
                      </span>
                      <span className="text-xs text-gray-300">
                        ({movie.count} rating(s))
                      </span>
                    </div>
                  </div>
                </div>
                <div className="p-3">
                  <h3 className="font-semibold text-sm truncate text-white group-hover:text-primary transition">
                    {movie.title}
                  </h3>
                  <p className="text-xs text-gray-400">
                    {movie.releaseDate?.split("-")[0] || "N/A"}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
