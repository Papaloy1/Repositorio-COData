namespace COData_Web_BackEnd.Models
{
    public class Evidencias
    {
        public int EvidenciaId { get; set; }
        public int ReporteId { get; set; }
        public string TipoArchivo { get; set; }
        public string RutaArchivo { get; set; }
        public DateTime FechaSubida { get; set; }
        // Relación
        public Reportes Reporte { get; set; }
    }
}
