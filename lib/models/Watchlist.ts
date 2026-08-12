import mongoose, { Schema, models } from 'mongoose';

export interface IWatchlist {
  userId: string;
  movieId: number;
  title: string;
  posterPath?: string;
  backdropPath?: string;
  releaseDate?: string;
  voteAverage?: number;
  mediaType: 'movie' | 'tv';
  status: 'want' | 'watching' | 'watched';
  rating: number;
  review: string;
  addedAt: Date;
}

const WatchlistSchema = new Schema<IWatchlist>({
  userId: { type: String, required: true, index: true },
  movieId: { type: Number, required: true },
  title: { type: String, required: true },
  posterPath: { type: String },
  backdropPath: { type: String },
  releaseDate: { type: String },
  voteAverage: { type: Number },
  mediaType: { type: String, enum: ['movie', 'tv'], default: 'movie' },
  status: {
    type: String,
    enum: ['want', 'watching', 'watched'],
    default: 'want',
  },
  rating: { type: Number, min: 0, max: 7, default: 0 },
  review: { type: String, default: '' },
  addedAt: { type: Date, default: Date.now },
});

WatchlistSchema.index({ userId: 1, movieId: 1 }, { unique: true });

export const Watchlist = models.Watchlist || mongoose.model<IWatchlist>('Watchlist', WatchlistSchema);