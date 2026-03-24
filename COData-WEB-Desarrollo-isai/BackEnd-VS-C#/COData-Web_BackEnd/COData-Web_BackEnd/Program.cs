using COData_Web_BackEnd.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

//--COnfiguración de Clientes HTTP--//
builder.Services.AddHttpClient("OSMClient", client =>
{
    // OSM requiere un User-Agent identificable para evitar bloqueos
    client.DefaultRequestHeaders.Add("User-Agent", "COData_App_v1");
    client.BaseAddress = new Uri("https://nominatim.openstreetmap.org/");
});

// Add services to the container.
builder.Services.AddControllersWithViews();
builder.Services.AddScoped<IUsuarioService, UsuarioService>();
builder.Services.AddScoped<ICategoriasService, CategoriasService>();
builder.Services.AddScoped<IEvidenciasService, EvidenciasService>();
builder.Services.AddScoped<IHistorialReportesService, HistorialReportesService>();
builder.Services.AddScoped<INotificacionesService, NotificacionesService>();
builder.Services.AddScoped<IReportesService, ReportesService>();
builder.Services.AddScoped<IUbicacionesServices, UbicacionesService>();

// Agregar CORS antes de builder.Build()
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngular", policy =>
    {
        policy.WithOrigins("http://localhost:4200") // Puerto de Angular
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials();
    });
});

var app = builder.Build();

// Usar CORS
app.UseCors("AllowAngular");

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}
// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Home/Error");
    // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseStaticFiles();

app.UseRouting();

app.UseAuthorization();

app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Index}/{id?}");

app.Run();
