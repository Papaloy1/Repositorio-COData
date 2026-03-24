using COData_Web_BackEnd.Models;
using Microsoft.Data.SqlClient;
using System.Data;

namespace COData_Web_BackEnd.Services
{
    public class EvidenciasService : IEvidenciasService
    {
        private readonly string _connectionString;

        public EvidenciasService(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("DefaultConnection");
        }

        public List<Evidencias> GetAllEvidencias()
        {
            var lista = new List<Evidencias>();

            using SqlConnection conn = new SqlConnection(_connectionString);
            using SqlCommand cmd = new SqlCommand("sp_Evidencia_Listar", conn);

            cmd.CommandType = CommandType.StoredProcedure;
            conn.Open();

            using var reader = cmd.ExecuteReader();

            while (reader.Read())
            {
                lista.Add(new Evidencias
                {
                    EvidenciaId = Convert.ToInt32(reader["EvidenciaId"]),
                    ReporteId = Convert.ToInt32(reader["ReporteId"]),
                    TipoArchivo = reader["TipoArchivo"].ToString(),
                    RutaArchivo = reader["RutaArchivo"].ToString(),
                    FechaSubida = Convert.ToDateTime(reader["FechaSubida"])
                });
            }

            return lista;
        }

        public Evidencias GetEvidenciaById(int id)
        {
            Evidencias evidencia = null;

            using SqlConnection conn = new SqlConnection(_connectionString);
            using SqlCommand cmd = new SqlCommand("sp_Evidencia_Buscar", conn);

            cmd.CommandType = CommandType.StoredProcedure;
            cmd.Parameters.AddWithValue("@EvidenciaId", id);

            conn.Open();

            using var reader = cmd.ExecuteReader();

            if (reader.Read())
            {
                evidencia = new Evidencias
                {
                    EvidenciaId = Convert.ToInt32(reader["EvidenciaId"]),
                    ReporteId = Convert.ToInt32(reader["ReporteId"]),
                    TipoArchivo = reader["TipoArchivo"].ToString(),
                    RutaArchivo = reader["RutaArchivo"].ToString(),
                    FechaSubida = Convert.ToDateTime(reader["FechaSubida"])
                };
            }

            return evidencia;
        }

        public Evidencias InsertEvidencia(Evidencias evidencia)
        {
            using SqlConnection conn = new SqlConnection(_connectionString);
            using SqlCommand cmd = new SqlCommand("sp_Evidencia_Insertar", conn);

            cmd.CommandType = CommandType.StoredProcedure;

            cmd.Parameters.AddWithValue("@ReporteId", evidencia.ReporteId);
            cmd.Parameters.AddWithValue("@TipoArchivo", evidencia.TipoArchivo);
            cmd.Parameters.AddWithValue("@RutaArchivo", evidencia.RutaArchivo);

            conn.Open();
            cmd.ExecuteNonQuery();

            return evidencia;
        }

        public Evidencias UpdateEvidencia(int id, Evidencias evidencia)
        {
            using SqlConnection conn = new SqlConnection(_connectionString);
            using SqlCommand cmd = new SqlCommand("sp_Evidencia_Actualizar", conn);

            cmd.CommandType = CommandType.StoredProcedure;

            cmd.Parameters.AddWithValue("@EvidenciaId", id);
            cmd.Parameters.AddWithValue("@RutaArchivo", evidencia.RutaArchivo);

            conn.Open();
            cmd.ExecuteNonQuery();

            return evidencia;
        }

        public void DeleteEvidencia(int id)
        {
            using SqlConnection conn = new SqlConnection(_connectionString);
            using SqlCommand cmd = new SqlCommand("sp_Evidencia_Eliminar", conn);

            cmd.CommandType = CommandType.StoredProcedure;
            cmd.Parameters.AddWithValue("@EvidenciaId", id);

            conn.Open();
            cmd.ExecuteNonQuery();
        }
    }
}
