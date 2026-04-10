namespace HelloWorldApp.Api.Models;

public record SessionTokenPayload(string UserId, string TenantId, string? TenantSlug);
