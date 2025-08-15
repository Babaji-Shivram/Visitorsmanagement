using Microsoft.AspNetCore.Mvc;

var builder = WebApplication.CreateBuilder(args);

// Minimal configuration for testing
builder.Services.AddControllers();

var app = builder.Build();

// Test endpoints that don't require database
app.MapGet("/", () => "BABAJI SHIVRAM Visitor API - Production Running!");
app.MapGet("/api/test", () => new { 
    status = "OK", 
    message = "API is working", 
    timestamp = DateTime.UtcNow,
    environment = app.Environment.EnvironmentName
});

app.MapControllers();

Console.WriteLine("🚀 Minimal API Starting...");
app.Run();
