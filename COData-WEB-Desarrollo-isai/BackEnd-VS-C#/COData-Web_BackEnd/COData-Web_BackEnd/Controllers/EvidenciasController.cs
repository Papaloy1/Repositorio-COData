using COData_Web_BackEnd.Models;
using COData_Web_BackEnd.Services;
using Microsoft.AspNetCore.Mvc;

namespace COData_Web_BackEnd.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class EvidenciasController : Controller
    {
        private readonly IEvidenciasService _evidenciasService;

        public EvidenciasController(IEvidenciasService evidenciasService)
        {
            _evidenciasService = evidenciasService;
        }

        [HttpGet]
        public IActionResult GetAll()
        {
            return Ok(_evidenciasService.GetAllEvidencias());
        }

        [HttpGet("{id}")]
        public IActionResult GetById(int id)
        {
            return Ok(_evidenciasService.GetEvidenciaById(id));
        }

        [HttpPost]
        public IActionResult Create([FromBody] Evidencias evidencia)
        {
            return Ok(_evidenciasService.InsertEvidencia(evidencia));
        }

        [HttpPut("{id}")]
        public IActionResult Update(int id, [FromBody] Evidencias evidencia)
        {
            return Ok(_evidenciasService.UpdateEvidencia(id, evidencia));
        }

        [HttpDelete("{id}")]
        public IActionResult Delete(int id)
        {
            _evidenciasService.DeleteEvidencia(id);
            return Ok();
        }
    }
}
