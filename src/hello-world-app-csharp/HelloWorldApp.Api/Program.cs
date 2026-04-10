using FastEndpoints;
using FastEndpoints.Swagger;
using HelloWorldApp.Api.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Configuration.AddJsonFile("appsettings.Local.json", optional: true, reloadOnChange: false);

builder.Services.AddFastEndpoints();
builder.Services.SwaggerDocument();

builder.Services.AddHttpClient();
builder.Services.AddSingleton<TenantMappingService>();
builder.Services.AddScoped<ErpApiService>();
builder.Services.AddScoped<JwtVerificationService>();

builder.Services.AddCors(options =>
    options.AddDefaultPolicy(policy =>
        policy.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader()));

var app = builder.Build();

app.UseCors();
app.UseFastEndpoints();

if (app.Environment.IsDevelopment())
    app.UseSwaggerGen();

app.Run();
