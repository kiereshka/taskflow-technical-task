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
            .AsNoTracking()
            .Include(task => task.Category)
            .Where(task => task.UserId == userId)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(query.Search))
        {
            var search = query.Search.Trim();

            tasksQuery = tasksQuery.Where(task =>
                task.Title.Contains(search) ||
                (task.Description != null && task.Description.Contains(search)));
        }

        if (query.CategoryId.HasValue)
        {
            tasksQuery = tasksQuery.Where(task => task.CategoryId == query.CategoryId.Value);
        }

        var today = DateTime.UtcNow.Date;
        var tomorrow = today.AddDays(1);
        var status = query.Status?.Trim().ToLowerInvariant();

        tasksQuery = status switch
        {
            "active" => tasksQuery.Where(task =>
                !task.IsCompleted &&
                (task.DueDate == null || task.DueDate >= tomorrow)),
            "overdue" => tasksQuery.Where(task =>
                !task.IsCompleted &&
                task.DueDate != null &&
                task.DueDate < today),
            "today" => tasksQuery.Where(task =>
                !task.IsCompleted &&
                task.DueDate != null &&
                task.DueDate >= today &&
                task.DueDate < tomorrow),
            "completed" => tasksQuery.Where(task => task.IsCompleted),
            _ => tasksQuery
        };

        var totalItems = await tasksQuery.CountAsync();

        var items = await tasksQuery
            .OrderBy(task =>
                task.IsCompleted
                    ? 4
                    : task.DueDate != null && task.DueDate < today
                        ? 0
                        : task.DueDate != null && task.DueDate < tomorrow
                            ? 1
                            : task.DueDate != null
                                ? 2
                                : 3)
            .ThenBy(task => task.DueDate ?? DateTime.MaxValue)
            .ThenByDescending(task => task.UpdatedAt ?? task.CreatedAt)
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

    public async Task<TaskOverviewDto> GetOverviewAsync(int userId)
    {
        var taskStats = await _context.Tasks
            .AsNoTracking()
            .Where(task => task.UserId == userId)
            .GroupBy(_ => 1)
            .Select(group => new
            {
                TotalTasks = group.Count(),
                ActiveTasks = group.Count(task => !task.IsCompleted),
                CompletedTasks = group.Count(task => task.IsCompleted)
            })
            .FirstOrDefaultAsync();

        var categoriesCount = await _context.Categories
            .AsNoTracking()
            .CountAsync(category => category.UserId == userId);

        var upcomingTasks = await _context.Tasks
            .AsNoTracking()
            .Include(task => task.Category)
            .Where(task => task.UserId == userId && !task.IsCompleted && task.DueDate != null)
            .OrderBy(task => task.DueDate)
            .ThenByDescending(task => task.CreatedAt)
            .Take(5)
            .Select(task => new TaskResponseDto
            {
                Id = task.Id,
                Title = task.Title,
                Description = task.Description,
                IsCompleted = task.IsCompleted,
                DueDate = task.DueDate,
                CreatedAt = task.CreatedAt,
                UpdatedAt = task.UpdatedAt,
                CategoryId = task.CategoryId,
                CategoryName = task.Category != null ? task.Category.Name : null
            })
            .ToListAsync();

        var recentTasks = await _context.Tasks
            .AsNoTracking()
            .Include(task => task.Category)
            .Where(task => task.UserId == userId)
            .OrderByDescending(task => task.UpdatedAt ?? task.CreatedAt)
            .Take(5)
            .Select(task => new TaskResponseDto
            {
                Id = task.Id,
                Title = task.Title,
                Description = task.Description,
                IsCompleted = task.IsCompleted,
                DueDate = task.DueDate,
                CreatedAt = task.CreatedAt,
                UpdatedAt = task.UpdatedAt,
                CategoryId = task.CategoryId,
                CategoryName = task.Category != null ? task.Category.Name : null
            })
            .ToListAsync();

        return new TaskOverviewDto
        {
            TotalTasks = taskStats?.TotalTasks ?? 0,
            ActiveTasks = taskStats?.ActiveTasks ?? 0,
            CompletedTasks = taskStats?.CompletedTasks ?? 0,
            CategoriesCount = categoriesCount,
            UpcomingTasks = upcomingTasks,
            RecentTasks = recentTasks
        };
    }

    public async Task<TaskItem?> GetByIdAsync(int id, int userId)
    {
        return await _context.Tasks
            .AsNoTracking()
            .Include(task => task.Category)
            .FirstOrDefaultAsync(task => task.Id == id && task.UserId == userId);
    }

    public async Task<TaskItem> CreateAsync(TaskItem task)
    {
        _context.Tasks.Add(task);
        await _context.SaveChangesAsync();

        return await _context.Tasks
            .AsNoTracking()
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
            .AsNoTracking()
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
