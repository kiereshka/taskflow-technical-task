import { Component, OnInit, inject } from '@angular/core';
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

  categories: Category[] = [];
  name = '';
  editingCategoryId: number | null = null;
  errorMessage = '';
  successMessage = '';
  isLoading = false;

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.categoryService.getAll().subscribe({
      next: (categories) => {
        this.categories = categories;
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'Failed to load categories.';
        this.isLoading = false;
      },
    });
  }

  submit(): void {
    this.errorMessage = '';
    this.successMessage = '';

    const trimmedName = this.name.trim();

    if (!trimmedName) {
      this.errorMessage = 'Category name is required.';
      return;
    }

    if (this.editingCategoryId) {
      this.updateCategory(this.editingCategoryId, trimmedName);
      return;
    }

    this.createCategory(trimmedName);
  }

  startEdit(category: Category): void {
    this.editingCategoryId = category.id;
    this.name = category.name;
    this.errorMessage = '';
    this.successMessage = '';
  }

  cancelEdit(): void {
    this.editingCategoryId = null;
    this.name = '';
    this.errorMessage = '';
    this.successMessage = '';
  }

  deleteCategory(category: Category): void {
    const confirmed = confirm(
      `Delete category "${category.name}"? Tasks in this category will become uncategorized.`,
    );

    if (!confirmed) {
      return;
    }

    this.categoryService.delete(category.id).subscribe({
      next: () => {
        this.successMessage = 'Category deleted.';
        this.loadCategories();
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'Failed to delete category.';
      },
    });
  }

  private createCategory(name: string): void {
    this.categoryService.create({ name }).subscribe({
      next: () => {
        this.name = '';
        this.successMessage = 'Category created.';
        this.loadCategories();
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'Failed to create category.';
      },
    });
  }

  private updateCategory(id: number, name: string): void {
    this.categoryService.update(id, { name }).subscribe({
      next: () => {
        this.name = '';
        this.editingCategoryId = null;
        this.successMessage = 'Category updated.';
        this.loadCategories();
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'Failed to update category.';
      },
    });
  }
}
