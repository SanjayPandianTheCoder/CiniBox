namespace CiniBoxService.Models
{
    public class Response
    {
        public string Message { get; set; } = string.Empty;
        public bool Success { get; set; }
        public object? data { get; set; }
    }
}
