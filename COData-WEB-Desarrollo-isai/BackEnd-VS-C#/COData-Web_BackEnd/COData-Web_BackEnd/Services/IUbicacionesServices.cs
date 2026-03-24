using COData_Web_BackEnd.Models;

namespace COData_Web_BackEnd.Services
{
    public interface IUbicacionesServices
    {
        List<Ubicaciones> GetAllUbicaciones();
        Ubicaciones GetUbicacionById(int id);
        Ubicaciones InsertUbicacion(Ubicaciones ubicacion);
        Ubicaciones UpdateUbicacion(int id, Ubicaciones ubicacion);
        void DeleteUbicacion(int id);
        Task<string> BuscarDireccion(string consulta);
    }
}
