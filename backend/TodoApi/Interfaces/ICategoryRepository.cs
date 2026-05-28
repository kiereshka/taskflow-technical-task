using TodoApi.Models;

namespace TodoApi.Interfaces;

public interface ICategoryRepository
{
    Task<IEnumerable<Category>> GetAllByUserIdAsync(int userId);

    Task<Category?> GetByIdAsync(int id, int userId);

    Task<Category> CreateAsync(Category category);

    Task<Category?> UpdateAsync(Category category);

    Task<bool> DeleteAsync(int id, int userId);

    Task<bool> ExistsByNameAsync(string name, int userId);

    Task<bool> ExistsByIdAsync(int id, int userId);
}