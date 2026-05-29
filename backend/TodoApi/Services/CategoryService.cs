using TodoApi.DTOs;
using TodoApi.Interfaces;
using TodoApi.Models;

namespace TodoApi.Services;

public class CategoryService : ICategoryService
{
    private readonly ICategoryRepository _categoryRepository;

    public CategoryService(ICategoryRepository categoryRepository)
    {
        _categoryRepository = categoryRepository;
    }

    public async Task<IEnumerable<CategoryResponseDto>> GetAllAsync(int userId)
    {
        var categories = await _categoryRepository.GetAllByUserIdAsync(userId);

        return categories.Select(MapToResponseDto);
    }

    public async Task<CategoryResponseDto> GetByIdAsync(int id, int userId)
    {
        var category = await _categoryRepository.GetByIdAsync(id, userId);

        if (category is null)
        {
            throw new KeyNotFoundException("Category was not found.");
        }

        return MapToResponseDto(category);
    }

    public async Task<CategoryResponseDto> CreateAsync(CategoryCreateDto request, int userId)
    {
        var name = NormalizeName(request.Name);

        var exists = await _categoryRepository.ExistsByNameAsync(name, userId);

        if (exists)
        {
            throw new InvalidOperationException("Category with this name already exists.");
        }

        var category = new Category
        {
            Name = name,
            UserId = userId
        };

        var createdCategory = await _categoryRepository.CreateAsync(category);

        return MapToResponseDto(createdCategory);
    }

    public async Task<CategoryResponseDto> UpdateAsync(int id, CategoryUpdateDto request, int userId)
    {
        var name = NormalizeName(request.Name);

        var existingCategory = await _categoryRepository.GetByIdAsync(id, userId);

        if (existingCategory is null)
        {
            throw new KeyNotFoundException("Category was not found.");
        }

        if (!string.Equals(existingCategory.Name, name, StringComparison.OrdinalIgnoreCase))
        {
            var nameExists = await _categoryRepository.ExistsByNameAsync(name, userId);

            if (nameExists)
            {
                throw new InvalidOperationException("Category with this name already exists.");
            }
        }

        existingCategory.Name = name;

        var updatedCategory = await _categoryRepository.UpdateAsync(existingCategory);

        if (updatedCategory is null)
        {
            throw new KeyNotFoundException("Category was not found.");
        }

        return MapToResponseDto(updatedCategory);
    }

    public async Task DeleteAsync(int id, int userId)
    {
        var deleted = await _categoryRepository.DeleteAsync(id, userId);

        if (!deleted)
        {
            throw new KeyNotFoundException("Category was not found.");
        }
    }

    private static CategoryResponseDto MapToResponseDto(Category category)
    {
        return new CategoryResponseDto
        {
            Id = category.Id,
            Name = category.Name
        };
    }

    private static string NormalizeName(string? value)
    {
        var name = value?.Trim() ?? string.Empty;

        if (string.IsNullOrWhiteSpace(name))
        {
            throw new ArgumentException("Category name is required.");
        }

        if (name.Length > 100)
        {
            throw new ArgumentException("Category name cannot be longer than 100 characters.");
        }

        return name;
    }
}
