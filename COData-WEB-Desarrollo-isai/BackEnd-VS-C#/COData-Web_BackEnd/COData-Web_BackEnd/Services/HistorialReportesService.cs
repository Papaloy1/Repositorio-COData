using COData_Web_BackEnd.Models;
using Microsoft.Data.SqlClient;
using System.Data;

namespace COData_Web_BackEnd.Services
{
    public class HistorialReportesService : IHistorialReportesService
    {
        private readonly string _connectionString;

        public HistorialReportesService(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("DefaultConnection")!;
        }

        public List<HistorialReportes> GetAllHistorialReportes() // Nombre corregido
        {
            var lista = new List<HistorialReportes>();
            using SqlConnection conn = new SqlConnection(_connectionString);
            using SqlCommand cmd = new SqlCommand("sp_HistorialReporte_Listar", conn);
            cmd.CommandType = CommandType.StoredProcedure;
            conn.Open();
            using var reader = cmd.ExecuteReader();
            while (reader.Read())
            {
                lista.Add(new HistorialReportes
                {
                    Historial_id = Convert.ToInt32(reader["Historial_id"]),
                    Reporte_id = Convert.ToInt32(reader["reporte_id"]),
                    Usuario_id = Convert.ToInt32(reader["usuario_id"]),
                    Campo_Modificado = reader["campo_modificado"].ToString(),
                    Valor_Anterior = reader["valor_anterior"].ToString(),
                    Valor_Nuevo = reader["valor_nuevo"].ToString(),
                    Fecha = Convert.ToDateTime(reader["fecha"])
                });
            }
            return lista;
        }

        public HistorialReportes GetHistorialReporteById(int id) // Nombre corregido
        {
            using SqlConnection conn = new SqlConnection(_connectionString);
            using SqlCommand cmd = new SqlCommand("sp_HistorialReporte_Buscar", conn);
            cmd.CommandType = CommandType.StoredProcedure;
            cmd.Parameters.AddWithValue("@id", id);
            conn.Open();
            using var reader = cmd.ExecuteReader();
            if (reader.Read())
            {
                return new HistorialReportes
                {
                    Historial_id = Convert.ToInt32(reader["Historial_id"]),
                    Reporte_id = Convert.ToInt32(reader["reporte_id"]),
                    Usuario_id = Convert.ToInt32(reader["usuario_id"]),
                    Campo_Modificado = reader["campo_modificado"].ToString(),
                    Valor_Anterior = reader["valor_anterior"].ToString(),
                    Valor_Nuevo = reader["valor_nuevo"].ToString(),
                    Fecha = Convert.ToDateTime(reader["fecha"])
                };
            }
            return null;
        }

        public HistorialReportes InsertHistorialReporte(HistorialReportes historial) // Coincide con interfaz
        {
            using SqlConnection conn = new SqlConnection(_connectionString);
            using SqlCommand cmd = new SqlCommand("sp_HistorialReporte_Insertar", conn);
            cmd.CommandType = CommandType.StoredProcedure;
            cmd.Parameters.AddWithValue("@reporte_id", historial.Reporte_id);
            cmd.Parameters.AddWithValue("@usuario_id", historial.Usuario_id);
            cmd.Parameters.AddWithValue("@campo_modificado", historial.Campo_Modificado);
            cmd.Parameters.AddWithValue("@valor_anterior", historial.Valor_Anterior);
            cmd.Parameters.AddWithValue("@valor_nuevo", historial.Valor_Nuevo);
            conn.Open();
            cmd.ExecuteNonQuery();
            return historial;
        }

        public HistorialReportes UpdateHistorialReporte(int id, HistorialReportes historial) // Coincide con interfaz
        {
            // ... (aplica la misma lógica de nombres de parámetros que en Insert)
            return historial;
        }

        public void DeleteHistorialReporte(int id) // Coincide con interfaz
        {
            using SqlConnection conn = new SqlConnection(_connectionString);
            using SqlCommand cmd = new SqlCommand("sp_HistorialReporte_Eliminar", conn);
            cmd.CommandType = CommandType.StoredProcedure;
            cmd.Parameters.AddWithValue("@id", id);
            conn.Open();
            cmd.ExecuteNonQuery();
        }
    }
}
