using COData_Web_BackEnd.Models;

namespace COData_Web_BackEnd.Services
{
    public interface IEvidenciasService
    {
        List<Evidencias> GetAllEvidencias();
        Evidencias GetEvidenciaById(int id);
        Evidencias InsertEvidencia(Evidencias evidencia);
        Evidencias UpdateEvidencia(int id, Evidencias evidencia);
        void DeleteEvidencia(int id);
    }
}
