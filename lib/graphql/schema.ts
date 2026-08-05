import gql from 'graphql-tag';

export const typeDefs = gql`
  type Movie {
    id: Int!
    title: String!
    name: String
    posterPath: String
    backdropPath: String
    releaseDate: String
    firstAirDate: String
    voteAverage: Float!
    overview: String!
    popularity: Float!
    genreIds: [Int!]!
    watchlistStatus: String
  }

  type MovieDetail extends Movie {
    runtime: Int!
    genres: [Genre!]!
    credits: Credits!
    watchProviders: WatchProviders
  }

  type Genre {
    id: Int!
    name: String!
  }

  type Credits {
    cast: [Cast!]!
  }

  type Cast {
    name: String!
    character: String!
  }

  type WatchProviders {
    flatrate: [Provider!]
    rent: [Provider!]
    buy: [Provider!]
    link: String
  }

  type Provider {
    providerId: Int!
    providerName: String!
    logoPath: String!
  }

  type WatchlistEntry {
    movieId: Int!
    title: String!
    posterPath: String
    status: String!
    rating: Int!
    review: String
    addedAt: String!
  }

  type UserStats {
    totalWatched: Int!
    totalWant: Int!
    totalWatching: Int!
    avgRating: Float!
  }

  type Query {
    trending(page: Int): [Movie!]!
    movie(id: Int!): MovieDetail
    watchlist: [WatchlistEntry!]!
    userStats: UserStats
    search(query: String!, page: Int): [Movie!]!
  }

  type Mutation {
    addToWatchlist(
      movieId: Int!
      title: String!
      posterPath: String
      backdropPath: String
      releaseDate: String
      voteAverage: Float
    ): WatchlistEntry

    updateWatchlistEntry(
      movieId: Int!
      status: String
      rating: Int
      review: String
    ): WatchlistEntry

    deleteFromWatchlist(movieId: Int!): Boolean!
  }
`;