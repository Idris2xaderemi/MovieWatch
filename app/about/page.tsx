export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
      <h1 className="text-3xl font-bold mb-4">About FilmHive</h1>
      <p className="text-gray-300 leading-relaxed">
        FilmHive is a personal movie watchlist manager built with Next.js, Tailwind, and MongoDB.
        It leverages the TMDB API to provide trending movies, search, and detailed information. Users can also see other recommendations from within the app.
        Users can sign in with Google, save movies to their watchlist, update status, rate, and also review films.
      </p>
      <p className="mt-4 text-gray-300">Powered by The Movie Database (TMDB).</p>
    </div>
  );
}