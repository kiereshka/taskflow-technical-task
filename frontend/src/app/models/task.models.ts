export interface TaskItem {
  id: number;
  title: string;
  description?: string | null;
  isCompleted: boolean;
  dueDate?: string | null;
  createdAt: string;
  updatedAt?: string | null;
  categoryId?: number | null;
  categoryName?: string | null;
}

export interface TaskCreateRequest {
  title: string;
  description?: string | null;
  dueDate?: string | null;
  categoryId?: number | null;
}

export interface TaskUpdateRequest {
  title: string;
  description?: string | null;
  isCompleted: boolean;
  dueDate?: string | null;
  categoryId?: number | null;
}

export interface TaskQueryParams {
  page: number;
  pageSize: number;
  search?: string;
  categoryId?: number | null;
}
