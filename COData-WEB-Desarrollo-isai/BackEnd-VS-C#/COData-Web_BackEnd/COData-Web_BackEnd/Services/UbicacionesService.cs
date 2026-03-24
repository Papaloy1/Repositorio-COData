using COData_Web_BackEnd.Models;
using Microsoft.Data.SqlClient;
using System.Data;

namespace COData_Web_BackEnd.Services
{
    public class UbicacionesService : IUbicacionesServices
    {
        private readonly string _connectionString;
        private readonly IHttpClientFactory _httpClientFactory;

        public UbicacionesService(IConfiguration configuration, IHttpClientFactory httpClientFactory)
        {
            _connectionString = configuration.GetConnectionString("DefaultConnection");
            _httpClientFactory = httpClientFactory;
        }

        public List<Ubicaciones> GetAllUbicaciones()
        {
            var lista = new List<Ubicaciones>();

            using SqlConnection conn = new SqlConnection(_connectionString);
            using SqlCommand cmd = new SqlCommand("sp_Ubicacion_Listar", conn);

            cmd.CommandType = CommandType.StoredProcedure;

            conn.Open();

            using var reader = cmd.ExecuteReader();

            while (reader.Read())
            {
                lista.Add(new Ubicaciones
                {
                    UbicacionId = Convert.ToInt32(reader["UbicacionId"]),
                    Direccion = reader["Direccion"].ToString(),
                    Ciudad = reader["Ciudad"].ToString(),
                    Latitud = Convert.ToDecimal(reader["Latitud"]),
                    Longitud = Convert.ToDecimal(reader["Longitud"])
                });
            }

            return lista;
        }

        public Ubicaciones GetUbicacionById(int id)
        {
            Ubicaciones ubicacion = null;

            using SqlConnection conn = new SqlConnection(_connectionString);
            using SqlCommand cmd = new SqlCommand("sp_Ubicacion_Buscar", conn);

            cmd.CommandType = CommandType.StoredProcedure;
            cmd.Parameters.AddWithValue("@UbicacionId", id);

            conn.Open();

            using var reader = cmd.ExecuteReader();

            if (reader.Read())
            {
                ubicacion = new Ubicaciones
                {
                    UbicacionId = Convert.ToInt32(reader["UbicacionId"]),
                    Direccion = reader["Direccion"].ToString(),
                    Ciudad = reader["Ciudad"].ToString(),
                    Latitud = Convert.ToDecimal(reader["Latitud"]),
                    Longitud = Convert.ToDecimal(reader["Longitud"])
                };
            }

            return ubicacion;
        }

        public Ubicaciones InsertUbicacion(Ubicaciones ubicacion)
        {
            using SqlConnection conn = new SqlConnection(_connectionString);
            using SqlCommand cmd = new SqlCommand("sp_Ubicacion_Insertar", conn);

            cmd.CommandType = CommandType.StoredProcedure;

            cmd.Parameters.AddWithValue("@Direccion", ubicacion.Direccion);
            cmd.Parameters.AddWithValue("@Ciudad", ubicacion.Ciudad);
            cmd.Parameters.AddWithValue("@Latitud", ubicacion.Latitud);
            cmd.Parameters.AddWithValue("@Longitud", ubicacion.Longitud);

            conn.Open();
            cmd.ExecuteNonQuery();

            return ubicacion;
        }

        public Ubicaciones UpdateUbicacion(int id, Ubicaciones ubicacion)
        {
            using SqlConnection conn = new SqlConnection(_connectionString);
            using SqlCommand cmd = new SqlCommand("sp_Ubicacion_Actualizar", conn);

            cmd.CommandType = CommandType.StoredProcedure;

            cmd.Parameters.AddWithValue("@UbicacionId", id);
            cmd.Parameters.AddWithValue("@Direccion", ubicacion.Direccion);
            cmd.Parameters.AddWithValue("@Ciudad", ubicacion.Ciudad);
            cmd.Parameters.AddWithValue("@Latitud", ubicacion.Latitud);
            cmd.Parameters.AddWithValue("@Longitud", ubicacion.Longitud);

            conn.Open();
            cmd.ExecuteNonQuery();

            return ubicacion;
        }

        public void DeleteUbicacion(int id)
        {
            using SqlConnection conn = new SqlConnection(_connectionString);
            using SqlCommand cmd = new SqlCommand("sp_Ubicacion_Eliminar", conn);

            cmd.CommandType = CommandType.StoredProcedure;
            cmd.Parameters.AddWithValue("@UbicacionId", id);

            conn.Open();
            cmd.ExecuteNonQuery();
        }

        // Método para buscar dirección usando OpenStreetMap
        public async Task<string> BuscarDireccion(string consulta)
        {
            var client = _httpClientFactory.CreateClient("OSMClient");

            var response = await client.GetAsync($"search?q={Uri.EscapeDataString(consulta)}&format=json&limit=1");

            if (response.IsSuccessStatusCode)
            {
                return await response.Content.ReadAsStringAsync();
            }

            return "Error al conectar con el servicio de mapas";
        }

    }
}
