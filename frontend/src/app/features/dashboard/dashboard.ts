import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { DatePipe, NgFor, NgIf } from '@angular/common';
import { TaskService } from '../../services/task.service';
import { TaskItem, TaskOverview } from '../../models/task.models';

@Component({
  selector: 'app-dashboard',
  imports: [NgFor, NgIf, DatePipe],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard implements OnInit {
  private readonly taskService = inject(TaskService);
  private readonly cdr = inject(ChangeDetectorRef);

  overview: TaskOverview | null = null;
  errorMessage = '';
  isLoading = false;

  ngOnInit(): void {
    this.loadOverview();
  }

  get totalTasks(): number {
    return this.overview?.totalTasks ?? 0;
  }

  get activeTasks(): number {
    return this.overview?.activeTasks ?? 0;
  }

  get completedTasks(): number {
    return this.overview?.completedTasks ?? 0;
  }

  get categoriesCount(): number {
    return this.overview?.categoriesCount ?? 0;
  }

  get upcomingTasks(): TaskItem[] {
    return this.overview?.upcomingTasks ?? [];
  }

  get recentTasks(): TaskItem[] {
    return this.overview?.recentTasks ?? [];
  }

  get completionRate(): number {
    if (!this.totalTasks) {
      return 0;
    }

    return Math.round((this.completedTasks / this.totalTasks) * 100);
  }

  get activeRate(): number {
    if (!this.totalTasks) {
      return 0;
    }

    return Math.round((this.activeTasks / this.totalTasks) * 100);
  }

  get focusLabel(): string {
    if (!this.totalTasks) {
      return 'Ready to plan';
    }

    if (this.completionRate >= 70) {
      return 'Strong progress';
    }

    if (this.activeTasks > this.completedTasks) {
      return 'Execution mode';
    }

    return 'Balanced workload';
  }

  loadOverview(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.taskService.getOverview().subscribe({
      next: (overview) => {
        this.overview = overview;
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'Failed to load dashboard.';
        this.isLoading = false;
        this.cdr.markForCheck();
      },
    });
  }
}
