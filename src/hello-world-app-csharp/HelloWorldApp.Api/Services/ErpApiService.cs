using System.Text;
using System.Text.Json;

namespace HelloWorldApp.Api.Services;

public class ErpApiService
{
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly IConfiguration _configuration;
    private readonly ILogger<ErpApiService> _logger;

    public ErpApiService(
        IHttpClientFactory httpClientFactory,
        IConfiguration configuration,
        ILogger<ErpApiService> logger)
    {
        _httpClientFactory = httpClientFactory;
        _configuration = configuration;
        _logger = logger;
    }

    /// <summary>
    /// Fetches a short-lived access token via the OAuth2 client credentials flow.
    /// Equivalent to getJwt() in the Node.js sample.
    /// </summary>
    public async Task<string> GetAccessTokenAsync()
    {
        var clientId = _configuration["JtlPlatform:ClientId"];
        var clientSecret = _configuration["JtlPlatform:ClientSecret"];

        if (string.IsNullOrWhiteSpace(clientId) || string.IsNullOrWhiteSpace(clientSecret))
            throw new InvalidOperationException(
                "JtlPlatform:ClientId and JtlPlatform:ClientSecret must be set in appsettings.Local.json " +
                "or via environment variables JtlPlatform__ClientId / JtlPlatform__ClientSecret.");

        _logger.LogInformation("Fetching access token for client {ClientId}", clientId);

        var authString = Convert.ToBase64String(Encoding.UTF8.GetBytes($"{clientId}:{clientSecret}"));
        var client = _httpClientFactory.CreateClient();
        client.DefaultRequestHeaders.Authorization =
            new System.Net.Http.Headers.AuthenticationHeaderValue("Basic", authString);

        var body = new FormUrlEncodedContent([
            new KeyValuePair<string, string>("grant_type", "client_credentials")
        ]);

        var response = await client.PostAsync(GetAuthEndpoint(), body);
        var json = await response.Content.ReadAsStringAsync();

        if (!response.IsSuccessStatusCode)
        {
            var error = JsonSerializer.Deserialize<JsonElement>(json);
            throw new InvalidOperationException(
                $"Failed to fetch access token ({response.StatusCode}): {error.GetProperty("error")}");
        }

        var data = JsonSerializer.Deserialize<JsonElement>(json);
        return data.GetProperty("access_token").GetString()!;
    }

    /// <summary>
    /// Proxies an arbitrary HTTP request to the JTL Platform ERP API.
    /// Equivalent to the /erp-info route in the Node.js sample.
    /// </summary>
    public async Task<(int StatusCode, string Body)> ProxyErpRequestAsync(
        string tenantId, string endpoint, HttpMethod method, string? jsonBody)
    {
        var jwt = await GetAccessTokenAsync();
        var client = _httpClientFactory.CreateClient();
        client.DefaultRequestHeaders.Authorization =
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", jwt);
        client.DefaultRequestHeaders.Add("X-Tenant-ID", tenantId);

        var request = new HttpRequestMessage(method,
            $"https://api{EnvironmentSuffix}.jtl-cloud.com/erp/{endpoint}");

        if (jsonBody is not null && (method == HttpMethod.Post || method == HttpMethod.Put || method == HttpMethod.Patch))
            request.Content = new StringContent(jsonBody, Encoding.UTF8, "application/json");

        var response = await client.SendAsync(request);
        var responseBody = await response.Content.ReadAsStringAsync();
        return ((int)response.StatusCode, responseBody);
    }

    private string GetAuthEndpoint()
    {
        // prod and beta share the same auth host
        var env = _configuration["JtlPlatform:Environment"] ?? "prod";
        return env is "prod" or "beta"
            ? "https://auth.jtl-cloud.com/oauth2/token"
            : $"https://auth.{env}.jtl-cloud.com/oauth2/token";
    }

    private string EnvironmentSuffix
    {
        get
        {
            var env = _configuration["JtlPlatform:Environment"] ?? "prod";
            return env == "prod" ? "" : $".{env}";
        }
    }
}
