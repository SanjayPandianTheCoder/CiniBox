using CiniBoxService.Service;
using Microsoft.AspNetCore.Mvc;
using CiniBoxService.Models;

namespace CiniBoxService.Controllers
{
    [ApiController]
    public class ProfileController : ControllerBase
    {
        private readonly IProfileService _profileService;
        private readonly ILogger<ProfileController> _logger;
        public ProfileController(IProfileService profileService, ILogger<ProfileController> logger)
        {
            _profileService = profileService;
            _logger = logger;
        }

        [HttpGet]
        [Route("profile")]
        public async Task<IActionResult> GetProfile()
        {
            try
            {
                var profileContent = await _profileService.GetProfileAsync();

                return Ok(new Response()
                {
                    data = profileContent,
                    Message = "Profile fetched successfully",
                    Success = true
                });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ErrorResponse(ex.Message));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unable to fetch profile");
                return StatusCode(StatusCodes.Status500InternalServerError, ErrorResponse("Unable to fetch profile"));
            }
        }

        [HttpPut]
        [Route("profile")]
        public async Task<IActionResult> UpdateProfile([FromBody] Profile profile)
        {
            try
            {
                await _profileService.UpdateProfileAsync(profile);

                return Ok(new Response()
                {
                    data = profile,
                    Message = "Profile updated successfully",
                    Success = true
                });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ErrorResponse(ex.Message));
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ErrorResponse(ex.Message));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unable to update profile");
                return StatusCode(StatusCodes.Status500InternalServerError, ErrorResponse("Unable to update profile"));
            }
        }

        private static Response ErrorResponse(string message)
        {
            return new Response()
            {
                data = null,
                Message = message,
                Success = false
            };
        }
    }
}
