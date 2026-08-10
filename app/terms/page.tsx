import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Terms of Service – FilmHive',
  description: 'Terms of service for FilmHive',
};

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
      <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>
      <div className="space-y-4 text-gray-300 leading-relaxed">
        <p>
          By using <strong>FilmHive</strong>, you agree to the following terms.
        </p>
        <h2 className="text-xl font-semibold text-white mt-6">1. Use of the Service</h2>
        <p>
          FilmHive is a personal movie watchlist manager. You must be at least 13 years old to use this service.
        </p>
        <h2 className="text-xl font-semibold text-white mt-6">2. User Accounts</h2>
        <p>
          You are responsible for maintaining the security of your Google account used to sign in. You agree to provide accurate information.
        </p>
        <h2 className="text-xl font-semibold text-white mt-6">3. Acceptable Use</h2>
        <p>
          You may not use this service for any unlawful or abusive purpose. You retain ownership of the content you post (reviews, ratings), but grant us a license to display it within the app.
        </p>
        <h2 className="text-xl font-semibold text-white mt-6">4. Data & Privacy</h2>
        <p>
          Our <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link> explains how we handle your data. We use TMDB for movie data.
        </p>
        <h2 className="text-xl font-semibold text-white mt-6">5. Termination</h2>
        <p>
          We reserve the right to terminate accounts that violate these terms. You may also delete your account at any time.
        </p>
        <p className="text-sm text-gray-500 mt-8">Last updated: {new Date().toLocaleDateString()}</p>
      </div>
    </div>
  );
}