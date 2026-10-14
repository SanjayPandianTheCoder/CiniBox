using CiniBoxService.Models;
using CiniBoxService.Service;
using CiniBoxService.Utility;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace CiniBoxService.Controllers
{
    [ApiController]
    public class TMDBController: ControllerBase
    {
        private readonly Helper _helper;
        private readonly ITMDBService _tmdbService;
        public TMDBController(Helper helper, ITMDBService tmbdService) { 
            _helper = helper;
            _tmdbService = tmbdService;
        }

        [HttpGet]
        [Route("movie/popular/{page}")]
        public async Task<IActionResult> FetchPopularMovies(int page)
        {
            try
            {
                var data = await _tmdbService.FetchPopularMovies(page);

                return Ok(new Response()
                {
                    data = data,
                    Message = "Popular movies fetched successfully",
                    Success = true
                });
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, _helper.ErrorResponse("Unable to fetch popular movies"));
            }
        }

        [HttpGet]
        [Route("movie/toprated/{page}")]
        public async Task<IActionResult> FetchTopRatedMovies(int page)
        {
            try
            {
                var data = await _tmdbService.FetchTopRatedMovies(page);

                return Ok(new Response()
                {
                    data = data,
                    Message = "Popular movies fetched successfully",
                    Success = true
                });
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, _helper.ErrorResponse("Unable to fetch popular movies"));
            }
        }

        [HttpGet]
        [Route("movie/nowplaying/{page}")]
        public async Task<IActionResult> FetchNowPlayingMovies(int page)
        {
            try
            {
                var data = await _tmdbService.FetchNowPlaying(page);

                return Ok(new Response()
                {
                    data = data,
                    Message = "Popular movies fetched successfully",
                    Success = true
                });
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, _helper.ErrorResponse("Unable to fetch popular movies"));
            }
        }

        [HttpGet]
        [Route("movie/{id}")]
        public async Task<IActionResult> FetchMovieByID(long id)
        {
            try
            {
                var data = await _tmdbService.FetchMovieByIdAsync(id);

                return Ok(new Response()
                {
                    data = data,
                    Message = $"Movie: {data.Title} fetched successfully",
                    Success = true
                });
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, _helper.ErrorResponse("Unable to fetch Movie"));
            }
        }

        [HttpGet]
        [Route("moviecredits/{id}")]
        public async Task<IActionResult> FetchMovieCreditsById(long id)
        {
            try
            {
                var data = await _tmdbService.FetchMovieCastAndCrewAsync(id);

                return Ok(new Response()
                {
                    data = data,
                    Message = $"Movie Credits fetched succeessfully",
                    Success = true
                });
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, _helper.ErrorResponse("Unable to fetch Movie Credits"));
            }
        }

        [HttpGet]
        [Route("movierecommendations/{id}")]
        public async Task<IActionResult> FetchMovieRecommendationssById(long id)
        {
            try
            {
                var data = await _tmdbService.FetchMovieRecomendationsOfMovie(id);

                return Ok(new Response()
                {
                    data = data,
                    Message = $"Movie Recommendations fetched succeessfully",
                    Success = true
                });
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, _helper.ErrorResponse("Unable to fetch Movie Recommendations"));
            }
        }

        [HttpGet]
        [Route("movieimages/{id}")]
        public async Task<IActionResult> FetchMovieGallery(long id)
        {
            try
            {
                var data = await _tmdbService.FetchMovieImagesAsync(id);

                return Ok(new Response()
                {
                    data = data,
                    Message = $"Movie Gallery fetched succeessfully",
                    Success = true
                });
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, _helper.ErrorResponse("Unable to fetch Movie Gallery"));
            }
        }

        [HttpGet]
        [Route("moviereviews/{id}")]
        public async Task<IActionResult> FetchMovieReviews(long id)
        {
            try
            {
                var data = await _tmdbService.FetchMovieReviewsAsync(id);

                return Ok(new Response()
                {
                    data = data,
                    Message = $"Movie Reviews fetched succeessfully",
                    Success = true
                });
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, _helper.ErrorResponse("Unable to fetch Movie Reviews"));
            }
        }

        [HttpGet]
        [Route("detailedmovie/{id}")]
        public async Task<IActionResult> FetchDetailedMovie(long id)
        {
            try
            {
                var data = await _tmdbService.FetchDetailedMovieAsync(id);

                return Ok(new Response()
                {
                    data = data,
                    Message = $"Movie fetched succeessfully",
                    Success = true
                });
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, _helper.ErrorResponse("Unable to fetch Movie"));
            }

        }

        [HttpGet]
        [Route("homedata")]
        public async Task<IActionResult> FetchHomeData()
        {
            try
            {
                var data = await _tmdbService.GetHomeDataAsync();

                return Ok(new Response()
                {
                    data = data,
                    Message = $"Home Data fetched succeessfully",
                    Success = true
                });
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, _helper.ErrorResponse("Unable to fetch Home Data"));
            }
        }
    }
}
