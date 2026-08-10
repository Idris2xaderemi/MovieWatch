import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Contact – FilmHive',
  description: 'Contact us for support, feedback, or questions about FilmHive.',
};

export default function ContactPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
      <h1 className="text-3xl font-bold mb-6">Contact</h1>
      <div className="space-y-6 text-gray-300 leading-relaxed">
        <p>
          Have a question, suggestion, or issue? We'd love to hear from you.
        </p>
        <p>
          You can reach us via the following channels:
        </p>
        <div className="bg-surface rounded-lg border border-border p-6 space-y-3">
          <p>
            <span className="font-semibold text-white">Email:</span>{' '}
            <a href="idris2xaderemi@gmail.com" className="text-primary hover:underline">
              idris2xaderemi@gmail.com
            </a>
          </p>
          <p className="text-sm text-gray-400">
            We'll respond to your email within 2–3 business days.
          </p>
        </div>
        <p className="text-sm text-gray-400">
          For security or privacy concerns, please see our{' '}
          <Link href="/privacy" className="text-primary hover:underline">
            Privacy Policy
          </Link>
          {' '}or{' '}
          <Link href="/terms" className="text-primary hover:underline">
            Terms of Service
          </Link>
          .
        </p>
      </div>
    </div>
  );
}