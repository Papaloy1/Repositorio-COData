namespace COData_Web_BackEnd.Models
{
    public class Reportes
    {
        public int ReporteId { get; set; }
        public int UsuarioId { get; set; }
        public int CategoriaId { get; set; }
        public int UbicacionId { get; set; }
        public string Titulo { get; set; } = string.Empty;
        public string Descripcion { get; set; } = string.Empty;
        public string Estado { get; set; } = string.Empty;
        public string Prioridad { get; set; } = string.Empty;
        public DateTime Fecha_Creacion { get; set; }
        public DateTime? Fecha_Cierre { get; set; }
        // Relaciones
        public Usuario Usuario { get; set; } = new();
        public Categorias Categoria { get; set; } = new();
        public Ubicaciones Ubicacion { get; set; } = new();
    }
}
