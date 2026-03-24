using COData_Web_BackEnd.Models;
using Microsoft.Data.SqlClient;
using System.Data;

namespace COData_Web_BackEnd.Services
{
    public class ReportesService : IReportesService
    {
        private readonly string _connectionString;

        public ReportesService(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("DefaultConnection");
        }

        public List<Reportes> GetAllReportes()
        {
            var lista = new List<Reportes>();

            using SqlConnection conn = new SqlConnection(_connectionString);
            using SqlCommand cmd = new SqlCommand("sp_Reporte_Listar", conn);

            cmd.CommandType = CommandType.StoredProcedure;

            conn.Open();

            using var reader = cmd.ExecuteReader();

            while (reader.Read())
            {
                lista.Add(new Reportes
                {
                    ReporteId = Convert.ToInt32(reader["ReporteId"]),
                    UsuarioId = Convert.ToInt32(reader["UsuarioId"]),
                    CategoriaId = Convert.ToInt32(reader["CategoriaId"]),
                    UbicacionId = Convert.ToInt32(reader["UbicacionId"]),
                    Titulo = reader["Titulo"].ToString(),
                    Descripcion = reader["Descripcion"].ToString(),
                    Estado = reader["Estado"].ToString(),
                    Prioridad = reader["Prioridad"].ToString(),
                    Fecha_Creacion = Convert.ToDateTime(reader["Fecha_Creacion"]),
                    Fecha_Cierre = reader["Fecha_Cierre"] == DBNull.Value? null
                        : Convert.ToDateTime(reader["Fecha_Cierre"])
                });
            }

            return lista;
        }

        public Reportes GetReporteById(int id)
        {
            Reportes reporte = null;

            using SqlConnection conn = new SqlConnection(_connectionString);
            using SqlCommand cmd = new SqlCommand("sp_Reporte_Buscar", conn);

            cmd.CommandType = CommandType.StoredProcedure;
            cmd.Parameters.AddWithValue("@ReporteId", id);

            conn.Open();

            using var reader = cmd.ExecuteReader();

            if (reader.Read())
            {
                reporte = new Reportes
                {
                    ReporteId = Convert.ToInt32(reader["ReporteId"]),
                    UsuarioId = Convert.ToInt32(reader["UsuarioId"]),
                    CategoriaId = Convert.ToInt32(reader["CategoriaId"]),
                    UbicacionId = Convert.ToInt32(reader["UbicacionId"]),
                    Titulo = reader["Titulo"].ToString(),
                    Descripcion = reader["Descripcion"].ToString(),
                    Estado = reader["Estado"].ToString(),
                    Prioridad = reader["Prioridad"].ToString(),
                    Fecha_Creacion = Convert.ToDateTime(reader["Fecha_Creacion"]),
                    Fecha_Cierre = reader["Fecha_Cierre"] == DBNull.Value? null : Convert.ToDateTime(reader["Fecha_Cierre"])
                };
            }

            return reporte;
        }

        public Reportes InsertReporte(Reportes reporte)
        {
            using SqlConnection conn = new SqlConnection(_connectionString);
            using SqlCommand cmd = new SqlCommand("sp_Reporte_Insertar", conn);

            cmd.CommandType = CommandType.StoredProcedure;

            cmd.Parameters.AddWithValue("@UsuarioId", reporte.UsuarioId);
            cmd.Parameters.AddWithValue("@CategoriaId", reporte.CategoriaId);
            cmd.Parameters.AddWithValue("@UbicacionId", reporte.UbicacionId);
            cmd.Parameters.AddWithValue("@Titulo", reporte.Titulo);
            cmd.Parameters.AddWithValue("@Descripcion", reporte.Descripcion);
            cmd.Parameters.AddWithValue("@Estado", reporte.Estado);
            cmd.Parameters.AddWithValue("@Prioridad", reporte.Prioridad);

            conn.Open();
            cmd.ExecuteNonQuery();

            return reporte;
        }

        public Reportes UpdateReporte(int id, Reportes reporte)
        {
            using SqlConnection conn = new SqlConnection(_connectionString);
            using SqlCommand cmd = new SqlCommand("sp_Reporte_Actualizar", conn);

            cmd.CommandType = CommandType.StoredProcedure;

            cmd.Parameters.AddWithValue("@ReporteId", id);
            cmd.Parameters.AddWithValue("@Estado", reporte.Estado);
            cmd.Parameters.AddWithValue("@Prioridad", reporte.Prioridad);
            cmd.Parameters.AddWithValue("@Descripcion", reporte.Descripcion);

            conn.Open();
            cmd.ExecuteNonQuery();

            return reporte;
        }

        public void DeleteReporte(int id)
        {
            using SqlConnection conn = new SqlConnection(_connectionString);
            using SqlCommand cmd = new SqlCommand("sp_Reporte_Eliminar", conn);

            cmd.CommandType = CommandType.StoredProcedure;
            cmd.Parameters.AddWithValue("@ReporteId", id);

            conn.Open();
            cmd.ExecuteNonQuery();
        }
    }
}
