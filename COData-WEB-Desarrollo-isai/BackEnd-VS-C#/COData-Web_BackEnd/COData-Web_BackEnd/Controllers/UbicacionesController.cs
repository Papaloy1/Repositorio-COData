using COData_Web_BackEnd.Models;
using COData_Web_BackEnd.Services;
using Microsoft.AspNetCore.Mvc;

namespace COData_Web_BackEnd.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UbicacionesController : Controller
    {
        private readonly IUbicacionesServices _ubicacionesService;

        public UbicacionesController(IUbicacionesServices ubicacionesService)
        {
            _ubicacionesService = ubicacionesService;
        }

        [HttpGet]
        public IActionResult GetAll()
        {
            return Ok(_ubicacionesService.GetAllUbicaciones());
        }

        [HttpGet("{id}")]
        public IActionResult GetById(int id)
        {
            return Ok(_ubicacionesService.GetUbicacionById(id));
        }

        [HttpPost]
        public IActionResult Create([FromBody] Ubicaciones ubicacion)
        {
            return Ok(_ubicacionesService.InsertUbicacion(ubicacion));
        }

        [HttpPut("{id}")]
        public IActionResult Update(int id, [FromBody] Ubicaciones ubicacion)
        {
            return Ok(_ubicacionesService.UpdateUbicacion(id, ubicacion));
        }

        [HttpDelete("{id}")]
        public IActionResult Delete(int id)
        {
            _ubicacionesService.DeleteUbicacion(id);
            return Ok();
        }

        [HttpGet("buscar-direccion")]
        public async Task<IActionResult> BuscarDireccion(string consulta)
        {
            var resultado = await _ubicacionesService.BuscarDireccion(consulta);
            return Ok(resultado);
        }
    }
}
