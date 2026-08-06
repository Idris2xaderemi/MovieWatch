import { Inter } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import SessionProviderWrapper from '@/components/providers/SessionProviders';

const inter = Inter({ subsets: ['latin'] });


export const metadata = {
  title: 'FilmHive – Your Personal Movie Watchlist',
  description: 'Discover, track, and rate movies. Powered by TMDB.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;   // ✅ Type added here
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-background text-white min-h-screen flex flex-col`}>
        <SessionProviderWrapper>
          <Navbar />
          <main className="flex-1 pt-16">{children}</main>
          <Footer />
        </SessionProviderWrapper>
      </body>
    </html>
  );
}