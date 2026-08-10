import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'API & Attribution – FilmHive',
  description: 'API attribution and credits for FilmHive',
};

export default function ApiInfoPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
      <h1 className="text-3xl font-bold mb-6">API & Attribution</h1>
      <div className="space-y-4 text-gray-300 leading-relaxed">
        <p>
          FilmHive is powered by the <strong>The Movie Database (TMDB)</strong> API. We are grateful for their extensive database of movies, TV shows, and cast/crew information.
        </p>
        <div className="flex items-center gap-4 my-4 p-4 bg-surface rounded-lg border border-border">
          <Image
            src="https://www.themoviedb.org/assets/2/v4/logos/v2/blue_short-8e7b30f73a4020692ccca9c88bafe5dcb6f8a62a4c6bc55cd9ba82bb2cd95f6c.svg"
            alt="TMDB Logo"
            width={150}
            height={40}
          />
          <span className="text-sm text-gray-400">
            This product uses the TMDB API but is not endorsed or certified by TMDB.
          </span>
        </div>
        <h2 className="text-xl font-semibold text-white mt-6">Data Sources</h2>
        <ul className="list-disc list-inside space-y-1 text-gray-300">
          <li>Movie data, posters, and backdrops – TMDB</li>
          <li>User‑provided reviews and ratings – stored in our database</li>
          <li>Watch provider information – JustWatch (via TMDB)</li>
        </ul>
        <h2 className="text-xl font-semibold text-white mt-6">Open Source</h2>
        <p>
          FilmHive is built with open‑source technologies: Next.js, React, Tailwind CSS, MongoDB, and NextAuth.js. The source code is available on GitHub.
        </p>
      </div>
    </div>
  );
}