using TodoApi.DTOs;

namespace TodoApi.Interfaces;

public interface ICategoryService
{
    Task<IEnumerable<CategoryResponseDto>> GetAllAsync(int userId);

    Task<CategoryResponseDto> GetByIdAsync(int id, int userId);

    Task<CategoryResponseDto> CreateAsync(CategoryCreateDto request, int userId);

    Task<CategoryResponseDto> UpdateAsync(int id, CategoryUpdateDto request, int userId);

    Task DeleteAsync(int id, int userId);
}