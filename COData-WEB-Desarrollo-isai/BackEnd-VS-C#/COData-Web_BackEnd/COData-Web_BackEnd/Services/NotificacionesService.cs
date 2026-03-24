using COData_Web_BackEnd.Models;
using Microsoft.Data.SqlClient;
using System.Data;

namespace COData_Web_BackEnd.Services
{
    public class NotificacionesService : INotificacionesService
    {
        private readonly string _connectionString;

        public NotificacionesService(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("DefaultConnection");
        }

        public List<Notificaciones> GetAllNotificaciones()
        {
            var lista = new List<Notificaciones>();

            using SqlConnection conn = new SqlConnection(_connectionString);
            using SqlCommand cmd = new SqlCommand("sp_Notificacion_Listar", conn);

            cmd.CommandType = CommandType.StoredProcedure;

            conn.Open();

            using var reader = cmd.ExecuteReader();

            while (reader.Read())
            {
                lista.Add(new Notificaciones
                {
                    NotificacionId = Convert.ToInt32(reader["NotificacionId"]),
                    UsuarioId = Convert.ToInt32(reader["UsuarioId"]),
                    titulo = reader["Titulo"].ToString(),
                    Mensaje = reader["Mensaje"].ToString(),
                    Leida = Convert.ToBoolean(reader["Leida"]),
                    FechaCreacion = Convert.ToDateTime(reader["Fecha"])
                });
            }

            return lista;
        }

        public Notificaciones GetNotificacionById(int id)
        {
            Notificaciones notificacion = null;

            using SqlConnection conn = new SqlConnection(_connectionString);
            using SqlCommand cmd = new SqlCommand("sp_Notificacion_Buscar", conn);

            cmd.CommandType = CommandType.StoredProcedure;
            cmd.Parameters.AddWithValue("@NotificacionId", id);

            conn.Open();

            using var reader = cmd.ExecuteReader();

            if (reader.Read())
            {
                notificacion = new Notificaciones
                {
                    NotificacionId = Convert.ToInt32(reader["NotificacionId"]),
                    UsuarioId = Convert.ToInt32(reader["UsuarioId"]),
                    titulo = reader["Titulo"].ToString(),
                    Mensaje = reader["Mensaje"].ToString(),
                    Leida = Convert.ToBoolean(reader["Leida"]),
                    FechaCreacion = Convert.ToDateTime(reader["Fecha"])
                };
            }

            return notificacion;
        }

        public Notificaciones InsertNotificacion(Notificaciones notificacion)
        {
            using SqlConnection conn = new SqlConnection(_connectionString);
            using SqlCommand cmd = new SqlCommand("sp_Notificacion_Insertar", conn);

            cmd.CommandType = CommandType.StoredProcedure;

            cmd.Parameters.AddWithValue("@UsuarioId", notificacion.UsuarioId);
            cmd.Parameters.AddWithValue("@Titulo", notificacion.titulo);
            cmd.Parameters.AddWithValue("@Mensaje", notificacion.Mensaje);

            conn.Open();
            cmd.ExecuteNonQuery();

            return notificacion;
        }

        public Notificaciones UpdateNotificacion(int id, Notificaciones notificacion)
        {
            using SqlConnection conn = new SqlConnection(_connectionString);
            using SqlCommand cmd = new SqlCommand("sp_Notificacion_Actualizar", conn);

            cmd.CommandType = CommandType.StoredProcedure;

            cmd.Parameters.AddWithValue("@NotificacionId", id);
            cmd.Parameters.AddWithValue("@Leida", notificacion.Leida);

            conn.Open();
            cmd.ExecuteNonQuery();

            return notificacion;
        }

        public void DeleteNotificacion(int id)
        {
            using SqlConnection conn = new SqlConnection(_connectionString);
            using SqlCommand cmd = new SqlCommand("sp_Notificacion_Eliminar", conn);

            cmd.CommandType = CommandType.StoredProcedure;
            cmd.Parameters.AddWithValue("@NotificacionId", id);

            conn.Open();
            cmd.ExecuteNonQuery();
        }
    }
}
