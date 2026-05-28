using Microsoft.EntityFrameworkCore;
using TodoApi.DTOs;
using TodoApi.Interfaces;
using TodoApi.Models;

namespace TodoApi.Data.Repositories;

public class TaskRepository : ITaskRepository
{
    private readonly AppDbContext _context;

    public TaskRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<PagedResultDto<TaskItem>> GetPagedAsync(TaskQueryParametersDto query, int userId)
    {
        var page = query.Page < 1 ? 1 : query.Page;
        var pageSize = query.PageSize < 1 ? 10 : query.PageSize;

        if (pageSize > 50)
        {
            pageSize = 50;
        }

        var tasksQuery = _context.Tasks
            .Include(task => task.Category)
            .Where(task => task.UserId == userId)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(query.Search))
        {
            var search = query.Search.Trim().ToLower();

            tasksQuery = tasksQuery.Where(task =>
                task.Title.ToLower().Contains(search) ||
                (task.Description != null && task.Description.ToLower().Contains(search)));
        }

        if (query.CategoryId.HasValue)
        {
            tasksQuery = tasksQuery.Where(task => task.CategoryId == query.CategoryId.Value);
        }

        var totalItems = await tasksQuery.CountAsync();

        var items = await tasksQuery
            .OrderBy(task => task.IsCompleted)
            .ThenByDescending(task => task.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        var totalPages = (int)Math.Ceiling(totalItems / (double)pageSize);

        return new PagedResultDto<TaskItem>
        {
            Items = items,
            Page = page,
            PageSize = pageSize,
            TotalItems = totalItems,
            TotalPages = totalPages
        };
    }

    public async Task<TaskItem?> GetByIdAsync(int id, int userId)
    {
        return await _context.Tasks
            .Include(task => task.Category)
            .FirstOrDefaultAsync(task => task.Id == id && task.UserId == userId);
    }

    public async Task<TaskItem> CreateAsync(TaskItem task)
    {
        _context.Tasks.Add(task);
        await _context.SaveChangesAsync();

        return await _context.Tasks
            .Include(item => item.Category)
            .FirstAsync(item => item.Id == task.Id);
    }

    public async Task<TaskItem?> UpdateAsync(TaskItem task)
    {
        var existingTask = await _context.Tasks
            .Include(item => item.Category)
            .FirstOrDefaultAsync(item => item.Id == task.Id && item.UserId == task.UserId);

        if (existingTask is null)
        {
            return null;
        }

        existingTask.Title = task.Title;
        existingTask.Description = task.Description;
        existingTask.IsCompleted = task.IsCompleted;
        existingTask.DueDate = task.DueDate;
        existingTask.CategoryId = task.CategoryId;
        existingTask.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return await _context.Tasks
            .Include(item => item.Category)
            .FirstAsync(item => item.Id == existingTask.Id);
    }

    public async Task<bool> DeleteAsync(int id, int userId)
    {
        var task = await _context.Tasks
            .FirstOrDefaultAsync(item => item.Id == id && item.UserId == userId);

        if (task is null)
        {
            return false;
        }

        _context.Tasks.Remove(task);
        await _context.SaveChangesAsync();

        return true;
    }
}