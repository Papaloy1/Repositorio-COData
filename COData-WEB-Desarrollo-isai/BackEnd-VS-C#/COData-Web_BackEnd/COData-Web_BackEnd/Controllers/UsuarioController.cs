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

        [HttpPost]
        public IActionResult Create([FromBody] Usuario usuario)
        {
            var nuevo = _usuarioService.CreateUsuario(usuario);
            return Ok(nuevo);
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
        [HttpPost("login")]
        public IActionResult Login([FromBody] LoginRequest login)
        {
            if (login == null || string.IsNullOrEmpty(login.Email))
            {
                return BadRequest(new { message = "Datos de acceso incompletos" });
            }

            // Llamamos al método Login que agregamos antes en el UsuarioService
            var usuario = _usuarioService.Login(login.Email, login.Contrasenia);

            if (usuario == null)
            {
                // Si el SP no devuelve nada, mandamos un error 401 (No autorizado)
                return Unauthorized(new { message = "Usuario o contraseña incorrectos" });
            }

            // Si todo está bien, devolvemos el usuario (sin la contraseña por seguridad)
            return Ok(new
            {
                id = usuario.UsuarioId,
                nombre = usuario.Nombre,
                email = usuario.Email,
                fecha = usuario.FechaRegistro
            });
        }
    }
}
