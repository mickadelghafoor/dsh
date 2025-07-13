const API_KEY = env.process;
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

const options = {
  method: 'GET',
  headers: {
    accept: 'application/json'
  }
};

export interface Movie {
  id: number;
  title: string;
  overview: string;
  poster_path: string;
  backdrop_path: string;
  release_date: string;
  vote_average: number;
  vote_count: number;
  genre_ids: number[];
  adult: boolean;
  original_language: string;
  original_title: string;
  popularity: number;
  video: boolean;
}

export interface MovieResponse {
  page: number;
  results: Movie[];
  total_pages: number;
  total_results: number;
}

export interface Genre {
  id: number;
  name: string;
}

export interface CastMember {
  id: number;
  name: string;
  character: string;
  profile_path: string;
  popularity: number;
  known_for_department: string;
}

export interface CrewMember {
  id: number;
  name: string;
  job: string;
  department: string;
  profile_path: string;
}

export interface Credits {
  cast: CastMember[];
  crew: CrewMember[];
}

export interface Person {
  id: number;
  name: string;
  biography: string;
  birthday: string;
  place_of_birth: string;
  profile_path: string;
  known_for_department: string;
  popularity: number;
}

export const tmdbApi = {
  // Get trending movies
  getTrending: async (): Promise<MovieResponse> => {
    const response = await fetch(`${BASE_URL}/trending/movie/week?api_key=${API_KEY}`, options);
    if (!response.ok) throw new Error('Failed to fetch trending movies');
    return response.json();
  },

  // Get popular movies
  getPopular: async (page: number = 1): Promise<MovieResponse> => {
    const response = await fetch(`${BASE_URL}/movie/popular?api_key=${API_KEY}&page=${page}`, options);
    if (!response.ok) throw new Error('Failed to fetch popular movies');
    return response.json();
  },

  // Get top rated movies
  getTopRated: async (page: number = 1): Promise<MovieResponse> => {
    const response = await fetch(`${BASE_URL}/movie/top_rated?api_key=${API_KEY}&page=${page}`, options);
    if (!response.ok) throw new Error('Failed to fetch top rated movies');
    return response.json();
  },

  // Get now playing movies
  getNowPlaying: async (page: number = 1): Promise<MovieResponse> => {
    const response = await fetch(`${BASE_URL}/movie/now_playing?api_key=${API_KEY}&page=${page}`, options);
    if (!response.ok) throw new Error('Failed to fetch now playing movies');
    return response.json();
  },

  // Search movies
  searchMovies: async (query: string, page: number = 1): Promise<MovieResponse> => {
    const encodedQuery = encodeURIComponent(query);
    const response = await fetch(`${BASE_URL}/search/movie?api_key=${API_KEY}&query=${encodedQuery}&page=${page}`, options);
    if (!response.ok) throw new Error('Failed to search movies');
    return response.json();
  },

  // Get movie details
  getMovieDetails: async (movieId: number) => {
    const response = await fetch(`${BASE_URL}/movie/${movieId}?api_key=${API_KEY}`, options);
    if (!response.ok) throw new Error('Failed to fetch movie details');
    return response.json();
  },

  // Get movie credits (cast and crew)
  getMovieCredits: async (movieId: number): Promise<Credits> => {
    const response = await fetch(`${BASE_URL}/movie/${movieId}/credits?api_key=${API_KEY}`, options);
    if (!response.ok) throw new Error('Failed to fetch movie credits');
    return response.json();
  },

  // Get person details
  getPersonDetails: async (personId: number): Promise<Person> => {
    const response = await fetch(`${BASE_URL}/person/${personId}?api_key=${API_KEY}`, options);
    if (!response.ok) throw new Error('Failed to fetch person details');
    return response.json();
  },

  // Get person movie credits
  getPersonMovieCredits: async (personId: number): Promise<{ cast: Movie[]; crew: Movie[] }> => {
    const response = await fetch(`${BASE_URL}/person/${personId}/movie_credits?api_key=${API_KEY}`, options);
    if (!response.ok) throw new Error('Failed to fetch person movie credits');
    return response.json();
  },

  // Get movie genres
  getGenres: async (): Promise<{ genres: Genre[] }> => {
    const response = await fetch(`${BASE_URL}/genre/movie/list?api_key=${API_KEY}`, options);
    if (!response.ok) throw new Error('Failed to fetch genres');
    return response.json();
  },

  // Get movies by genre
  getMoviesByGenre: async (genreId: number, page: number = 1): Promise<MovieResponse> => {
    const response = await fetch(`${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=${genreId}&page=${page}`, options);
    if (!response.ok) throw new Error('Failed to fetch movies by genre');
    return response.json();
  },

  // Helper function to get full image URL
  getImageUrl: (path: string, size: string = 'w500') => {
    return path ? `https://image.tmdb.org/t/p/${size}${path}` : null;
  },

  // Helper function to get backdrop URL
  getBackdropUrl: (path: string, size: string = 'w1280') => {
    return path ? `https://image.tmdb.org/t/p/${size}${path}` : null;
  }
};
