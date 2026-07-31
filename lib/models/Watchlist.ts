import mongoose, { Schema, models } from 'mongoose';

const WatchlistSchema = new Schema({
  userId: { type: String, required: true, index: true },
  movieId: { type: Number, required: true },
  title: { type: String, required: true },
  posterPath: { type: String },
  backdropPath: { type: String },
  releaseDate: { type: String },
  voteAverage: { type: Number },
  status: {
    type: String,
    enum: ['want', 'watching', 'watched'],
    default: 'want',
  },
  rating: { type: Number, min: 0, max: 10, default: 0 },
  review: { type: String, default: '' }, 
  addedAt: { type: Date, default: Date.now },
});

WatchlistSchema.index({ userId: 1, movieId: 1 }, { unique: true });

export const Watchlist = models.Watchlist || mongoose.model('Watchlist', WatchlistSchema);