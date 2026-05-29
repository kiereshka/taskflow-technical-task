using System.ComponentModel.DataAnnotations;

namespace TodoApi.DTOs;

public class TaskResponseDto
{
    public int Id { get; set; }

    public string Title { get; set; } = string.Empty;

    public string? Description { get; set; }

    public bool IsCompleted { get; set; }

    public DateTime? DueDate { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public int? CategoryId { get; set; }

    public string? CategoryName { get; set; }
}

public class TaskOverviewDto
{
    public int TotalTasks { get; set; }

    public int ActiveTasks { get; set; }

    public int CompletedTasks { get; set; }

    public int CategoriesCount { get; set; }

    public IEnumerable<TaskResponseDto> UpcomingTasks { get; set; } = [];

    public IEnumerable<TaskResponseDto> RecentTasks { get; set; } = [];
}

public class TaskCreateDto
{
    [Required]
    [StringLength(200)]
    public string Title { get; set; } = string.Empty;

    [StringLength(1000)]
    public string? Description { get; set; }

    public DateTime? DueDate { get; set; }

    public int? CategoryId { get; set; }
}

public class TaskUpdateDto
{
    [Required]
    [StringLength(200)]
    public string Title { get; set; } = string.Empty;

    [StringLength(1000)]
    public string? Description { get; set; }

    public bool IsCompleted { get; set; }

    public DateTime? DueDate { get; set; }

    public int? CategoryId { get; set; }
}

public class TaskQueryParametersDto
{
    public int Page { get; set; } = 1;

    public int PageSize { get; set; } = 10;

    public string? Search { get; set; }

    public int? CategoryId { get; set; }

    public string? Status { get; set; }
}
