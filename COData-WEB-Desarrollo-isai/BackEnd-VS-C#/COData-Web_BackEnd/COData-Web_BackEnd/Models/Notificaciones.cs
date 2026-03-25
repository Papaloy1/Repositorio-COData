namespace COData_Web_BackEnd.Models
{
    public class Notificaciones
    {
        public int NotificacionId { get; set; }
        public int UsuarioId { get; set; }
        public string titulo { get; set; } = string.Empty;
        public string Mensaje { get; set; } = string.Empty;
        public bool Leida { get; set; }
        public DateTime FechaCreacion { get; set; }
        // Relaciones
        public Usuario Usuario { get; set; } = new();
    }
}
