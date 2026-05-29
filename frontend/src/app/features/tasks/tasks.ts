import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe, NgClass, NgFor, NgIf } from '@angular/common';
import { TaskService } from '../../services/task.service';
import { CategoryService } from '../../services/category.service';
import { TaskItem } from '../../models/task.models';
import { Category } from '../../models/category.models';

@Component({
  selector: 'app-tasks',
  imports: [FormsModule, NgFor, NgIf, NgClass, DatePipe],
  templateUrl: './tasks.html',
  styleUrl: './tasks.scss',
})
export class Tasks implements OnInit {
  private readonly taskService = inject(TaskService);
  private readonly categoryService = inject(CategoryService);
  private readonly cdr = inject(ChangeDetectorRef);

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
  selectedStatus: string | null = null;

  page = 1;
  pageSize = 10;
  totalItems = 0;
  totalPages = 0;

  errorMessage = '';
  successMessage = '';
  isLoading = false;
  isSubmitting = false;

  ngOnInit(): void {
    this.loadCategories();
    this.loadTasks();
  }

  get visibleRangeStart(): number {
    if (this.totalItems === 0) {
      return 0;
    }

    return (this.page - 1) * this.pageSize + 1;
  }

  get visibleRangeEnd(): number {
    return Math.min(this.page * this.pageSize, this.totalItems);
  }

  get visibleItemsCount(): number {
    return this.tasks.length;
  }

  loadCategories(): void {
    this.categoryService.getAll().subscribe({
      next: (categories) => {
        this.categories = categories;
        this.cdr.markForCheck();
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'Failed to load categories.';
        this.cdr.markForCheck();
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
        status: this.selectedStatus,
      })
      .subscribe({
        next: (result) => {
          this.tasks = result.items;
          this.page = result.page;
          this.pageSize = result.pageSize;
          this.totalItems = result.totalItems;
          this.totalPages = result.totalPages;
          this.isLoading = false;
          this.cdr.markForCheck();
        },
        error: (error) => {
          this.errorMessage = error.error?.message || 'Failed to load tasks.';
          this.isLoading = false;
          this.cdr.markForCheck();
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

    this.isSubmitting = true;
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
            this.isSubmitting = false;
            this.resetForm();
            this.loadTasks();
            this.cdr.markForCheck();
          },
          error: (error) => {
            this.errorMessage = error.error?.message || 'Failed to update task.';
            this.isSubmitting = false;
            this.cdr.markForCheck();
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
          this.isSubmitting = false;
          this.resetForm();
          this.loadTasks();
          this.cdr.markForCheck();
        },
        error: (error) => {
          this.errorMessage = error.error?.message || 'Failed to create task.';
          this.isSubmitting = false;
          this.cdr.markForCheck();
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
          this.cdr.markForCheck();
        },
        error: (error) => {
          this.errorMessage = error.error?.message || 'Failed to update task.';
          this.cdr.markForCheck();
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
        this.cdr.markForCheck();
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'Failed to delete task.';
        this.cdr.markForCheck();
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
    this.selectedStatus = null;
    this.page = 1;
    this.loadTasks();
  }

  changePageSize(value: string): void {
    this.pageSize = Number(value);
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

  isOverdue(task: TaskItem): boolean {
    const dueDate = this.toDateOnly(task.dueDate);

    if (!dueDate || task.isCompleted) {
      return false;
    }

    return dueDate < this.getToday();
  }

  isDueToday(task: TaskItem): boolean {
    const dueDate = this.toDateOnly(task.dueDate);

    if (!dueDate || task.isCompleted) {
      return false;
    }

    return dueDate.getTime() === this.getToday().getTime();
  }

  getStatusLabel(task: TaskItem): string {
    if (task.isCompleted) {
      return 'Completed';
    }

    if (this.isOverdue(task)) {
      return 'Overdue';
    }

    if (this.isDueToday(task)) {
      return 'Due today';
    }

    return 'Active';
  }

  getStatusBadgeClass(task: TaskItem): string {
    if (task.isCompleted) {
      return 'status-completed';
    }

    if (this.isOverdue(task)) {
      return 'status-overdue';
    }

    if (this.isDueToday(task)) {
      return 'status-today';
    }

    return 'status-active';
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

  private toDateOnly(value?: string | null): Date | null {
    if (!value) {
      return null;
    }

    const date = new Date(value);
    date.setHours(0, 0, 0, 0);
    return date;
  }

  private getToday(): Date {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  }
}
