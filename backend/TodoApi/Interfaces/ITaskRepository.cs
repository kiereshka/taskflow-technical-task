using TodoApi.DTOs;
using TodoApi.Models;

namespace TodoApi.Interfaces;

public interface ITaskRepository
{
    Task<PagedResultDto<TaskItem>> GetPagedAsync(TaskQueryParametersDto query, int userId);

    Task<TaskOverviewDto> GetOverviewAsync(int userId);

    Task<TaskItem?> GetByIdAsync(int id, int userId);

    Task<TaskItem> CreateAsync(TaskItem task);

    Task<TaskItem?> UpdateAsync(TaskItem task);

    Task<bool> DeleteAsync(int id, int userId);
}
