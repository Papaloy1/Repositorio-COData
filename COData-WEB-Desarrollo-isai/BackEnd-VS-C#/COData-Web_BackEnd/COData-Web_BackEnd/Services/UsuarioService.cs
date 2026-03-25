using COData_Web_BackEnd.Models;
using Microsoft.Data.SqlClient;
using System.Data;
using System.Data.Common;

namespace COData_Web_BackEnd.Services
{
    public class UsuarioService : IUsuarioService
    {
        private readonly string _connectionString;
        
        public UsuarioService(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("DefaultConnection");
        }
        public Usuario Login(string email, string contrasenia)
        {
            Usuario usuario = null;

            using SqlConnection conn = new SqlConnection(_connectionString);
            using SqlCommand cmd = new SqlCommand("sp_Usuario_Login", conn);

            cmd.CommandType = CommandType.StoredProcedure;
            cmd.Parameters.AddWithValue("@Email", email);
            cmd.Parameters.AddWithValue("@Contraseña", contrasenia);

            // ELIMINAMOS LA LÍNEA DEL TELÉFONO QUE HACÍA EXPLOTAR EL CÓDIGO

            conn.Open();

            using var reader = cmd.ExecuteReader();

            if (reader.Read())
            {
                usuario = new Usuario
                {
                    UsuarioId = Convert.ToInt32(reader["UsuarioId"]),
                    Nombre = reader["Nombre"].ToString(),
                    Email = reader["Email"].ToString(),
                    FechaRegistro = Convert.ToDateTime(reader["FechaRegistro"])
                };
            }

            return usuario;
        }
        public List<Usuario> GetAllUsuarios()
        {
            var lista = new List<Usuario>();

            using SqlConnection conn = new SqlConnection(_connectionString);
            using SqlCommand cmd = new SqlCommand("sp_Usuario_Listar", conn);

            cmd.CommandType = CommandType.StoredProcedure;

            conn.Open();

            using var reader = cmd.ExecuteReader();

            while (reader.Read())
            {
                lista.Add(new Usuario
                {
                    UsuarioId = Convert.ToInt32(reader["UsuarioId"]),
                    Nombre = reader["Nombre"].ToString(),
                    Email = reader["Email"].ToString(),
                    Contraseña = reader["Contraseña"].ToString(),
                    FechaRegistro = Convert.ToDateTime(reader["FechaRegistro"])
                });
            }

            return lista;
        }

        public Usuario GetUsuarioById(int id)
        {
            Usuario usuario = null;

            using SqlConnection conn = new SqlConnection(_connectionString);
            using SqlCommand cmd = new SqlCommand("sp_Usuario_Buscar", conn);

            cmd.CommandType = CommandType.StoredProcedure;
            cmd.Parameters.AddWithValue("@UsuarioId", id);

            conn.Open();

            using var reader = cmd.ExecuteReader();

            if (reader.Read())
            {
                usuario = new Usuario
                {
                    UsuarioId = Convert.ToInt32(reader["UsuarioId"]),
                    Nombre = reader["Nombre"].ToString(),
                    Email = reader["Email"].ToString(),
                    Contraseña = reader["Contraseña"].ToString(),
                    FechaRegistro = Convert.ToDateTime(reader["FechaRegistro"])
                };
            }

            return usuario;
        }

        public Usuario CreateUsuario(Usuario usuario)
        {
            using SqlConnection conn = new SqlConnection(_connectionString);
            using SqlCommand cmd = new SqlCommand("sp_Usuario_Insertar", conn);
            cmd.CommandType = CommandType.StoredProcedure;

            cmd.Parameters.AddWithValue("@Nombre", usuario.Nombre ?? (object)DBNull.Value);
            cmd.Parameters.AddWithValue("@Email", usuario.Email ?? (object)DBNull.Value);
            cmd.Parameters.AddWithValue("@Contraseña", usuario.Contraseña ?? (object)DBNull.Value);
            cmd.Parameters.AddWithValue("@teléfono", usuario.Teléfono ?? (object)DBNull.Value);

            // Opcional: Si tu procedimiento sp_Usuario_Insertar y tu modelo exigen el teléfono,
            // descomenta la siguiente línea (asegurándote que 'Teléfono' exista en tu modelo C#).
            // cmd.Parameters.AddWithValue("@teléfono", usuario.Teléfono ?? (object)DBNull.Value);

            conn.Open();
            cmd.ExecuteNonQuery();

            return usuario;
        }

        public Usuario UpdateUsuario(int id, Usuario usuario)
        {
            using SqlConnection conn = new SqlConnection(_connectionString);
            using SqlCommand cmd = new SqlCommand("sp_Usuario_Actualizar", conn);

            cmd.CommandType = CommandType.StoredProcedure;

            cmd.Parameters.AddWithValue("@UsuarioId", id);
            cmd.Parameters.AddWithValue("@Nombre", usuario.Nombre);
            cmd.Parameters.AddWithValue("@Email", usuario.Email);
            cmd.Parameters.AddWithValue("@Contraseña", usuario.Contraseña);

            conn.Open();
            cmd.ExecuteNonQuery();

            return usuario;
        }

        public void DeleteUsuario(int id)
        {
            using SqlConnection conn = new SqlConnection(_connectionString);
            using SqlCommand cmd = new SqlCommand("sp_Usuario_Eliminar", conn);

            cmd.CommandType = CommandType.StoredProcedure;
            cmd.Parameters.AddWithValue("@UsuarioId", id);

            conn.Open();
            cmd.ExecuteNonQuery();
        }
    }

}
