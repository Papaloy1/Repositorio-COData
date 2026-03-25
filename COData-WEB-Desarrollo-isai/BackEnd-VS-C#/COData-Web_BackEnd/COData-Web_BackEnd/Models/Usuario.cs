namespace COData_Web_BackEnd.Models
{
    public class Usuario
    {
        public int UsuarioId { get; set; }
        public string Nombre { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        // CAMBIADO: De 'Contraseña' a 'Contrasenia'
        public string Contrasenia { get; set; } = string.Empty;
        public DateTime FechaRegistro { get; set; }
        public string? Teléfono { get; set; }
    }
}