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

        /// <exception cref="ArgumentException">The image is missing, too large or not a supported format.</exception>
        /// <exception cref="KeyNotFoundException">The profile does not exist.</exception>
        Task<Profile> UpdateProfilePictureAsync(IFormFile file);

        /// <exception cref="KeyNotFoundException">The profile does not exist.</exception>
        Task<Profile> RemoveProfilePictureAsync();

        /// <exception cref="KeyNotFoundException">The picture does not exist.</exception>
        (string FilePath, string ContentType) GetProfilePictureFile(string fileName);
    }
    public class ProfileService: IProfileService
    {
        public const long MaxProfilePictureBytes = 5 * 1024 * 1024;
        private const string ProfilePictureRoute = "profile/picture";

        // Image type is detected from the file's leading bytes, never from the client's file name or content type.
        private static readonly Dictionary<string, string> ProfilePictureContentTypes = new()
        {
            [".jpg"] = "image/jpeg",
            [".png"] = "image/png",
            [".webp"] = "image/webp",
        };

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

            // The picture is only changed through the picture endpoints, so keep the stored value.
            var existingProfile = await GetProfileAsync();
            profile.ProfilePicture = existingProfile.ProfilePicture;

            await SaveProfileAsync(profile);
        }

        public async Task<Profile> UpdateProfilePictureAsync(IFormFile file)
        {
            if (file == null || file.Length == 0)
            {
                throw new ArgumentException("Profile picture is required.");
            }

            if (file.Length > MaxProfilePictureBytes)
            {
                throw new ArgumentException($"Profile picture must be {MaxProfilePictureBytes / (1024 * 1024)} MB or smaller.");
            }

            var extension = await DetectImageExtensionAsync(file);
            if (extension == null)
            {
                throw new ArgumentException("Profile picture must be a JPEG, PNG or WEBP image.");
            }

            var profile = await GetProfileAsync();

            var picturesDirectory = getProfilePicturesDirectory();
            Directory.CreateDirectory(picturesDirectory);

            var fileName = $"{Guid.NewGuid():N}{extension}";
            var filePath = Path.Combine(picturesDirectory, fileName);

            await using (var fileStream = new FileStream(filePath, FileMode.CreateNew))
            {
                await file.CopyToAsync(fileStream);
            }

            var previousPicture = profile.ProfilePicture;
            profile.ProfilePicture = $"{ProfilePictureRoute}/{fileName}";

            try
            {
                await SaveProfileAsync(profile);
            }
            catch
            {
                DeletePictureFile(filePath);
                throw;
            }

            DeleteStoredPicture(previousPicture);

            return profile;
        }

        public async Task<Profile> RemoveProfilePictureAsync()
        {
            var profile = await GetProfileAsync();
            var previousPicture = profile.ProfilePicture;

            if (previousPicture == null)
            {
                return profile;
            }

            profile.ProfilePicture = null;
            await SaveProfileAsync(profile);

            DeleteStoredPicture(previousPicture);

            return profile;
        }

        public (string FilePath, string ContentType) GetProfilePictureFile(string fileName)
        {
            var extension = Path.GetExtension(fileName ?? string.Empty).ToLowerInvariant();

            if (!IsGeneratedPictureFileName(fileName) || !ProfilePictureContentTypes.TryGetValue(extension, out var contentType))
            {
                throw new KeyNotFoundException("Profile picture not found.");
            }

            var filePath = Path.Combine(getProfilePicturesDirectory(), fileName!);
            if (!File.Exists(filePath))
            {
                throw new KeyNotFoundException("Profile picture not found.");
            }

            return (filePath, contentType);
        }

        private async Task SaveProfileAsync(Profile profile)
        {
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

        private static async Task<string?> DetectImageExtensionAsync(IFormFile file)
        {
            var header = new byte[12];
            int bytesRead;

            await using (var stream = file.OpenReadStream())
            {
                bytesRead = await stream.ReadAtLeastAsync(header, header.Length, throwOnEndOfStream: false);
            }

            if (bytesRead >= 3 && header[0] == 0xFF && header[1] == 0xD8 && header[2] == 0xFF)
            {
                return ".jpg";
            }

            if (bytesRead >= 8 && header.AsSpan(0, 8).SequenceEqual(new byte[] { 0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A }))
            {
                return ".png";
            }

            if (bytesRead >= 12 && header.AsSpan(0, 4).SequenceEqual("RIFF"u8) && header.AsSpan(8, 4).SequenceEqual("WEBP"u8))
            {
                return ".webp";
            }

            return null;
        }

        private void DeleteStoredPicture(string? picture)
        {
            if (string.IsNullOrEmpty(picture) || !picture.StartsWith($"{ProfilePictureRoute}/"))
            {
                return;
            }

            var fileName = picture[(ProfilePictureRoute.Length + 1)..];
            if (!IsGeneratedPictureFileName(fileName))
            {
                return;
            }

            DeletePictureFile(Path.Combine(getProfilePicturesDirectory(), fileName));
        }

        private void DeletePictureFile(string filePath)
        {
            try
            {
                File.Delete(filePath);
            }
            catch (IOException ex)
            {
                _logger.LogWarning(ex, "Unable to delete profile picture at {FilePath}", filePath);
            }
            catch (UnauthorizedAccessException ex)
            {
                _logger.LogWarning(ex, "Unable to delete profile picture at {FilePath}", filePath);
            }
        }

        // Only names this service generated (32 hex chars + known extension) are ever read or deleted,
        // which also rules out path traversal through the file name.
        private static bool IsGeneratedPictureFileName(string? fileName)
        {
            if (string.IsNullOrEmpty(fileName))
            {
                return false;
            }

            var name = Path.GetFileNameWithoutExtension(fileName);
            var extension = Path.GetExtension(fileName).ToLowerInvariant();

            return name.Length == 32
                && name.All(Uri.IsHexDigit)
                && ProfilePictureContentTypes.ContainsKey(extension)
                && fileName == $"{name}{extension}";
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

        private string getProfilePicturesDirectory()
        {
            return Path.Combine(_env.ContentRootPath, "Data", "ProfilePictures");
        }
    }
}
