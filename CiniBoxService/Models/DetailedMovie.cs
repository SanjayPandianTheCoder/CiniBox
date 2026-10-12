namespace CiniBoxService.Models
{
    public class DetailedMovie
    {
        public Movie MovieData { get; set; } = new Movie();
        public Credits CastAndCrew { get; set; } = new Credits();
        public PagedResult Recommendations { get; set; } = new PagedResult();
        public MovieImages Gallery { get; set; } = new MovieImages();
        public MovieReviews Reviews { get; set; } = new MovieReviews();
    }
}
