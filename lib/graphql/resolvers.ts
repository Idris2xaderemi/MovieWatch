import { getTrending, getMovieDetails, getMovieWatchProviders, searchMovies } from '@/lib/tmdb';
import { connectToDatabase } from '@/lib/mongodb';
import { Watchlist } from '@/lib/models/Watchlist';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export const resolvers = {
  Query: {
    trending: async (_: any, { page = 1 }: { page: number }) => {
      const data = await getTrending(page);
      return data.results;
    },
    movie: async (_: any, { id }: { id: number }) => {
      const movie = await getMovieDetails(String(id));
      const providers = await getMovieWatchProviders(String(id));
      return {
        ...movie,
        watchProviders: providers?.results?.US || null,
      };
    },
    watchlist: async () => {
      const session = await getServerSession(authOptions);
      if (!session) throw new Error('Unauthorized');
      await connectToDatabase();
      const entries = (await Watchlist.find({ userId: session.userId })
        .sort({ addedAt: -1 })
        .lean()) as any[]; // ✅ cast to any[]
      return entries.map((entry) => ({
        movieId: entry.movieId,
        title: entry.title,
        posterPath: entry.posterPath,
        status: entry.status,
        rating: entry.rating,
        review: entry.review || '',
        addedAt: entry.addedAt.toISOString(),
      }));
    },
    userStats: async () => {
      const session = await getServerSession(authOptions);
      if (!session) throw new Error('Unauthorized');
      await connectToDatabase();
      const entries = (await Watchlist.find({ userId: session.userId }).lean()) as any[];
      const totalWatched = entries.filter((e: any) => e.status === 'watched').length;
      const totalWant = entries.filter((e: any) => e.status === 'want').length;
      const totalWatching = entries.filter((e: any) => e.status === 'watching').length;
      const rated = entries.filter((e: any) => e.rating && e.rating > 0);
      const avgRating = rated.length ? rated.reduce((a: number, e: any) => a + e.rating, 0) / rated.length : 0;
      return { totalWatched, totalWant, totalWatching, avgRating };
    },
    search: async (_: any, { query, page = 1 }: { query: string; page: number }) => {
      const data = await searchMovies(query, page);
      return data.results;
    },
  },
  Mutation: {
    addToWatchlist: async (_: any, args: any) => {
      const session = await getServerSession(authOptions);
      if (!session) throw new Error('Unauthorized');
      await connectToDatabase();
      const entry = await Watchlist.create({
        userId: session.userId,
        movieId: args.movieId,
        title: args.title,
        posterPath: args.posterPath || '',
        backdropPath: args.backdropPath || '',
        releaseDate: args.releaseDate || '',
        voteAverage: args.voteAverage || 0,
        status: 'want',
        rating: 0,
        review: '',
      });
      // entry is a Mongoose document; cast to any to access properties
      const e = entry as any;
      return {
        movieId: e.movieId,
        title: e.title,
        posterPath: e.posterPath,
        status: e.status,
        rating: e.rating,
        review: e.review,
        addedAt: e.addedAt.toISOString(),
      };
    },
    updateWatchlistEntry: async (_: any, { movieId, status, rating, review }: any) => {
      const session = await getServerSession(authOptions);
      if (!session) throw new Error('Unauthorized');
      await connectToDatabase();
      const updated = (await Watchlist.findOneAndUpdate(
        { userId: session.userId, movieId },
        { status, rating, review },
        { new: true, lean: true }
      )) as any; // ✅ cast to any
      if (!updated) throw new Error('Entry not found');
      return {
        movieId: updated.movieId,
        title: updated.title,
        posterPath: updated.posterPath,
        status: updated.status,
        rating: updated.rating,
        review: updated.review || '',
        addedAt: updated.addedAt.toISOString(),
      };
    },
    deleteFromWatchlist: async (_: any, { movieId }: { movieId: number }) => {
      const session = await getServerSession(authOptions);
      if (!session) throw new Error('Unauthorized');
      await connectToDatabase();
      await Watchlist.findOneAndDelete({ userId: session.userId, movieId });
      return true;
    },
  },
};