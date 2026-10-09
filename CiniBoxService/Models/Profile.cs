namespace CiniBoxService.Models
{
    public class Profile
    {
        public string UserName { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string PhoneNumber { get; set; } = string.Empty;
        public string? ProfilePicture { get; set; }
        public string? Bio { get; set; }
        public DateOnly? DateOfBirth { get; set; }
        public string Country { get; set; } = "India";
    }
}
