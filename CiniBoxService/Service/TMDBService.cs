using CiniBoxService.Models;
using CiniBoxService.Utility;
using System.Text.Json;

namespace CiniBoxService.Service
{
    public interface ITMDBService
    {
        Task<PagedResult?> FetchPopularMovies(int page = 1);
        Task<PagedResult?> FetchNowPlaying(int page = 1);
        Task<PagedResult?> FetchTopRatedMovies(int page = 1);
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
    }
}
