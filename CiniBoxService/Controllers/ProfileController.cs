using CiniBoxService.Service;
using Microsoft.AspNetCore.Mvc;
using CiniBoxService.Models;
using CiniBoxService.Utility;

namespace CiniBoxService.Controllers
{
    [ApiController]
    public class ProfileController : ControllerBase
    {
        private readonly IProfileService _profileService;
        private readonly ILogger<ProfileController> _logger;
        private readonly Helper _helper;
        public ProfileController(IProfileService profileService, ILogger<ProfileController> logger, Helper helper)
        {
            _profileService = profileService;
            _logger = logger;
            _helper = helper;
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
                return NotFound(_helper.ErrorResponse(ex.Message));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unable to fetch profile");
                return StatusCode(StatusCodes.Status500InternalServerError, _helper.ErrorResponse("Unable to fetch profile"));
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
                return BadRequest(_helper.ErrorResponse(ex.Message));
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(_helper.ErrorResponse(ex.Message));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unable to update profile");
                return StatusCode(StatusCodes.Status500InternalServerError, _helper.ErrorResponse("Unable to update profile"));
            }
        }

        [HttpPut]
        [Route("profile/picture")]
        [Consumes("multipart/form-data")]
        [RequestSizeLimit(ProfileService.MaxProfilePictureBytes + 1024 * 1024)]
        public async Task<IActionResult> UpdateProfilePicture(IFormFile? file)
        {
            try
            {
                if (file == null)
                {
                    return BadRequest(_helper.ErrorResponse("Profile picture is required."));
                }

                var profile = await _profileService.UpdateProfilePictureAsync(file);

                return Ok(new Response()
                {
                    data = profile,
                    Message = "Profile picture updated successfully",
                    Success = true
                });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(_helper.ErrorResponse(ex.Message));
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(_helper.ErrorResponse(ex.Message));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unable to update profile picture");
                return StatusCode(StatusCodes.Status500InternalServerError, _helper.ErrorResponse("Unable to update profile picture"));
            }
        }

        [HttpDelete]
        [Route("profile/picture")]
        public async Task<IActionResult> RemoveProfilePicture()
        {
            try
            {
                var profile = await _profileService.RemoveProfilePictureAsync();

                return Ok(new Response()
                {
                    data = profile,
                    Message = "Profile picture removed successfully",
                    Success = true
                });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(_helper.ErrorResponse(ex.Message));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unable to remove profile picture");
                return StatusCode(StatusCodes.Status500InternalServerError, _helper.ErrorResponse("Unable to remove profile picture"));
            }
        }

        [HttpGet]
        [Route("profile/picture/{fileName}")]
        public IActionResult GetProfilePicture(string fileName)
        {
            try
            {
                var (filePath, contentType) = _profileService.GetProfilePictureFile(fileName);
                return PhysicalFile(filePath, contentType);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(_helper.ErrorResponse(ex.Message));
            }
        }
    }
}
