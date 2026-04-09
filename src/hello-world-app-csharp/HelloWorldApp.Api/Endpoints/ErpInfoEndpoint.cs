using System.Text.Json;
using FastEndpoints;
using HelloWorldApp.Api.Services;

namespace HelloWorldApp.Api.Endpoints;

/// <summary>
/// Proxies requests to the JTL Platform ERP API.
/// Resolves the local tenant ID to the JTL tenant ID before forwarding.
/// </summary>
public class ErpInfoEndpoint : EndpointWithoutRequest
{
    private readonly ErpApiService _erpApiService;
    private readonly TenantMappingService _tenantMapping;

    public ErpInfoEndpoint(ErpApiService erpApiService, TenantMappingService tenantMapping)
    {
        _erpApiService = erpApiService;
        _tenantMapping = tenantMapping;
    }

    public override void Configure()
    {
        Verbs(Http.GET, Http.POST, Http.PUT, Http.PATCH, Http.DELETE);
        Routes("/erp-info/{tenantId}/{*endpoint}");
        AllowAnonymous();
    }

    public override async Task HandleAsync(CancellationToken ct)
    {
        var localTenantId = Route<string>("tenantId")!;
        var endpoint = Route<string>("endpoint")!;
        var method = new HttpMethod(HttpContext.Request.Method);
        string? jsonBody = null;

        if (HttpContext.Request.Method is "POST" or "PUT" or "PATCH")
        {
            using var reader = new StreamReader(HttpContext.Request.Body);
            var rawBody = await reader.ReadToEndAsync(ct);

            if (!string.IsNullOrWhiteSpace(rawBody))
            {
                var bodyJson = JsonSerializer.Deserialize<JsonElement>(rawBody);

                // Allow overriding tenantId and endpoint from request body
                if (bodyJson.TryGetProperty("_tenantId", out var tenantOverride))
                    localTenantId = tenantOverride.GetString()!;

                if (bodyJson.TryGetProperty("_endpoint", out var endpointOverride))
                    endpoint = endpointOverride.GetString()!;

                var cleaned = bodyJson.EnumerateObject()
                    .Where(p => p.Name is not "_tenantId" and not "_endpoint")
                    .ToDictionary(p => p.Name, p => p.Value);

                jsonBody = JsonSerializer.Serialize(cleaned);
            }
        }

        var entry = _tenantMapping.Get(localTenantId);
        if (entry is null)
        {
            await Send.NotFoundAsync(cancellation: ct);
            return;
        }

        var (statusCode, responseBody) = await _erpApiService.ProxyErpRequestAsync(
            entry.JtlTenantId, endpoint, method, jsonBody);

        HttpContext.Response.StatusCode = statusCode;
        HttpContext.Response.ContentType = "application/json";
        await HttpContext.Response.WriteAsync(responseBody, ct);
    }
}
