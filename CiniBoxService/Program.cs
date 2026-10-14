using CiniBoxService.Service;
using CiniBoxService.Utility;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.


builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowCiniBox", policy =>
    {
        policy
            .AllowAnyOrigin()
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

builder.Services.AddScoped<IProfileService, ProfileService>();
builder.Services.AddScoped<ITMDBService, TMDBService>();
builder.Services.AddScoped<Helper>();

var app = builder.Build();

app.UseSwagger();
app.UseSwaggerUI();

// Configure the HTTP request pipeline.

app.UseHttpsRedirection();

app.UseCors("AllowCiniBox");

app.UseAuthorization();

app.MapControllers();

app.Run();
