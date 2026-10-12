using System.Text.Json.Serialization;

namespace CiniBoxService.Models
{
    public class MovieImages
    {
        [JsonPropertyName("id")]
        public long Id { get; set; }

        [JsonPropertyName("backdrops")]
        public List<MovieImage> BackDrops { get; set; } = new List<MovieImage>();

        [JsonPropertyName("logos")]
        public List<MovieImage> Logos { get; set; } = new List<MovieImage>();

        [JsonPropertyName("posters")]
        public List<MovieImage> Posters { get; set; } = new List<MovieImage>();
    }

    public class MovieImage
    {
        [JsonPropertyName("aspect_ratio")]
        public double AspectRatio { get; set; }

        [JsonPropertyName("height")]
        public int Height { get; set; }

        [JsonPropertyName("iso_3166_1")]
        public string? CountryCode { get; set; }

        [JsonPropertyName("iso_639_1")]
        public string? LanguageCode { get; set; }

        [JsonPropertyName("file_path")]
        public string FilePath { get; set; } = string.Empty;

        [JsonPropertyName("vote_average")]
        public double VoteAverage { get; set; }

        [JsonPropertyName("vote_count")]
        public int VoteCount { get; set; }

        [JsonPropertyName("width")]
        public int Width { get; set; }
    }
}
