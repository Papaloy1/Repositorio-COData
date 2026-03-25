using COData_Web_BackEnd.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.Data.SqlClient;
using System.Data;
using System.Data.Common;

namespace COData_Web_BackEnd.Services
{
    public class UsuarioService : IUsuarioService
    {
        private readonly string _connectionString;
<<<<<<< HEAD
        private readonly IPasswordHasher<Usuario> _passwordHasher;

        public UsuarioService(IConfiguration configuration, IPasswordHasher<Usuario> passwordHasher)
=======
        
        public UsuarioService(IConfiguration configuration)
>>>>>>> 6c07ee34a9739f7ff214b9f6d75d5be99730d67e
        {
            _connectionString = configuration.GetConnectionString("DefaultConnection");
            _passwordHasher = passwordHasher;
        }
        public Usuario Login(string email, string contrasenia)
        {
            Usuario usuario = null;

            using SqlConnection conn = new SqlConnection(_connectionString);
            using SqlCommand cmd = new SqlCommand("sp_Usuario_Login", conn);

            cmd.CommandType = CommandType.StoredProcedure;
            // Quitamos la 'ñ' al parámetro
            cmd.Parameters.AddWithValue("@email", email);
            cmd.Parameters.AddWithValue("@contrasenia", contrasenia);

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
                    Contrasenia = reader["Contraseña"].ToString(),
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
                    Contrasenia = reader["Contrasenia"].ToString(),
                    FechaRegistro = Convert.ToDateTime(reader["FechaRegistro"])
                };
            }

            return usuario;
        }

        public Usuario CreateUsuario(Usuario usuario)
        {
            using SqlConnection conn = new SqlConnection(_connectionString);
<<<<<<< HEAD
            using SqlCommand cmd = new SqlCommand("sp_Usuario_Insertar", conn); 
            cmd.CommandType = CommandType.StoredProcedure;

            cmd.Parameters.AddWithValue("@nombre", usuario.Nombre);
            cmd.Parameters.AddWithValue("@email", usuario.Email);
            cmd.Parameters.AddWithValue("@contraseña", usuario.Contraseña);
=======
            using SqlCommand cmd = new SqlCommand("sp_Usuario_Insertar", conn);
            cmd.CommandType = CommandType.StoredProcedure;

            // Usamos los parámetros exactos sin acentos ni 'ñ'
            cmd.Parameters.AddWithValue("@nombre", usuario.Nombre ?? (object)DBNull.Value);
            cmd.Parameters.AddWithValue("@email", usuario.Email ?? (object)DBNull.Value);
            cmd.Parameters.AddWithValue("@contrasenia", usuario.Contrasenia ?? (object)DBNull.Value);
            cmd.Parameters.AddWithValue("@telefono", usuario.Teléfono ?? (object)DBNull.Value);
>>>>>>> 6c07ee34a9739f7ff214b9f6d75d5be99730d67e

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
            cmd.Parameters.AddWithValue("@Contraseña", usuario.Contrasenia);

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

        public Usuario GetUsuarioByEmail(string email)
        {
            Usuario usuario = null;

            using SqlConnection conn = new SqlConnection(_connectionString);
            using SqlCommand cmd = new SqlCommand("sp_Usuario_Buscar_Por_Email", conn);

            cmd.CommandType = CommandType.StoredProcedure;
            cmd.Parameters.AddWithValue("@Email", email);

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

        public Usuario Registro(Usuario usuario)
        {
            if (GetUsuarioByEmail(usuario.Email) != null)
            {
                return null;
            }

            usuario.Contraseña = _passwordHasher.HashPassword(usuario, usuario.Contraseña);
            return CreateUsuario(usuario);
        }

        public Usuario Login(string email, string password)
        {
            var usuario = GetUsuarioByEmail(email);
            if (usuario == null)
            {
                return null;
            }

            var result = _passwordHasher.VerifyHashedPassword(usuario, usuario.Contraseña, password);
            if (result == PasswordVerificationResult.Failed)
            {
                return null;
            }

            return usuario;
        }
    }

}
