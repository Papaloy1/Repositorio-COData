using COData_Web_BackEnd.Models;
using COData_Web_BackEnd.Services;
using Microsoft.AspNetCore.Mvc;

namespace COData_Web_BackEnd.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UsuarioController : Controller
    {
        private readonly IUsuarioService _usuarioService;

        public UsuarioController(IUsuarioService usuarioService)
        {
            _usuarioService = usuarioService;
        }

        [HttpGet]
        public IActionResult GetAll()
        {
            return Ok(_usuarioService.GetAllUsuarios());
        }

        [HttpGet("{id}")]
        public IActionResult GetById(int id)
        {
            var usuario = _usuarioService.GetUsuarioById(id);
            if (usuario == null)
                return NotFound();

            return Ok(usuario);
        }

        [HttpPost("Registro")]
        public IActionResult Registro([FromBody] Usuario usuario)
        {
            var nuevo = _usuarioService.Registro(usuario);
            if (nuevo == null)
            {
                return BadRequest("El usuario ya existe");
            }
            return Ok(nuevo);
        }

        [HttpPost("Login")]
        public IActionResult Login([FromBody] LoginRequest loginRequest)
        {
            var usuario = _usuarioService.Login(loginRequest.Email, loginRequest.Password);
            if (usuario == null)
            {
                return Unauthorized();
            }
            return Ok(usuario);
        }

        [HttpPut("{id}")]
        public IActionResult Update(int id, [FromBody] Usuario usuario)
        {
            var actualizado = _usuarioService.UpdateUsuario(id, usuario);
            return Ok(actualizado);
        }
        [HttpDelete("{id}")]
        public IActionResult Delete(int id)
        {
            _usuarioService.DeleteUsuario(id);
            return Ok();
        }
    }
}
