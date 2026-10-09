using System.Net.Mail;
using CiniBoxService.Models;
using CiniBoxService.Utility;

namespace CiniBoxService.Service
{
    public interface IProfileService
    {
        /// <exception cref="KeyNotFoundException">The profile does not exist.</exception>
        /// <exception cref="InvalidDataException">The stored profile is corrupt.</exception>
        Task<Profile> GetProfileAsync();

        /// <exception cref="ArgumentException">The profile is invalid.</exception>
        /// <exception cref="KeyNotFoundException">The profile does not exist.</exception>
        Task UpdateProfileAsync(Profile profile);
    }
    public class ProfileService: IProfileService
    {
        private readonly IWebHostEnvironment _env;
        private readonly Helper _helper;
        private readonly ILogger<ProfileService> _logger;
        public ProfileService(IWebHostEnvironment env, Helper helper, ILogger<ProfileService> logger) {
            _env = env;
            _helper = helper;
            _logger = logger;
        }

        public async Task<Profile> GetProfileAsync()
        {
            var profilePath = getProfileParh();
            try
            {
                return await _helper.GetDataFromPath<Profile>(profilePath);
            }
            catch (FileNotFoundException ex)
            {
                _logger.LogWarning("Profile file is missing at {ProfilePath}", profilePath);
                throw new KeyNotFoundException("Profile not found.", ex);
            }
        }

        public async Task UpdateProfileAsync(Profile profile)
        {
            ValidateProfile(profile);

            var profilePath = getProfileParh();
            try
            {
                await _helper.WriteDataToPathAsync(profile, profilePath);
            }
            catch (FileNotFoundException ex)
            {
                _logger.LogWarning("Profile file is missing at {ProfilePath}", profilePath);
                throw new KeyNotFoundException("Profile not found.", ex);
            }
        }

        private static void ValidateProfile(Profile profile)
        {
            if (profile == null)
            {
                throw new ArgumentException("Profile cannot be null.");
            }

            var errors = new List<string>();

            if (string.IsNullOrWhiteSpace(profile.UserName))
            {
                errors.Add("UserName is required.");
            }

            if (string.IsNullOrWhiteSpace(profile.Name))
            {
                errors.Add("Name is required.");
            }

            if (string.IsNullOrWhiteSpace(profile.Email))
            {
                errors.Add("Email is required.");
            }
            else if (!MailAddress.TryCreate(profile.Email, out _))
            {
                errors.Add("Email is not valid.");
            }

            if (profile.DateOfBirth.HasValue && profile.DateOfBirth.Value > DateOnly.FromDateTime(DateTime.Today))
            {
                errors.Add("DateOfBirth cannot be in the future.");
            }

            if (errors.Count > 0)
            {
                throw new ArgumentException(string.Join(" ", errors));
            }
        }

        private string getProfileParh()
        {
            return Path.Combine(_env.ContentRootPath, "Data", "profile.json");
        }
    }
}
