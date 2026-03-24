using COData_Web_BackEnd.Models;

namespace COData_Web_BackEnd.Services
{
    public interface IReportesService
    {
        List<Reportes> GetAllReportes();
        Reportes GetReporteById(int id);
        Reportes InsertReporte(Reportes reporte);
        Reportes UpdateReporte(int id, Reportes reporte);
        void DeleteReporte(int id);
    }
}
