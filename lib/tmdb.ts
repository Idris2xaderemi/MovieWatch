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

export interface TVDetail {
  id: number;
  name: string;
  poster_path: string | null;
  backdrop_path: string | null;
  first_air_date: string;
  vote_average: number;
  overview: string;
  popularity: number;
  genre_ids: number[];
  origin_country?: string[];
  original_language?: string;
  media_type?: 'tv';
  number_of_seasons: number;
  number_of_episodes: number;
  genres: { id: number; name: string }[];
  credits: { cast: { name: string; character: string }[] };
}

export interface TMDBResponse {
  page: number;
  results: Movie[];
  total_pages: number;
  total_results: number;
}

// ---------- Core fetch with retry and timeout ----------
async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeout = 15000
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const res = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return res;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

async function fetchTMDB<T = TMDBResponse>(
  endpoint: string,
  options?: RequestInit,
  retries = 2
): Promise<T> {
  const url = `${BASE_URL}${endpoint}`;
  const headers = {
    Authorization: `Bearer ${API_TOKEN}`,
    'Content-Type': 'application/json',
  };

  let lastError: Error | undefined;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetchWithTimeout(
        url,
        {
          headers,
          next: { revalidate: 3600 },
          ...options,
        },
        15000
      );

      if (!res.ok) {
        const errorText = await res.text();
        if (res.status !== 404 && res.status !== 401) {
          console.error(`TMDB error ${res.status}: ${errorText}`);
        }
        if (res.status === 404 || res.status === 401) {
          throw new Error(`TMDB error: ${res.status}`);
        }
        throw new Error(`TMDB error: ${res.status}`);
      }

      return await res.json();
    } catch (error: any) {
      lastError = error;
      if (attempt === retries) break;
      if (error.message?.includes('404') || error.message?.includes('401')) {
        throw error;
      }
      console.warn(`TMDB fetch attempt ${attempt + 1} failed, retrying...`);
      await new Promise((resolve) =>
        setTimeout(resolve, 1000 * Math.pow(2, attempt))
      );
    }
  }

  throw lastError || new Error('TMDB fetch failed after retries');
}

// ---------- Movie Fetchers ----------
export async function getTrending(page = 1): Promise<TMDBResponse> {
  return fetchTMDB(`/trending/all/day?page=${page}`);
}

export async function getPopularMovies(page = 1): Promise<TMDBResponse> {
  return fetchTMDB(`/movie/popular?page=${page}`);
}

export async function getTopRatedMovies(page = 1): Promise<TMDBResponse> {
  return fetchTMDB(`/movie/top_rated?page=${page}`);
}

export async function getActionMovies(page = 1): Promise<TMDBResponse> {
  return fetchTMDB(`/discover/movie?with_genres=28&page=${page}`);
}

export async function getComedyMovies(page = 1): Promise<TMDBResponse> {
  return fetchTMDB(`/discover/movie?with_genres=35&page=${page}`);
}

export async function getAnimeMovies(page = 1): Promise<TMDBResponse> {
  return fetchTMDB(`/discover/movie?with_genres=16&page=${page}`);
}

// ---------- TV Fetchers ----------
export async function getPopularTV(page = 1): Promise<TMDBResponse> {
  return fetchTMDB(`/tv/popular?page=${page}`);
}

export async function getTopRatedTV(page = 1): Promise<TMDBResponse> {
  return fetchTMDB(`/tv/top_rated?page=${page}`);
}

export async function getAnimeTV(page = 1): Promise<TMDBResponse> {
  return fetchTMDB(`/discover/tv?with_genres=16&page=${page}`);
}

export async function getSitcoms(page = 1): Promise<TMDBResponse> {
  return fetchTMDB(`/discover/tv?with_genres=35&page=${page}`);
}

// ---------- Movie Details ----------
export async function getMovieDetails(id: string) {
  try {
    return await fetchTMDB<MovieDetail>(`/movie/${id}?append_to_response=credits`);
  } catch (error: any) {
    if (error.message?.includes('404')) {
      return null;
    }
    throw error;
  }
}

export async function getMovieWatchProviders(id: string) {
  try {
    return await fetchTMDB<{ results: { [country: string]: any } }>(`/movie/${id}/watch/providers`);
  } catch {
    return null;
  }
}

// ---------- TV Details ----------
export async function getTVDetails(id: string): Promise<TVDetail | null> {
  try {
    return await fetchTMDB<TVDetail>(`/tv/${id}?append_to_response=credits`);
  } catch (error: any) {
    if (error.message?.includes('404')) {
      return null;
    }
    throw error;
  }
}

export async function getTVWatchProviders(id: string) {
  try {
    return await fetchTMDB<{ results: { [country: string]: any } }>(`/tv/${id}/watch/providers`);
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
  const [movies, tv] = await Promise.all([
    getPopularMovies(page),
    getPopularTV(page),
  ]);
  const combined = [...movies.results, ...tv.results]
    .sort((a, b) => b.popularity - a.popularity)
    .slice(0, 20);
  return {
    results: combined,
    total_pages: Math.max(movies.total_pages || 1, tv.total_pages || 1),
  };
}

export async function getTopRatedCombined(page = 1): Promise<{ results: Movie[]; total_pages: number }> {
  const [movies, tv] = await Promise.all([
    getTopRatedMovies(page),
    getTopRatedTV(page),
  ]);
  const combined = [...movies.results, ...tv.results]
    .sort((a, b) => b.vote_average - a.vote_average)
    .slice(0, 20);
  return {
    results: combined,
    total_pages: Math.max(movies.total_pages || 1, tv.total_pages || 1),
  };
}

export async function getAnimeCombined(page = 1): Promise<{ results: Movie[]; total_pages: number }> {
  const [movies, tv] = await Promise.all([
    getAnimeMovies(page),
    getAnimeTV(page),
  ]);
  const combined = [...movies.results, ...tv.results]
    .sort((a, b) => b.popularity - a.popularity)
    .slice(0, 20);
  return {
    results: combined,
    total_pages: Math.max(movies.total_pages || 1, tv.total_pages || 1),
  };
}

// ---------- Category dispatcher (FINAL VERSION) ----------
export async function getCategoryBySlug(
  slug: string,
  page = 1
): Promise<{ results: Movie[]; total_pages: number }> {
  // Debug: log the slug so we can see what's being passed
  console.log('🔍 getCategoryBySlug called with slug:', slug);

  const fetchers: Record<string, (page: number) => Promise<TMDBResponse>> = {
    'popular-movies': getPopularMovies,
    'action-movies': getActionMovies,
    'comedy-movies': getComedyMovies,
    'animations': getAnimeMovies,
    'top-rated-series': getTopRatedTV,
    'anime-series': getAnimeTV,
    'sitcoms': getSitcoms,
  };

  const fetcher = fetchers[slug];
  if (!fetcher) {
    console.warn(`❌ Unknown category slug: "${slug}" – returning empty results`);
    return { results: [], total_pages: 0 };
  }

  try {
    const data = await fetcher(page);
    return { results: data.results, total_pages: data.total_pages };
  } catch (error) {
    console.error(`Error fetching category ${slug}:`, error);
    return { results: [], total_pages: 0 };
  }
}