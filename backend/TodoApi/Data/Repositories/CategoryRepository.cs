using Microsoft.EntityFrameworkCore;
using TodoApi.Data;
using TodoApi.Interfaces;
using TodoApi.Models;

namespace TodoApi.Data.Repositories;

public class CategoryRepository : ICategoryRepository
{
    private readonly AppDbContext _context;

    public CategoryRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Category>> GetAllByUserIdAsync(int userId)
    {
        return await _context.Categories
            .Where(category => category.UserId == userId)
            .OrderBy(category => category.Name)
            .ToListAsync();
    }

    public async Task<Category?> GetByIdAsync(int id, int userId)
    {
        return await _context.Categories
            .FirstOrDefaultAsync(category => category.Id == id && category.UserId == userId);
    }

    public async Task<Category> CreateAsync(Category category)
    {
        _context.Categories.Add(category);
        await _context.SaveChangesAsync();

        return category;
    }

    public async Task<Category?> UpdateAsync(Category category)
    {
        var existingCategory = await _context.Categories
            .FirstOrDefaultAsync(item => item.Id == category.Id && item.UserId == category.UserId);

        if (existingCategory is null)
        {
            return null;
        }

        existingCategory.Name = category.Name;

        await _context.SaveChangesAsync();

        return existingCategory;
    }

    public async Task<bool> DeleteAsync(int id, int userId)
    {
        var category = await _context.Categories
            .FirstOrDefaultAsync(item => item.Id == id && item.UserId == userId);

        if (category is null)
        {
            return false;
        }

        var relatedTasks = await _context.Tasks
            .Where(task => task.CategoryId == id && task.UserId == userId)
            .ToListAsync();

        foreach (var task in relatedTasks)
        {
            task.CategoryId = null;
        }

        _context.Categories.Remove(category);
        await _context.SaveChangesAsync();

        return true;
    }

    public async Task<bool> ExistsByNameAsync(string name, int userId)
    {
        var normalizedName = name.Trim().ToLower();

        return await _context.Categories
            .AnyAsync(category =>
                category.UserId == userId &&
                category.Name.ToLower() == normalizedName);
    }

    public async Task<bool> ExistsByIdAsync(int id, int userId)
    {
        return await _context.Categories
            .AnyAsync(category => category.Id == id && category.UserId == userId);
    }
}