namespace COData_Web_BackEnd.Models
{
    public class HistorialReportes
    {
        public int Historial_id { get; set; }
        public int Reporte_id { get; set; }
        public int Usuario_id { get; set; }
        public string Campo_Modificado { get; set; } = string.Empty;
        public string Valor_Anterior { get; set; } = string.Empty;
        public string Valor_Nuevo { get; set; } = string.Empty;
        public DateTime Fecha { get; set; }
        // Relación
        public Reportes Reporte { get; set; } = new();
        public Usuario Usuario { get; set; } = new Usuario();
    }
}
