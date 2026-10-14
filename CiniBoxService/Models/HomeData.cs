namespace CiniBoxService.Models
{
    public class HomeData
    {
        public PagedResult PopularMovies { get; set; } = new PagedResult();
        public PagedResult NowPlayingMovies { get; set; } = new PagedResult();
        public PagedResult TopRatedMovies { get; set; } = new PagedResult();

    }
}
