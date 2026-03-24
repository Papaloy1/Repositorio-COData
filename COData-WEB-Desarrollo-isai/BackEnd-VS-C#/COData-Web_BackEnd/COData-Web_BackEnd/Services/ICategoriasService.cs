using COData_Web_BackEnd.Models;

namespace COData_Web_BackEnd.Services
{
    public interface ICategoriasService
    {
        List<Categorias> GetAllCategorias();
        Categorias GetCategoriaById(int id);
        Categorias InsertCategoria(Categorias categoria);
        Categorias UpdateCategoria(int id, Categorias categoria);
        void DeleteCategoria(int id);
    }
}
