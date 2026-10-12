using System.Text.Json.Serialization;

namespace CiniBoxService.Models
{
    public class Movie
    {
        [JsonPropertyName("id")]
        public long Id { get; set; }

        [JsonPropertyName("title")]
        public string Title { get; set; } = string.Empty;

        [JsonPropertyName("adult")]
        public bool Adult { get; set; }

        [JsonPropertyName("backdrop_path")]
        public string BackdropPath { get; set; } = string.Empty;

        [JsonPropertyName("belongs_to_collection")]
        public BelongsToCollectionModel? BelongsToCollection { get; set; }

        [JsonPropertyName("budget")]
        public long Budget { get; set; }

        [JsonPropertyName("genres")]
        public List<GenreModel> Genres { get; set; } = new List<GenreModel>();

        [JsonPropertyName("homepage")]
        public string Homepage { get; set; } = string.Empty;

        [JsonPropertyName("imdb_id")]
        public string IMDBId { get; set; } = string.Empty;

        [JsonPropertyName("origin_country")]
        public List<string> OriginCountry { get; set; } = new List<string>();

        [JsonPropertyName("original_language")]
        public string OriginalLanguage {  get; set; } = string.Empty;

        [JsonPropertyName("original_title")]
        public string OriginalTitle { get; set; } = string.Empty;

        [JsonPropertyName("overview")]
        public string Overview { get; set; } = string.Empty;

        [JsonPropertyName("popularity")]
        public double Popularity { get; set; }

        [JsonPropertyName("poster_path")]
        public string PosterPath { get; set; } = string.Empty;

        [JsonPropertyName("production_companies")]
        public List<ProductionCompany> productionCompanies { get; set; } = new List<ProductionCompany>();

        [JsonPropertyName("production_countries")]
        public List<ProductionCountry> productionCountries { get; set; } = new List<ProductionCountry>();

        [JsonPropertyName("release_date")]
        public string ReleaseDate { get; set; } = string.Empty;

        [JsonPropertyName("revenue")]
        public long Revenue { get; set; }

        [JsonPropertyName("runtime")]
        public long Runtime { get; set; }

        [JsonPropertyName("spoken_languages")]
        public List<SpokenLanguage> SpokenLanguages { get; set; } = new List<SpokenLanguage>();

        [JsonPropertyName("softcore")]
        public bool Softcore { get; set; }

        [JsonPropertyName("tagline")]
        public string TagLine { get; set; } = string.Empty;

        [JsonPropertyName("status")]
        public string Status { get; set; } = string.Empty;

        [JsonPropertyName("vote_average")]
        public double VoteAverage { get; set; }

        [JsonPropertyName("vote_count")]
        public long VoteCount { get; set; }
        
    }

    public class BelongsToCollectionModel
    {
        [JsonPropertyName("id")]
        public long Id { get; set; }

        [JsonPropertyName("name")]
        public string Name { get; set; } = string.Empty;

        [JsonPropertyName("poster_path")]
        public string PosterPath { get; set; } = string.Empty;

        [JsonPropertyName("backdrop_path")]
        public string BackdropPath { get; set; } = string.Empty;
    }

    public class GenreModel
    {
        [JsonPropertyName("id")]
        public long Id { get; set; }

        [JsonPropertyName("name")]
        public string Name { get; set; } = string.Empty;
    }

    public class ProductionCompany
    {
        [JsonPropertyName("id")]
        public long Id { get; set; }

        [JsonPropertyName("name")]
        public string Name { get; set; } = string.Empty;

        [JsonPropertyName("logo_path")]
        public string LogoPath {  get; set; } = string.Empty;

        [JsonPropertyName("origin_country")]
        public string OriginCountry {  get; set; } = string.Empty;
    }

    public class ProductionCountry
    {
        [JsonPropertyName("iso_3166_1")]
        public string ISOAcr { get; set; } = string.Empty;

        [JsonPropertyName("name")]
        public string Name { get; set; } = string.Empty;
    }

    public class SpokenLanguage
    {
        [JsonPropertyName("english_name")]
        public string EnglishName { get; set; } = string.Empty;

        [JsonPropertyName("iso_639_1")]
        public string LanguageCode { get; set; } = string.Empty;

        [JsonPropertyName("name")]
        public string Name { get; set; } = string.Empty;
    }
}
