const BASE_URL = 'https://api.themoviedb.org/3';
const API_TOKEN = process.env.TMDB_ACCESS_TOKEN;

if (!API_TOKEN) {
  throw new Error('TMDB_ACCESS_TOKEN is missing in .env.local');
}

// ---------- Types ----------
export interface Movie {
  id: number;
  title?: string;
  name?: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date?: string;
  first_air_date?: string;
  vote_average: number;
  overview: string;
  popularity: number;
  genre_ids: number[];
  origin_country?: string[];
  original_language?: string;
  media_type?: 'movie' | 'tv';
  watchlistStatus?: 'want' | 'watching' | 'watched' | null;
}

export interface MovieDetail extends Movie {
  runtime: number;
  genres: { id: number; name: string }[];
  credits: { cast: { name: string; character: string }[] };
}

export interface TMDBResponse {
  page: number;
  results: Movie[];
  total_pages: number;
  total_results: number;
}

// ---------- Core fetch ----------
async function fetchTMDB<T = TMDBResponse>(endpoint: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    headers: {
      Authorization: `Bearer ${API_TOKEN}`,
      'Content-Type': 'application/json',
    },
    next: { revalidate: 3600 },
    ...options,
  });
  if (!res.ok) {
    const errorText = await res.text();
    console.error(`TMDB error ${res.status}: ${errorText}`);
    throw new Error(`TMDB error: ${res.status}`);
  }
  return res.json();
}

// ---------- Individual fetchers ----------
export async function getTrending(page = 1): Promise<TMDBResponse> {
  return fetchTMDB(`/trending/all/day?page=${page}`);
}

export async function getPopularMovies(page = 1): Promise<TMDBResponse> {
  return fetchTMDB(`/movie/popular?page=${page}`);
}

export async function getPopularTV(page = 1): Promise<TMDBResponse> {
  return fetchTMDB(`/tv/popular?page=${page}`);
}

export async function getTopRatedMovies(page = 1): Promise<TMDBResponse> {
  return fetchTMDB(`/movie/top_rated?page=${page}`);
}

export async function getTopRatedTV(page = 1): Promise<TMDBResponse> {
  return fetchTMDB(`/tv/top_rated?page=${page}`);
}

export async function getActionMovies(page = 1): Promise<TMDBResponse> {
  return fetchTMDB(`/discover/movie?with_genres=28&page=${page}`);
}

export async function getComedyMovies(page = 1): Promise<TMDBResponse> {
  return fetchTMDB(`/discover/movie?with_genres=35&page=${page}`);
}

export async function getSitcoms(page = 1): Promise<TMDBResponse> {
  return fetchTMDB(`/discover/tv?with_genres=35&page=${page}`);
}

export async function getAnimeMovies(page = 1): Promise<TMDBResponse> {
  return fetchTMDB(`/discover/movie?with_genres=16&page=${page}`);
}

export async function getAnimeTV(page = 1): Promise<TMDBResponse> {
  return fetchTMDB(`/discover/tv?with_genres=16&page=${page}`);
}

export async function getMovieDetails(id: string) {
  try {
    return await fetchTMDB<MovieDetail>(`/movie/${id}?append_to_response=credits`);
  } catch (error: any) {
    // If it's a 404, return null so the page can call notFound()
    if (error.message?.includes('404')) {
      return null;
    }
    throw error;
  }
}

export async function getMovieWatchProviders(id: string) {
  try {
    return await fetchTMDB<{ results: { [country: string]: any } }>(
      `/movie/${id}/watch/providers`
    );
  } catch {
    return null;
  }
}

export async function searchMovies(query: string, page = 1) {
  return fetchTMDB<{ results: Movie[]; total_pages: number; total_results: number }>(
    `/search/multi?query=${encodeURIComponent(query)}&page=${page}`
  );
}

// ---------- Combined fetchers ----------
export async function getPopularCombined(page = 1): Promise<{ results: Movie[]; total_pages: number }> {
  const [movies, tv] = await Promise.all([getPopularMovies(page), getPopularTV(page)]);
  const combined = [...movies.results, ...tv.results]
    .sort((a, b) => b.popularity - a.popularity)
    .slice(0, 20);
  return {
    results: combined,
    total_pages: Math.max(movies.total_pages || 1, tv.total_pages || 1),
  };
}

export async function getTopRatedCombined(page = 1): Promise<{ results: Movie[]; total_pages: number }> {
  const [movies, tv] = await Promise.all([getTopRatedMovies(page), getTopRatedTV(page)]);
  const combined = [...movies.results, ...tv.results]
    .sort((a, b) => b.vote_average - a.vote_average)
    .slice(0, 20);
  return {
    results: combined,
    total_pages: Math.max(movies.total_pages || 1, tv.total_pages || 1),
  };
}

export async function getAnimeCombined(page = 1): Promise<{ results: Movie[]; total_pages: number }> {
  const [movies, tv] = await Promise.all([getAnimeMovies(page), getAnimeTV(page)]);
  const combined = [...movies.results, ...tv.results]
    .sort((a, b) => b.popularity - a.popularity)
    .slice(0, 20);
  return {
    results: combined,
    total_pages: Math.max(movies.total_pages || 1, tv.total_pages || 1),
  };
}

// ---------- Category dispatcher ----------
export async function getCategoryBySlug(
  slug: string,
  page = 1
): Promise<{ results: Movie[]; total_pages: number }> {
  switch (slug) {
    case 'trending': {
      const data = await getTrending(page);
      return { results: data.results, total_pages: data.total_pages };
    }
    case 'popular':
      return getPopularCombined(page);
    case 'top-rated':
      return getTopRatedCombined(page);
    case 'action': {
      const data = await getActionMovies(page);
      return { results: data.results, total_pages: data.total_pages };
    }
    case 'comedy': {
      const data = await getComedyMovies(page);
      return { results: data.results, total_pages: data.total_pages };
    }
    case 'sitcoms': {
      const data = await getSitcoms(page);
      return { results: data.results, total_pages: data.total_pages };
    }
    case 'anime':
      return getAnimeCombined(page);
    default:
      throw new Error('Invalid category');
  }
}