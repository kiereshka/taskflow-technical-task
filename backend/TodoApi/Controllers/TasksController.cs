using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TodoApi.DTOs;
using TodoApi.Interfaces;

namespace TodoApi.Controllers;

[ApiController]
[Authorize]
[Route("api/[controller]")]
public class TasksController : ControllerBase
{
    private readonly ITaskService _taskService;

    public TasksController(ITaskService taskService)
    {
        _taskService = taskService;
    }

    [HttpGet]
    public async Task<ActionResult<PagedResultDto<TaskResponseDto>>> GetPaged([FromQuery] TaskQueryParametersDto query)
    {
        try
        {
            var userId = GetCurrentUserId();

            var tasks = await _taskService.GetPagedAsync(query, userId);

            return Ok(tasks);
        }
        catch (ArgumentException exception)
        {
            return BadRequest(new { message = exception.Message });
        }
    }

    [HttpGet("overview")]
    public async Task<ActionResult<TaskOverviewDto>> GetOverview()
    {
        var userId = GetCurrentUserId();

        var overview = await _taskService.GetOverviewAsync(userId);

        return Ok(overview);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<TaskResponseDto>> GetById(int id)
    {
        try
        {
            var userId = GetCurrentUserId();

            var task = await _taskService.GetByIdAsync(id, userId);

            return Ok(task);
        }
        catch (KeyNotFoundException exception)
        {
            return NotFound(new { message = exception.Message });
        }
    }

    [HttpPost]
    public async Task<ActionResult<TaskResponseDto>> Create(TaskCreateDto request)
    {
        try
        {
            var userId = GetCurrentUserId();

            var task = await _taskService.CreateAsync(request, userId);

            return CreatedAtAction(nameof(GetById), new { id = task.Id }, task);
        }
        catch (ArgumentException exception)
        {
            return BadRequest(new { message = exception.Message });
        }
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<TaskResponseDto>> Update(int id, TaskUpdateDto request)
    {
        try
        {
            var userId = GetCurrentUserId();

            var task = await _taskService.UpdateAsync(id, request, userId);

            return Ok(task);
        }
        catch (ArgumentException exception)
        {
            return BadRequest(new { message = exception.Message });
        }
        catch (KeyNotFoundException exception)
        {
            return NotFound(new { message = exception.Message });
        }
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        try
        {
            var userId = GetCurrentUserId();

            await _taskService.DeleteAsync(id, userId);

            return NoContent();
        }
        catch (KeyNotFoundException exception)
        {
            return NotFound(new { message = exception.Message });
        }
    }

    private int GetCurrentUserId()
    {
        var userIdValue = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (!int.TryParse(userIdValue, out var userId))
        {
            throw new UnauthorizedAccessException("Invalid user token.");
        }

        return userId;
    }
}
