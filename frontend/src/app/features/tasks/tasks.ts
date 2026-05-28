import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe, NgFor, NgIf } from '@angular/common';
import { TaskService } from '../../services/task.service';
import { CategoryService } from '../../services/category.service';
import { TaskItem } from '../../models/task.models';
import { Category } from '../../models/category.models';

@Component({
  selector: 'app-tasks',
  imports: [FormsModule, NgFor, NgIf, DatePipe],
  templateUrl: './tasks.html',
  styleUrl: './tasks.scss',
})
export class Tasks implements OnInit {
  private readonly taskService = inject(TaskService);
  private readonly categoryService = inject(CategoryService);

  tasks: TaskItem[] = [];
  categories: Category[] = [];

  title = '';
  description = '';
  dueDate = '';
  categoryId: number | null = null;
  isCompleted = false;

  editingTaskId: number | null = null;

  search = '';
  selectedCategoryId: number | null = null;

  page = 1;
  pageSize = 10;
  totalItems = 0;
  totalPages = 0;

  errorMessage = '';
  successMessage = '';
  isLoading = false;

  ngOnInit(): void {
    this.loadCategories();
    this.loadTasks();
  }

  loadCategories(): void {
    this.categoryService.getAll().subscribe({
      next: (categories) => {
        this.categories = categories;
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'Failed to load categories.';
      },
    });
  }

  loadTasks(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.taskService
      .getPaged({
        page: this.page,
        pageSize: this.pageSize,
        search: this.search,
        categoryId: this.selectedCategoryId,
      })
      .subscribe({
        next: (result) => {
          this.tasks = result.items;
          this.page = result.page;
          this.pageSize = result.pageSize;
          this.totalItems = result.totalItems;
          this.totalPages = result.totalPages;
          this.isLoading = false;
        },
        error: (error) => {
          this.errorMessage = error.error?.message || 'Failed to load tasks.';
          this.isLoading = false;
        },
      });
  }

  submit(): void {
    this.errorMessage = '';
    this.successMessage = '';

    const trimmedTitle = this.title.trim();

    if (!trimmedTitle) {
      this.errorMessage = 'Task title is required.';
      return;
    }

    const dueDateValue = this.dueDate ? new Date(this.dueDate).toISOString() : null;

    if (this.editingTaskId) {
      this.taskService
        .update(this.editingTaskId, {
          title: trimmedTitle,
          description: this.description.trim() || null,
          isCompleted: this.isCompleted,
          dueDate: dueDateValue,
          categoryId: this.categoryId,
        })
        .subscribe({
          next: () => {
            this.successMessage = 'Task updated.';
            this.resetForm();
            this.loadTasks();
          },
          error: (error) => {
            this.errorMessage = error.error?.message || 'Failed to update task.';
          },
        });

      return;
    }

    this.taskService
      .create({
        title: trimmedTitle,
        description: this.description.trim() || null,
        dueDate: dueDateValue,
        categoryId: this.categoryId,
      })
      .subscribe({
        next: () => {
          this.successMessage = 'Task created.';
          this.resetForm();
          this.loadTasks();
        },
        error: (error) => {
          this.errorMessage = error.error?.message || 'Failed to create task.';
        },
      });
  }

  startEdit(task: TaskItem): void {
    this.editingTaskId = task.id;
    this.title = task.title;
    this.description = task.description || '';
    this.isCompleted = task.isCompleted;
    this.categoryId = task.categoryId || null;
    this.dueDate = task.dueDate ? task.dueDate.substring(0, 10) : '';
    this.errorMessage = '';
    this.successMessage = '';
  }

  cancelEdit(): void {
    this.resetForm();
  }

  toggleCompleted(task: TaskItem): void {
    this.taskService
      .update(task.id, {
        title: task.title,
        description: task.description,
        isCompleted: !task.isCompleted,
        dueDate: task.dueDate,
        categoryId: task.categoryId,
      })
      .subscribe({
        next: () => {
          this.loadTasks();
        },
        error: (error) => {
          this.errorMessage = error.error?.message || 'Failed to update task.';
        },
      });
  }

  deleteTask(task: TaskItem): void {
    const confirmed = confirm(`Delete task "${task.title}"?`);

    if (!confirmed) {
      return;
    }

    this.taskService.delete(task.id).subscribe({
      next: () => {
        this.successMessage = 'Task deleted.';

        if (this.tasks.length === 1 && this.page > 1) {
          this.page -= 1;
        }

        this.loadTasks();
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'Failed to delete task.';
      },
    });
  }

  applyFilters(): void {
    this.page = 1;
    this.loadTasks();
  }

  clearFilters(): void {
    this.search = '';
    this.selectedCategoryId = null;
    this.page = 1;
    this.loadTasks();
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages || page === this.page) {
      return;
    }

    this.page = page;
    this.loadTasks();
  }

  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, index) => index + 1);
  }

  private resetForm(): void {
    this.editingTaskId = null;
    this.title = '';
    this.description = '';
    this.dueDate = '';
    this.categoryId = null;
    this.isCompleted = false;
  }
}
