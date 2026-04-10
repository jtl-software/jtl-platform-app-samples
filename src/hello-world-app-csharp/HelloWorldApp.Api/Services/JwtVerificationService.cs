using System.Text;
using System.Text.Json;
using HelloWorldApp.Api.Models;
using NSec.Cryptography;

namespace HelloWorldApp.Api.Services;

/// <summary>
/// Verifies JWTs signed with Ed25519 (EdDSA / OKP keys) using the JTL Platform JWKS endpoint.
/// Equivalent to verifySessionTokenAndExtractPayload() in the Node.js sample.
/// </summary>
public class JwtVerificationService
{
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly ErpApiService _erpApiService;
    private readonly IConfiguration _configuration;
    private readonly ILogger<JwtVerificationService> _logger;

    public JwtVerificationService(
        IHttpClientFactory httpClientFactory,
        ErpApiService erpApiService,
        IConfiguration configuration,
        ILogger<JwtVerificationService> logger)
    {
        _httpClientFactory = httpClientFactory;
        _erpApiService = erpApiService;
        _configuration = configuration;
        _logger = logger;
    }

    public async Task<SessionTokenPayload> VerifySessionTokenAsync(string sessionToken)
    {
        var env = _configuration["JtlPlatform:Environment"] ?? "prod";
        var suffix = env == "prod" ? "" : $".{env}";
        var wellKnownUrl = $"https://api{suffix}.jtl-cloud.com/account/.well-known/jwks.json";

        // Use client credentials token to access the JWKS endpoint
        var accessToken = await _erpApiService.GetAccessTokenAsync();

        var client = _httpClientFactory.CreateClient();
        client.DefaultRequestHeaders.Authorization =
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", accessToken);

        var response = await client.GetAsync(wellKnownUrl);
        response.EnsureSuccessStatusCode();

        var jwksJson = await response.Content.ReadAsStringAsync();
        var jwks = JsonSerializer.Deserialize<JsonElement>(jwksJson);

        // Use the first key in the JWKS (OKP / Ed25519)
        var key = jwks.GetProperty("keys")[0];
        var publicKeyBytes = Base64UrlDecode(key.GetProperty("x").GetString()!);

        return VerifyAndDecode(sessionToken, publicKeyBytes);
    }

    private SessionTokenPayload VerifyAndDecode(string token, byte[] publicKeyBytes)
    {
        var parts = token.Split('.');
        if (parts.Length != 3)
            throw new ArgumentException("Invalid JWT format – expected 3 dot-separated parts.");

        // The signed data is the ASCII bytes of "header.payload"
        var signedData = Encoding.ASCII.GetBytes($"{parts[0]}.{parts[1]}");
        var signature = Base64UrlDecode(parts[2]);

        var algorithm = SignatureAlgorithm.Ed25519;
        var publicKey = PublicKey.Import(algorithm, publicKeyBytes, KeyBlobFormat.RawPublicKey);

        if (!algorithm.Verify(publicKey, signedData, signature))
        {
            _logger.LogError("JWT signature verification failed");
            throw new UnauthorizedAccessException("Invalid token signature.");
        }

        _logger.LogInformation("JWT signature verified successfully");

        var payloadJson = Encoding.UTF8.GetString(Base64UrlDecode(parts[1]));
        var payload = JsonSerializer.Deserialize<JsonElement>(payloadJson);

        return new SessionTokenPayload(
            UserId: payload.GetProperty("userId").GetString()!,
            TenantId: payload.GetProperty("tenantId").GetString()!,
            TenantSlug: payload.TryGetProperty("tenantSlug", out var slug) ? slug.GetString() : null
        );
    }

    private static byte[] Base64UrlDecode(string input)
    {
        var padded = input.Replace('-', '+').Replace('_', '/');
        padded += (padded.Length % 4) switch
        {
            2 => "==",
            3 => "=",
            _ => ""
        };
        return Convert.FromBase64String(padded);
    }
}
