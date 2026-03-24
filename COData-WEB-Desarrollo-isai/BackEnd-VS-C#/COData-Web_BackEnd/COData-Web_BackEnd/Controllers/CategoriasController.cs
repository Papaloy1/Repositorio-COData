using COData_Web_BackEnd.Models;
using COData_Web_BackEnd.Services;
using Microsoft.AspNetCore.Mvc;

namespace COData_Web_BackEnd.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CategoriasController : Controller
    {
        private readonly ICategoriasService _categoriasService;

        public CategoriasController(ICategoriasService categoriasService)
        {
            _categoriasService = categoriasService;
        }

        [HttpGet]
        public IActionResult GetAll()
        {
            return Ok(_categoriasService.GetAllCategorias());
        }

        [HttpGet("{id}")]
        public IActionResult GetById(int id)
        {
            return Ok(_categoriasService.GetCategoriaById(id));
        }

        [HttpPost]
        public IActionResult Create([FromBody] Categorias categoria)
        {
            return Ok(_categoriasService.InsertCategoria(categoria));
        }

        [HttpPut("{id}")]
        public IActionResult Update(int id, [FromBody] Categorias categoria)
        {
            return Ok(_categoriasService.UpdateCategoria(id, categoria));
        }

        [HttpDelete("{id}")]
        public IActionResult Delete(int id)
        {
            _categoriasService.DeleteCategoria(id);
            return Ok();
        }
    }
}
