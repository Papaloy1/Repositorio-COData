using COData_Web_BackEnd.Models;

namespace COData_Web_BackEnd.Services
{
    public interface IHistorialReportesService
    {
        List<HistorialReportes> GetAllHistorialReportes();
        HistorialReportes GetHistorialReporteById(int id);
        HistorialReportes InsertHistorialReporte(HistorialReportes historialReporte);
        HistorialReportes UpdateHistorialReporte(int id, HistorialReportes historialReporte);
        void DeleteHistorialReporte(int id);

    }
}
