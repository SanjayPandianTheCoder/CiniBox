using System.Text.Json;

namespace CiniBoxService.Utility
{
    public class Helper
    {
        private readonly ILogger<Helper> _logger;

        public Helper(ILogger<Helper> logger)
        {
            _logger = logger;
        }

        /// <summary>
        /// Reads and deserializes JSON data from the given file.
        /// </summary>
        /// <exception cref="ArgumentException">The file path is empty.</exception>
        /// <exception cref="FileNotFoundException">The file does not exist.</exception>
        /// <exception cref="InvalidDataException">The file content is empty or not valid JSON for <typeparamref name="T"/>.</exception>
        /// <exception cref="UnauthorizedAccessException">The file cannot be accessed.</exception>
        /// <exception cref="IOException">The file could not be read.</exception>
        public async Task<T> GetDataFromPath<T>(string filePath)
        {
            ValidateFilePath(filePath);

            if (!File.Exists(filePath))
            {
                _logger.LogWarning("File not found: {FilePath}", filePath);
                throw new FileNotFoundException("File not found.", filePath);
            }

            try
            {
                string json = await File.ReadAllTextAsync(filePath);

                if (string.IsNullOrWhiteSpace(json))
                {
                    throw new InvalidDataException($"File '{filePath}' is empty.");
                }

                T? data = JsonSerializer.Deserialize<T>(json);

                if (data == null)
                {
                    throw new InvalidDataException($"File '{filePath}' contains null data.");
                }

                return data;
            }
            catch (JsonException ex)
            {
                _logger.LogError(ex, "Invalid JSON in file: {FilePath}", filePath);
                throw new InvalidDataException($"File '{filePath}' contains invalid JSON.", ex);
            }
            catch (InvalidDataException ex)
            {
                _logger.LogError(ex, "Invalid data in file: {FilePath}", filePath);
                throw;
            }
            catch (UnauthorizedAccessException ex)
            {
                _logger.LogError(ex, "Access denied while reading file: {FilePath}", filePath);
                throw;
            }
            catch (IOException ex)
            {
                _logger.LogError(ex, "I/O error while reading file: {FilePath}", filePath);
                throw;
            }
        }

        /// <summary>
        /// Serializes the data as JSON and overwrites the given file.
        /// </summary>
        /// <exception cref="ArgumentNullException">The data is null.</exception>
        /// <exception cref="ArgumentException">The file path is empty.</exception>
        /// <exception cref="FileNotFoundException">The file does not exist.</exception>
        /// <exception cref="InvalidDataException">The data cannot be serialized.</exception>
        /// <exception cref="UnauthorizedAccessException">The file cannot be accessed.</exception>
        /// <exception cref="IOException">The file could not be written.</exception>
        public async Task WriteDataToPathAsync<T>(T data, string filePath)
        {
            if (data == null)
            {
                throw new ArgumentNullException(nameof(data), "Data to write cannot be null.");
            }

            ValidateFilePath(filePath);

            if (!File.Exists(filePath))
            {
                _logger.LogWarning("File not found: {FilePath}", filePath);
                throw new FileNotFoundException("File not found.", filePath);
            }

            string serializedString;
            try
            {
                serializedString = JsonSerializer.Serialize(data);
            }
            catch (NotSupportedException ex)
            {
                _logger.LogError(ex, "Unable to serialize {Type}", typeof(T).Name);
                throw new InvalidDataException($"Unable to serialize {typeof(T).Name}.", ex);
            }

            try
            {
                await File.WriteAllTextAsync(filePath, serializedString);
            }
            catch (UnauthorizedAccessException ex)
            {
                _logger.LogError(ex, "Access denied while writing file: {FilePath}", filePath);
                throw;
            }
            catch (IOException ex)
            {
                _logger.LogError(ex, "I/O error while writing file: {FilePath}", filePath);
                throw;
            }
        }

        private static void ValidateFilePath(string filePath)
        {
            if (string.IsNullOrWhiteSpace(filePath))
            {
                throw new ArgumentException("File path cannot be empty.", nameof(filePath));
            }
        }
    }
}
