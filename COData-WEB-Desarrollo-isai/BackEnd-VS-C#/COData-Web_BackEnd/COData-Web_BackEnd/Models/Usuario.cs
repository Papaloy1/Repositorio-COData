namespace COData_Web_BackEnd.Models
{
    public class Usuario
    {
        public int UsuarioId { get; set; }
        public string Nombre { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Contraseña  { get; set; } = string.Empty;
        public DateTime FechaRegistro { get; set; }

    }
}
