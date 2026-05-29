using Microsoft.EntityFrameworkCore;
using TodoApi.Models;

namespace TodoApi.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options)
    {
    }

    public DbSet<User> Users => Set<User>();

    public DbSet<Category> Categories => Set<Category>();

    public DbSet<TaskItem> Tasks => Set<TaskItem>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(user => user.Id);

            entity.HasIndex(user => user.Email)
                .IsUnique();

            entity.Property(user => user.Email)
                .IsRequired()
                .HasMaxLength(255);

            entity.Property(user => user.PasswordHash)
                .IsRequired();
        });

        modelBuilder.Entity<Category>(entity =>
        {
            entity.HasKey(category => category.Id);

            entity.Property(category => category.Name)
                .IsRequired()
                .HasMaxLength(100);

            entity.HasIndex(category => new { category.UserId, category.Name });

            entity.HasOne(category => category.User)
                .WithMany(user => user.Categories)
                .HasForeignKey(category => category.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<TaskItem>(entity =>
        {
            entity.HasKey(task => task.Id);

            entity.Property(task => task.Title)
                .IsRequired()
                .HasMaxLength(200);

            entity.Property(task => task.Description)
                .HasMaxLength(1000);

            entity.Property(task => task.CreatedAt)
                .IsRequired();

            entity.HasIndex(task => new { task.UserId, task.IsCompleted, task.CreatedAt });

            entity.HasIndex(task => new { task.UserId, task.CategoryId, task.IsCompleted, task.CreatedAt });

            entity.HasIndex(task => new { task.UserId, task.DueDate });

            entity.HasOne(task => task.User)
                .WithMany(user => user.Tasks)
                .HasForeignKey(task => task.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(task => task.Category)
                .WithMany(category => category.Tasks)
                .HasForeignKey(task => task.CategoryId)
                .OnDelete(DeleteBehavior.NoAction);
        });
    }
}
