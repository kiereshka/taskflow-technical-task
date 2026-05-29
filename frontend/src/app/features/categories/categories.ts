import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgFor, NgIf } from '@angular/common';
import { CategoryService } from '../../services/category.service';
import { Category } from '../../models/category.models';

@Component({
  selector: 'app-categories',
  imports: [FormsModule, NgFor, NgIf],
  templateUrl: './categories.html',
  styleUrl: './categories.scss',
})
export class Categories implements OnInit {
  private readonly categoryService = inject(CategoryService);
  private readonly cdr = inject(ChangeDetectorRef);

  categories: Category[] = [];
  name = '';
  editingCategory: Category | null = null;
  editName = '';
  categoryToDelete: Category | null = null;
  errorMessage = '';
  hasLoadError = false;
  successMessage = '';
  isLoading = false;
  isSubmitting = false;
  pendingCategoryIds = new Set<number>();
  readonly nameMaxLength = 100;

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.hasLoadError = false;

    this.categoryService.getAll().subscribe({
      next: (categories) => {
        this.categories = categories;
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'Failed to load categories.';
        this.hasLoadError = true;
        this.isLoading = false;
        this.cdr.markForCheck();
      },
    });
  }

  submit(): void {
    if (this.isSubmitting) {
      return;
    }

    this.errorMessage = '';
    this.successMessage = '';

    const trimmedName = this.name.trim();

    if (!trimmedName) {
      this.errorMessage = 'Category name is required.';
      return;
    }

    if (trimmedName.length > this.nameMaxLength) {
      this.errorMessage = `Category name cannot be longer than ${this.nameMaxLength} characters.`;
      return;
    }

    this.createCategory(trimmedName);
  }

  startEdit(category: Category): void {
    if (this.isCategoryPending(category)) {
      return;
    }

    this.editingCategory = category;
    this.editName = category.name;
    this.errorMessage = '';
    this.successMessage = '';
  }

  cancelEdit(): void {
    this.editingCategory = null;
    this.editName = '';
    this.errorMessage = '';
    this.successMessage = '';
  }

  submitEdit(): void {
    if (this.isSubmitting || !this.editingCategory) {
      return;
    }

    this.errorMessage = '';
    this.successMessage = '';

    const trimmedName = this.editName.trim();

    if (!trimmedName) {
      this.errorMessage = 'Category name is required.';
      return;
    }

    if (trimmedName.length > this.nameMaxLength) {
      this.errorMessage = `Category name cannot be longer than ${this.nameMaxLength} characters.`;
      return;
    }

    this.updateCategory(this.editingCategory.id, trimmedName);
  }

  deleteCategory(category: Category): void {
    if (this.pendingCategoryIds.has(category.id)) {
      return;
    }

    this.categoryToDelete = category;
  }

  cancelDelete(): void {
    this.categoryToDelete = null;
  }

  confirmDeleteCategory(): void {
    if (!this.categoryToDelete || this.pendingCategoryIds.has(this.categoryToDelete.id)) {
      return;
    }

    const category = this.categoryToDelete;
    this.pendingCategoryIds.add(category.id);

    this.categoryService.delete(category.id).subscribe({
      next: () => {
        this.pendingCategoryIds.delete(category.id);
        this.categoryToDelete = null;
        this.successMessage = 'Category deleted.';
        this.loadCategories();
        this.cdr.markForCheck();
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'Failed to delete category.';
        this.pendingCategoryIds.delete(category.id);
        this.categoryToDelete = null;
        this.cdr.markForCheck();
      },
    });
  }

  isCategoryPending(category: Category): boolean {
    return this.pendingCategoryIds.has(category.id);
  }

  private createCategory(name: string): void {
    this.isSubmitting = true;

    this.categoryService.create({ name }).subscribe({
      next: () => {
        this.name = '';
        this.successMessage = 'Category created.';
        this.isSubmitting = false;
        this.loadCategories();
        this.cdr.markForCheck();
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'Failed to create category.';
        this.isSubmitting = false;
        this.cdr.markForCheck();
      },
    });
  }

  private updateCategory(id: number, name: string): void {
    this.isSubmitting = true;

    this.categoryService.update(id, { name }).subscribe({
      next: () => {
        this.name = '';
        this.editingCategory = null;
        this.editName = '';
        this.successMessage = 'Category updated.';
        this.isSubmitting = false;
        this.loadCategories();
        this.cdr.markForCheck();
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'Failed to update category.';
        this.isSubmitting = false;
        this.cdr.markForCheck();
      },
    });
  }
}
