using COData_Web_BackEnd.Models;
namespace COData_Web_BackEnd.Services
{
    public interface IUsuarioService
    {
        List<Usuario> GetAllUsuarios();
        Usuario GetUsuarioById(int id);
        Usuario CreateUsuario(Usuario usuario);
        Usuario UpdateUsuario(int id, Usuario usuario);
        void DeleteUsuario(int id);
        Usuario GetUsuarioByEmail(string email);
        Usuario Registro(Usuario usuario);
        Usuario Login(string email, string password);
    }
}
