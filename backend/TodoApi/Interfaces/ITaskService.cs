using TodoApi.DTOs;

namespace TodoApi.Interfaces;

public interface ITaskService
{
    Task<PagedResultDto<TaskResponseDto>> GetPagedAsync(TaskQueryParametersDto query, int userId);

    Task<TaskResponseDto> GetByIdAsync(int id, int userId);

    Task<TaskResponseDto> CreateAsync(TaskCreateDto request, int userId);

    Task<TaskResponseDto> UpdateAsync(int id, TaskUpdateDto request, int userId);

    Task DeleteAsync(int id, int userId);
}