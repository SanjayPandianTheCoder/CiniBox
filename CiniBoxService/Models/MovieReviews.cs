using System.Text.Json.Serialization;

namespace CiniBoxService.Models
{
    public class MovieReviews
    {
        [JsonPropertyName("id")]
        public long Id { get; set; }

        [JsonPropertyName("page")]
        public long Page { get; set; }

        [JsonPropertyName("results")]
        public List<MovieReview> Reviews { get; set; } = new List<MovieReview>();

        [JsonPropertyName("total_pages")]
        public long TotalPages { get; set; }

        [JsonPropertyName("total_results")]
        public long TotalResults { get; set; }

    }

    public class MovieReview
    {
        [JsonPropertyName("author")]
        public string Author { get; set; } = string.Empty;

        [JsonPropertyName("author_details")]
        public ReviewAuthorDetails AuthorDetails { get; set; } = new();

        [JsonPropertyName("content")]
        public string Content { get; set; } = string.Empty;

        [JsonPropertyName("created_at")]
        public DateTime CreatedAt { get; set; }

        [JsonPropertyName("id")]
        public string Id { get; set; } = string.Empty;

        [JsonPropertyName("updated_at")]
        public DateTime UpdatedAt { get; set; }

        [JsonPropertyName("url")]
        public string Url { get; set; } = string.Empty;
    }

    public class ReviewAuthorDetails
    {
        [JsonPropertyName("name")]
        public string Name { get; set; } = string.Empty;

        [JsonPropertyName("username")]
        public string Username { get; set; } = string.Empty;

        [JsonPropertyName("avatar_path")]
        public string? AvatarPath { get; set; }

        [JsonPropertyName("rating")]
        public double? Rating { get; set; }
    }
}
