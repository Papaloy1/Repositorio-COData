using COData_Web_BackEnd.Models;
using COData_Web_BackEnd.Services;
using Microsoft.AspNetCore.Mvc;

namespace COData_Web_BackEnd.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ReportesController : Controller
    {
        private readonly IReportesService _reportesService;

        public ReportesController(IReportesService reportesService)
        {
            _reportesService = reportesService;
        }

        [HttpGet]
        public IActionResult GetAll()
        {
            return Ok(_reportesService.GetAllReportes());
        }

        [HttpGet("{id}")]
        public IActionResult GetById(int id)
        {
            return Ok(_reportesService.GetReporteById(id));
        }

        [HttpPost]
        public IActionResult Create([FromBody] Reportes reporte)
        {
            return Ok(_reportesService.InsertReporte(reporte));
        }

        [HttpPut("{id}")]
        public IActionResult Update(int id, [FromBody] Reportes reporte)
        {
            return Ok(_reportesService.UpdateReporte(id, reporte));
        }

        [HttpDelete("{id}")]
        public IActionResult Delete(int id)
        {
            _reportesService.DeleteReporte(id);
            return Ok();
        }
    }
}
