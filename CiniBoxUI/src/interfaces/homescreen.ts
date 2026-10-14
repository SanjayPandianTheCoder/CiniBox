export interface ResultsItem {
  id: number;
  title: string;
  original_title: string;
  overview: string;
  poster_path: string;
  backdrop_path: string;
  release_date: string;
  original_language: string;
  genre_ids: any[];
  popularity: number;
  vote_average: number;
  vote_count: number;
  adult: boolean;
  video: boolean;
}

export interface PopularMovies {
  page: number;
  results: ResultsItem[];
  total_pages: number;
  total_results: number;
}

export interface ResultsItem {
  id: number;
  title: string;
  original_title: string;
  overview: string;
  poster_path: string;
  backdrop_path: string;
  release_date: string;
  original_language: string;
  genre_ids: any[];
  popularity: number;
  vote_average: number;
  vote_count: number;
  adult: boolean;
  video: boolean;
}

export interface NowPlayingMovies {
  page: number;
  results: ResultsItem[];
  total_pages: number;
  total_results: number;
}

export interface ResultsItem {
  id: number;
  title: string;
  original_title: string;
  overview: string;
  poster_path: string;
  backdrop_path: string;
  release_date: string;
  original_language: string;
  genre_ids: any[];
  popularity: number;
  vote_average: number;
  vote_count: number;
  adult: boolean;
  video: boolean;
}

export interface TopRatedMovies {
  page: number;
  results: ResultsItem[];
  total_pages: number;
  total_results: number;
}

export interface HomeData {
  popularMovies: PopularMovies;
  nowPlayingMovies: NowPlayingMovies;
  topRatedMovies: TopRatedMovies;
}

export interface Root {
  message: string;
  success: boolean;
  data: HomeData;
}