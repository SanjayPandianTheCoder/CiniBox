using CiniBoxService.Models;
using CiniBoxService.Utility;
using Microsoft.AspNetCore.Mvc.RazorPages;
using System.Text.Json;

namespace CiniBoxService.Service
{
    public interface ITMDBService
    {
        Task<PagedResult?> FetchPopularMovies(int page = 1);
        Task<PagedResult?> FetchNowPlaying(int page = 1);
        Task<PagedResult?> FetchTopRatedMovies(int page = 1);
        Task<Movie> FetchMovieByIdAsync(long id);
        Task<Credits> FetchMovieCastAndCrewAsync(long id);
        Task<PagedResult> FetchMovieRecomendationsOfMovie(long id);
        Task<MovieImages> FetchMovieImagesAsync(long id);
        Task<MovieReviews> FetchMovieReviewsAsync(long id);
        Task<DetailedMovie> FetchDetailedMovieAsync(long id);
    }

    public class TMDBService: ITMDBService
    {
        private readonly Helper _helper;
        private readonly string _tmbdUrl;
        private readonly string _tmdbKey;

        public TMDBService(Helper helper, IConfiguration configuration)
        {
            _helper = helper;
            _tmbdUrl = Convert.ToString(configuration["TMDB:Url"]) ?? "";
            _tmdbKey = Convert.ToString(configuration["TMDB:ApiKey"]) ?? "";
        }

        public async Task<PagedResult?> FetchPopularMovies(int page = 1)
        {
            try
            {
                if (page < 1)
                {
                    throw new Exception("Page must be greater than or equal to 1.");
                }

                var requestUrl = $"{_tmbdUrl}/movie/popular?api_key={_tmdbKey}&page={page}";
                using (var httpClient = new HttpClient())
                {
                    var apiResponse = await httpClient.GetAsync(requestUrl);
                    var apiResponseString = await apiResponse.Content.ReadAsStringAsync();
                    if (apiResponse.IsSuccessStatusCode)
                    {
                        var popularMovies = JsonSerializer.Deserialize<PagedResult>(apiResponseString);
                        return popularMovies;
                    }

                    throw new Exception(apiResponseString);
                }
            }
            catch (Exception ex) {
                throw new Exception(ex.Message);
            }
        }

        public async Task<PagedResult?> FetchTopRatedMovies(int page = 1)
        {
            try
            {
                if (page < 1)
                {
                    throw new Exception("Page must be greater than or equal to 1.");
                }

                var requestUrl = $"{_tmbdUrl}/movie/top_rated?api_key={_tmdbKey}&page={page}";
                using (var httpClient = new HttpClient())
                {
                    var apiResponse = await httpClient.GetAsync(requestUrl);
                    var apiResponseString = await apiResponse.Content.ReadAsStringAsync();
                    if (apiResponse.IsSuccessStatusCode)
                    {
                        var popularMovies = JsonSerializer.Deserialize<PagedResult>(apiResponseString);
                        return popularMovies;
                    }

                    throw new Exception(apiResponseString);
                }
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }

        public async Task<PagedResult?> FetchNowPlaying(int page = 1)
        {
            try
            {
                if (page < 1)
                {
                    throw new Exception("Page must be greater than or equal to 1.");
                }

                var requestUrl = $"{_tmbdUrl}/movie/now_playing?api_key={_tmdbKey}&page={page}";
                using (var httpClient = new HttpClient())
                {
                    var apiResponse = await httpClient.GetAsync(requestUrl);
                    var apiResponseString = await apiResponse.Content.ReadAsStringAsync();
                    if (apiResponse.IsSuccessStatusCode)
                    {
                        var popularMovies = JsonSerializer.Deserialize<PagedResult>(apiResponseString);
                        return popularMovies;
                    }

                    throw new Exception(apiResponseString);
                }
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }

        public async Task<Movie> FetchMovieByIdAsync(long id)
        {
            try
            {
                if (id < 1)
                {
                    throw new Exception("Movie Id need to be greater than 1");
                }

                var requestUrl = $"{_tmbdUrl}/movie/{id}?api_key={_tmdbKey}";
                using (var httpClient = new HttpClient())
                {
                    var apiResponse = await httpClient.GetAsync(requestUrl);
                    var apiResponseString = await apiResponse.Content.ReadAsStringAsync();
                    if (apiResponse.IsSuccessStatusCode)
                    {
                        var movie = JsonSerializer.Deserialize<Movie>(apiResponseString);
                        if(movie == null)
                        {
                            throw new Exception("Movie not exists or fetch error");
                        }

                        return movie;
                    }

                    throw new Exception(apiResponseString);
                }
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }

        public async Task<Credits> FetchMovieCastAndCrewAsync(long id)
        {
            try
            {
                if (id < 1)
                {
                    throw new Exception("Movie Id need to be greater than 1");
                }

                var requestUrl = $"{_tmbdUrl}/movie/{id}/credits?api_key={_tmdbKey}";
                using (var httpClient = new HttpClient())
                {
                    var apiResponse = await httpClient.GetAsync(requestUrl);
                    var apiResponseString = await apiResponse.Content.ReadAsStringAsync();
                    if (apiResponse.IsSuccessStatusCode)
                    {
                        var movieCredits = JsonSerializer.Deserialize<Credits>(apiResponseString);
                        if (movieCredits == null)
                        {
                            throw new Exception("Movie Credits not exists or fetch error");
                        }

                        return movieCredits;
                    }

                    throw new Exception(apiResponseString);
                }
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }

        public async Task<PagedResult> FetchMovieRecomendationsOfMovie(long id)
        {
            try
            {
                if (id < 1)
                {
                    throw new Exception("Movie Id need to be greater than 1");
                }

                var requestUrl = $"{_tmbdUrl}/movie/{id}/recommendations?api_key={_tmdbKey}";
                using (var httpClient = new HttpClient())
                {
                    var apiResponse = await httpClient.GetAsync(requestUrl);
                    var apiResponseString = await apiResponse.Content.ReadAsStringAsync();
                    if (apiResponse.IsSuccessStatusCode)
                    {
                        var recomendations = JsonSerializer.Deserialize<PagedResult>(apiResponseString);
                        if (recomendations == null)
                        {
                            throw new Exception("Movie Recommendations not exists or fetch error");
                        }

                        return recomendations;
                    }

                    throw new Exception(apiResponseString);
                }
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }

        public async Task<MovieImages> FetchMovieImagesAsync(long id)
        {
            try
            {
                if (id < 1)
                {
                    throw new Exception("Movie Id need to be greater than 1");
                }

                var requestUrl = $"{_tmbdUrl}/movie/{id}/images?api_key={_tmdbKey}";
                using (var httpClient = new HttpClient())
                {
                    var apiResponse = await httpClient.GetAsync(requestUrl);
                    var apiResponseString = await apiResponse.Content.ReadAsStringAsync();
                    if (apiResponse.IsSuccessStatusCode)
                    {
                        var movieImages = JsonSerializer.Deserialize<MovieImages>(apiResponseString);
                        if (movieImages == null)
                        {
                            throw new Exception("Movie Images not exists or fetch error");
                        }

                        return movieImages;
                    }

                    throw new Exception(apiResponseString);
                }
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }

        public async Task<MovieReviews> FetchMovieReviewsAsync(long id)
        {
            try
            {
                if (id < 1)
                {
                    throw new Exception("Movie Id need to be greater than 1");
                }

                var requestUrl = $"{_tmbdUrl}/movie/{id}/images?api_key={_tmdbKey}";
                using (var httpClient = new HttpClient())
                {
                    var apiResponse = await httpClient.GetAsync(requestUrl);
                    var apiResponseString = await apiResponse.Content.ReadAsStringAsync();
                    if (apiResponse.IsSuccessStatusCode)
                    {
                        var movieReviews = JsonSerializer.Deserialize<MovieReviews>(apiResponseString);
                        if (movieReviews == null)
                        {
                            throw new Exception("Movie Reviews not exists or fetch error");
                        }

                        return movieReviews;
                    }

                    throw new Exception(apiResponseString);
                }
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }

        public async Task<DetailedMovie> FetchDetailedMovieAsync(long id)
        {
            try
            {
                if (id < 1)
                {
                    throw new Exception("Movie Id need to be greater than 1");
                }

                var movieData = await FetchMovieByIdAsync(id);
                var castandcrewData = await FetchMovieCastAndCrewAsync(id);
                var recommendationsData = await FetchMovieRecomendationsOfMovie(id);
                var galleryData = await FetchMovieImagesAsync(id);
                var reviewsData = await FetchMovieReviewsAsync(id);

                var detailedMovie = new DetailedMovie();
                detailedMovie.MovieData = movieData;
                detailedMovie.CastAndCrew = castandcrewData;
                detailedMovie.Recommendations = recommendationsData;
                detailedMovie.Gallery = galleryData;
                detailedMovie.Reviews = reviewsData;

                return detailedMovie;
                
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }
    }
}
