using COData_Web_BackEnd.Models;
using COData_Web_BackEnd.Services;
using Microsoft.AspNetCore.Mvc;

namespace COData_Web_BackEnd.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class HistorialReportesController : Controller
    {
        private readonly IHistorialReportesService _historialService;

        public HistorialReportesController(IHistorialReportesService historialService)
        {
            _historialService = historialService;
        }

        [HttpGet]
        public IActionResult GetAll()
        {
            return Ok(_historialService.GetAllHistorialReportes());
        }

        [HttpGet("{id}")]
        public IActionResult GetById(int id)
        {
            return Ok(_historialService.GetHistorialReporteById(id));
        }

        [HttpPost]
        public IActionResult Create([FromBody] HistorialReportes historial)
        {
            return Ok(_historialService.InsertHistorialReporte(historial));
        }

        [HttpPut("{id}")]
        public IActionResult Update(int id, [FromBody] HistorialReportes historial)
        {
            return Ok(_historialService.UpdateHistorialReporte(id, historial));
        }

        [HttpDelete("{id}")]
        public IActionResult Delete(int id)
        {
            _historialService.DeleteHistorialReporte(id);
            return Ok();
        }
    }
}
