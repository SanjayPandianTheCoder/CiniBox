using CiniBoxService.Models;
using CiniBoxService.Service;
using CiniBoxService.Utility;
using Microsoft.AspNetCore.Mvc;

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
    }
}
