using TodoApi.DTOs;
using TodoApi.Interfaces;
using TodoApi.Models;

namespace TodoApi.Services;

public class TaskService : ITaskService
{
    private readonly ITaskRepository _taskRepository;
    private readonly ICategoryRepository _categoryRepository;

    public TaskService(ITaskRepository taskRepository, ICategoryRepository categoryRepository)
    {
        _taskRepository = taskRepository;
        _categoryRepository = categoryRepository;
    }

    public async Task<PagedResultDto<TaskResponseDto>> GetPagedAsync(TaskQueryParametersDto query, int userId)
    {
        var pagedTasks = await _taskRepository.GetPagedAsync(query, userId);

        return new PagedResultDto<TaskResponseDto>
        {
            Items = pagedTasks.Items.Select(MapToResponseDto),
            Page = pagedTasks.Page,
            PageSize = pagedTasks.PageSize,
            TotalItems = pagedTasks.TotalItems,
            TotalPages = pagedTasks.TotalPages
        };
    }

    public async Task<TaskResponseDto> GetByIdAsync(int id, int userId)
    {
        var task = await _taskRepository.GetByIdAsync(id, userId);

        if (task is null)
        {
            throw new KeyNotFoundException("Task was not found.");
        }

        return MapToResponseDto(task);
    }

    public async Task<TaskResponseDto> CreateAsync(TaskCreateDto request, int userId)
    {
        ValidateTitle(request.Title);

        if (request.CategoryId.HasValue)
        {
            var categoryExists = await _categoryRepository.ExistsByIdAsync(request.CategoryId.Value, userId);

            if (!categoryExists)
            {
                throw new ArgumentException("Selected category does not exist.");
            }
        }

        var task = new TaskItem
        {
            Title = request.Title.Trim(),
            Description = NormalizeOptionalText(request.Description),
            DueDate = request.DueDate,
            CategoryId = request.CategoryId,
            UserId = userId,
            IsCompleted = false,
            CreatedAt = DateTime.UtcNow
        };

        var createdTask = await _taskRepository.CreateAsync(task);

        return MapToResponseDto(createdTask);
    }

    public async Task<TaskResponseDto> UpdateAsync(int id, TaskUpdateDto request, int userId)
    {
        ValidateTitle(request.Title);

        var existingTask = await _taskRepository.GetByIdAsync(id, userId);

        if (existingTask is null)
        {
            throw new KeyNotFoundException("Task was not found.");
        }

        if (request.CategoryId.HasValue)
        {
            var categoryExists = await _categoryRepository.ExistsByIdAsync(request.CategoryId.Value, userId);

            if (!categoryExists)
            {
                throw new ArgumentException("Selected category does not exist.");
            }
        }

        existingTask.Title = request.Title.Trim();
        existingTask.Description = NormalizeOptionalText(request.Description);
        existingTask.IsCompleted = request.IsCompleted;
        existingTask.DueDate = request.DueDate;
        existingTask.CategoryId = request.CategoryId;

        var updatedTask = await _taskRepository.UpdateAsync(existingTask);

        if (updatedTask is null)
        {
            throw new KeyNotFoundException("Task was not found.");
        }

        return MapToResponseDto(updatedTask);
    }

    public async Task DeleteAsync(int id, int userId)
    {
        var deleted = await _taskRepository.DeleteAsync(id, userId);

        if (!deleted)
        {
            throw new KeyNotFoundException("Task was not found.");
        }
    }

    private static void ValidateTitle(string title)
    {
        if (string.IsNullOrWhiteSpace(title))
        {
            throw new ArgumentException("Task title is required.");
        }

        if (title.Trim().Length > 200)
        {
            throw new ArgumentException("Task title cannot be longer than 200 characters.");
        }
    }

    private static string? NormalizeOptionalText(string? value)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            return null;
        }

        return value.Trim();
    }

    private static TaskResponseDto MapToResponseDto(TaskItem task)
    {
        return new TaskResponseDto
        {
            Id = task.Id,
            Title = task.Title,
            Description = task.Description,
            IsCompleted = task.IsCompleted,
            DueDate = task.DueDate,
            CreatedAt = task.CreatedAt,
            UpdatedAt = task.UpdatedAt,
            CategoryId = task.CategoryId,
            CategoryName = task.Category?.Name
        };
    }
}