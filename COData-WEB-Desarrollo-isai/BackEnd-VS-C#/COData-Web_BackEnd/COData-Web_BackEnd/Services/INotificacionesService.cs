using COData_Web_BackEnd.Models;

namespace COData_Web_BackEnd.Services
{
    public interface INotificacionesService
    {
            List<Notificaciones> GetAllNotificaciones();
            Notificaciones GetNotificacionById(int id);
            Notificaciones InsertNotificacion(Notificaciones notificacion);
            Notificaciones UpdateNotificacion(int id, Notificaciones notificacion);
            void DeleteNotificacion(int id);
    }
}
