using FastEndpoints;
using HelloWorldApp.Api.Models;
using HelloWorldApp.Api.Services;

namespace HelloWorldApp.Api.Endpoints;

public class ConnectTenantEndpoint : Endpoint<ConnectTenantRequest>
{
    private readonly JwtVerificationService _jwtService;
    private readonly TenantMappingService _tenantMapping;

    public ConnectTenantEndpoint(JwtVerificationService jwtService, TenantMappingService tenantMapping)
    {
        _jwtService = jwtService;
        _tenantMapping = tenantMapping;
    }

    public override void Configure()
    {
        Post("/connect-tenant");
        AllowAnonymous();
    }

    public override async Task HandleAsync(ConnectTenantRequest req, CancellationToken ct)
    {
        var payload = await _jwtService.VerifySessionTokenAsync(req.SessionToken);

        // Use current timestamp as local tenant ID.
        // In a real application this would come from your own auth system.
        var localTenantId = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds().ToString();

        _tenantMapping.Set(localTenantId, payload.TenantId, payload.TenantSlug);

        await Send.OkAsync(new
        {
            tenantId = localTenantId,
            jtlTenantId = payload.TenantId,
            tenantSlug = payload.TenantSlug
        }, ct);
    }
}
