namespace COData_Web_BackEnd.Models
{
    public class Ubicaciones
    {
        public int UbicacionId { get; set; }
        public string Direccion { get; set; } = string.Empty;
        public string Ciudad { get; set; } = string.Empty;
        public decimal Latitud { get; set; }
        public decimal Longitud { get; set; }

    }

}
