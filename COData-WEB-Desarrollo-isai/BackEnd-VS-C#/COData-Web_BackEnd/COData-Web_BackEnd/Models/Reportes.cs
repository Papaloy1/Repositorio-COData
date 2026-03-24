namespace COData_Web_BackEnd.Models
{
    public class Reportes
    {
        public int ReporteId { get; set; }
        public int UsuarioId { get; set; }
        public int CategoriaId { get; set; }
        public int UbicacionId { get; set; }
        public string Titulo { get; set; }
        public string Descripcion { get; set; }
        public string Estado { get; set; }
        public string Prioridad { get; set; }
        public DateTime Fecha_Creacion { get; set; }
        public DateTime? Fecha_Cierre { get; set; }
        // Relaciones
        public Usuario Usuario { get; set; }
        public Categorias Categoria { get; set; }
        public Ubicaciones Ubicacion { get; set; }
    }
}
