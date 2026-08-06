import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Privacy Policy – FilmHub',
  description: 'Privacy policy for FilmHub',
};

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
      <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
      <div className="space-y-4 text-gray-300 leading-relaxed">
        <p>
          <strong>FilmHub</strong> ("we", "our", "us") respects your privacy. This policy explains how we collect, use, and protect your personal information.
        </p>
        <h2 className="text-xl font-semibold text-white mt-6">1. Information We Collect</h2>
        <p>
          When you sign in with Google, we receive your name, email address, and profile picture. We store this information securely in our database to provide you with a personalized experience.
        </p>
        <h2 className="text-xl font-semibold text-white mt-6">2. How We Use Your Information</h2>
        <p>
          We use your information to manage your watchlist, ratings, and reviews. We do not sell or share your data with third parties, except as required to operate the app (e.g., TMDB API for movie data).
        </p>
        <h2 className="text-xl font-semibold text-white mt-6">3. Data Retention</h2>
        <p>
          You can delete your account and all associated data at any time from your profile page. When you delete your account, all your watchlist entries, ratings, and reviews are permanently removed.
        </p>
        <h2 className="text-xl font-semibold text-white mt-6">4. Data Security</h2>
        <p>
          We use industry-standard encryption and security practices to protect your data. Your password is never stored – we use Google OAuth for secure authentication.
        </p>
        <h2 className="text-xl font-semibold text-white mt-6">5. Contact Us</h2>
        <p>
          If you have questions about this policy, please <Link href="/contact" className="text-primary hover:underline">contact us</Link>.
        </p>
        <p className="text-sm text-gray-500 mt-8">Last updated: {new Date().toLocaleDateString()}</p>
      </div>
    </div>
  );
}