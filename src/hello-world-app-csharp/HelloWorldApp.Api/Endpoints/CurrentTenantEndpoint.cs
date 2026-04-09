using FastEndpoints;
using HelloWorldApp.Api.Services;

namespace HelloWorldApp.Api.Endpoints;

public class CurrentTenantEndpoint : EndpointWithoutRequest
{
    private readonly TenantMappingService _tenantMapping;

    public CurrentTenantEndpoint(TenantMappingService tenantMapping)
        => _tenantMapping = tenantMapping;

    public override void Configure()
    {
        Get("/current-tenant");
        AllowAnonymous();
    }

    public override async Task HandleAsync(CancellationToken ct)
    {
        var all = _tenantMapping.GetAll();
        if (all.Count == 0)
        {
            await Send.NotFoundAsync(cancellation: ct);
            return;
        }

        var latest = all.MaxBy(kv => long.TryParse(kv.Key, out var n) ? n : 0);

        await Send.OkAsync(new
        {
            tenantId = latest.Key,
            jtlTenantId = latest.Value.JtlTenantId,
            tenantSlug = latest.Value.TenantSlug
        }, ct);
    }
}
