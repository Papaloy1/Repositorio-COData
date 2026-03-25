namespace COData_Web_BackEnd.Models
{
    public class Usuario
    {
        public int UsuarioId { get; set; }
        public string Nombre { get; set; }
        public string Email { get; set; }
        public string Contraseña  { get; set; }
        public DateTime FechaRegistro { get; set; }
        public string? Teléfono { get; set; }
    }
}
