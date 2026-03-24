using COData_Web_BackEnd.Models;
using COData_Web_BackEnd.Services;
using Microsoft.AspNetCore.Mvc;

namespace COData_Web_BackEnd.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class NotificacionesController : Controller
    {
        private readonly INotificacionesService _notificacionesService;

        public NotificacionesController(INotificacionesService notificacionesService)
        {
            _notificacionesService = notificacionesService;
        }

        [HttpGet]
        public IActionResult GetAll()
        {
            return Ok(_notificacionesService.GetAllNotificaciones());
        }

        [HttpGet("{id}")]
        public IActionResult GetById(int id)
        {
            return Ok(_notificacionesService.GetNotificacionById(id));
        }

        [HttpPost]
        public IActionResult Create([FromBody] Notificaciones notificacion)
        {
            return Ok(_notificacionesService.InsertNotificacion(notificacion));
        }

        [HttpPut("{id}")]
        public IActionResult Update(int id, [FromBody] Notificaciones notificacion)
        {
            return Ok(_notificacionesService.UpdateNotificacion(id, notificacion));
        }

        [HttpDelete("{id}")]
        public IActionResult Delete(int id)
        {
            _notificacionesService.DeleteNotificacion(id);
            return Ok();
        }
    }
}
