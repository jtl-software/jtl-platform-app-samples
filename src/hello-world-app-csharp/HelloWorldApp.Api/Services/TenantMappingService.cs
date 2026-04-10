using System.Collections.Concurrent;
using System.Text.Json;

namespace HelloWorldApp.Api.Services;

/// <summary>
/// Persists the mapping between this application's local tenant IDs and JTL Platform tenant IDs.
/// Data is stored as JSON in the platform-appropriate user data directory:
///   Windows : %APPDATA%\HelloWorldApp\tenant-mapping.json
///   Linux   : ~/.config/HelloWorldApp/tenant-mapping.json
///   macOS   : ~/Library/Application Support/HelloWorldApp/tenant-mapping.json
/// </summary>
public class TenantMappingService
{
    private readonly string _filePath;
    private readonly ILogger<TenantMappingService> _logger;
    private readonly ConcurrentDictionary<string, TenantEntry> _cache;

    public TenantMappingService(ILogger<TenantMappingService> logger)
    {
        _logger = logger;

        var dataDir = Path.Combine(
            Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData),
            "HelloWorldApp");

        Directory.CreateDirectory(dataDir);
        _filePath = Path.Combine(dataDir, "tenant-mapping.json");

        _cache = Load();
        _logger.LogInformation("Tenant mapping loaded from {Path} ({Count} entries)", _filePath, _cache.Count);
    }

    public void Set(string localTenantId, string jtlTenantId, string? tenantSlug = null)
    {
        _cache[localTenantId] = new TenantEntry(jtlTenantId, tenantSlug);
        Save();
    }

    public TenantEntry? Get(string localTenantId) =>
        _cache.TryGetValue(localTenantId, out var entry) ? entry : null;

    public IReadOnlyDictionary<string, TenantEntry> GetAll() => _cache;

    /// <summary>Looks up local tenant ID by JTL Platform tenant ID.</summary>
    public (string LocalTenantId, TenantEntry Entry)? FindByJtlTenantId(string jtlTenantId)
    {
        var match = _cache.FirstOrDefault(kv => kv.Value.JtlTenantId == jtlTenantId);
        return match.Key is null ? null : (match.Key, match.Value);
    }

    private ConcurrentDictionary<string, TenantEntry> Load()
    {
        try
        {
            if (!File.Exists(_filePath))
                return new ConcurrentDictionary<string, TenantEntry>();

            var json = File.ReadAllText(_filePath);
            var data = JsonSerializer.Deserialize<Dictionary<string, TenantEntry>>(json);
            return data is null
                ? new ConcurrentDictionary<string, TenantEntry>()
                : new ConcurrentDictionary<string, TenantEntry>(data);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Could not load tenant mapping from {Path}, starting fresh", _filePath);
            return new ConcurrentDictionary<string, TenantEntry>();
        }
    }

    private void Save()
    {
        try
        {
            var json = JsonSerializer.Serialize(_cache, new JsonSerializerOptions { WriteIndented = true });
            File.WriteAllText(_filePath, json);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Could not persist tenant mapping to {Path}", _filePath);
        }
    }
}

public record TenantEntry(string JtlTenantId, string? TenantSlug);
