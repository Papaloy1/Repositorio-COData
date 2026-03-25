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
<<<<<<< HEAD
        Usuario GetUsuarioByEmail(string email);
        Usuario Registro(Usuario usuario);
        Usuario Login(string email, string password);
=======

        // NUEVO MÉTODO
        Usuario Login(string email, string contrasenia);
>>>>>>> 6c07ee34a9739f7ff214b9f6d75d5be99730d67e
    }
}
