using COData_Web_BackEnd.Models;
using Microsoft.Data.SqlClient;
using System.Data;

namespace COData_Web_BackEnd.Services
{
    public class CategoriasService: ICategoriasService
    {
        private readonly string _connectionString;

        public CategoriasService(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("DefaultConnection");
        }

        public List<Categorias> GetAllCategorias()
        {
            var lista = new List<Categorias>();

            using SqlConnection conn = new SqlConnection(_connectionString);
            using SqlCommand cmd = new SqlCommand("sp_Categoria_Listar", conn);

            cmd.CommandType = CommandType.StoredProcedure;
            conn.Open();

            using var reader = cmd.ExecuteReader();

            while (reader.Read())
            {
                lista.Add(new Categorias
                {
                    CategoriaId = Convert.ToInt32(reader["CategoriaId"]),
                    NombreCategoria = reader["NombreCategoria"].ToString(),
                    Descripcion = reader["Descripcion"].ToString()
                });
            }

            return lista;
        }

        public Categorias GetCategoriaById(int id)
        {
            Categorias categoria = null;

            using SqlConnection conn = new SqlConnection(_connectionString);
            using SqlCommand cmd = new SqlCommand("sp_Categoria_Buscar", conn);

            cmd.CommandType = CommandType.StoredProcedure;
            cmd.Parameters.AddWithValue("@CategoriaId", id);

            conn.Open();

            using var reader = cmd.ExecuteReader();

            if (reader.Read())
            {
                categoria = new Categorias
                {
                    CategoriaId = Convert.ToInt32(reader["CategoriaId"]),
                    NombreCategoria = reader["NombreCategoria"].ToString(),
                    Descripcion = reader["Descripcion"].ToString()
                };
            }

            return categoria;
        }

        public Categorias InsertCategoria(Categorias categoria)
        {
            using SqlConnection conn = new SqlConnection(_connectionString);
            using SqlCommand cmd = new SqlCommand("sp_Categoria_Insertar", conn);

            cmd.CommandType = CommandType.StoredProcedure;

            cmd.Parameters.AddWithValue("@Nombre", categoria.NombreCategoria);
            cmd.Parameters.AddWithValue("@Descripcion", categoria.Descripcion);

            conn.Open();
            cmd.ExecuteNonQuery();

            return categoria;
        }

        public Categorias UpdateCategoria(int id, Categorias categoria)
        {
            using SqlConnection conn = new SqlConnection(_connectionString);
            using SqlCommand cmd = new SqlCommand("sp_Categoria_Actualizar", conn);

            cmd.CommandType = CommandType.StoredProcedure;

            cmd.Parameters.AddWithValue("@CategoriaId", id);
            cmd.Parameters.AddWithValue("@Nombre", categoria.NombreCategoria);
            cmd.Parameters.AddWithValue("@Descripcion", categoria.Descripcion);

            conn.Open();
            cmd.ExecuteNonQuery();

            return categoria;
        }

        public void DeleteCategoria(int id)
        {
            using SqlConnection conn = new SqlConnection(_connectionString);
            using SqlCommand cmd = new SqlCommand("sp_Categoria_Eliminar", conn);

            cmd.CommandType = CommandType.StoredProcedure;
            cmd.Parameters.AddWithValue("@CategoriaId", id);

            conn.Open();
            cmd.ExecuteNonQuery();
        }
    }
}
