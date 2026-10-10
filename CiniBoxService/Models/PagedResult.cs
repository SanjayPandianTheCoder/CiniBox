using System.Text.Json.Serialization;

namespace CiniBoxService.Models
{
    public class PagedResult
    {
        [JsonPropertyName("page")]
        public int Page { get; set; }

        [JsonPropertyName("results")]
        public List<PagedResultMovie> Results { get; set; } = [];

        [JsonPropertyName("total_pages")]
        public int TotalPages { get; set; }

        [JsonPropertyName("total_results")]
        public int TotalResults { get; set; }
    }

    public class PagedResultMovie
    {
        [JsonPropertyName("id")]
        public int Id { get; set; }

        [JsonPropertyName("title")]
        public string Title { get; set; } = string.Empty;

        [JsonPropertyName("original_title")]
        public string OriginalTitle { get; set; } = string.Empty;

        [JsonPropertyName("overview")]
        public string Overview { get; set; } = string.Empty;

        [JsonPropertyName("poster_path")]
        public string? PosterPath { get; set; }

        [JsonPropertyName("backdrop_path")]
        public string? BackdropPath { get; set; }

        [JsonPropertyName("release_date")]
        public string? ReleaseDate { get; set; }

        [JsonPropertyName("original_language")]
        public string OriginalLanguage { get; set; } = string.Empty;

        [JsonPropertyName("genre_ids")]
        public List<int> GenreIds { get; set; } = [];

        [JsonPropertyName("popularity")]
        public double Popularity { get; set; }

        [JsonPropertyName("vote_average")]
        public double VoteAverage { get; set; }

        [JsonPropertyName("vote_count")]
        public int VoteCount { get; set; }

        [JsonPropertyName("adult")]
        public bool Adult { get; set; }

        [JsonPropertyName("video")]
        public bool Video { get; set; }
    }
}
