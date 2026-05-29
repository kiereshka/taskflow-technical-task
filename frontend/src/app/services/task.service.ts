import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PagedResult } from '../models/paged-result.models';
import {
  TaskCreateRequest,
  TaskItem,
  TaskOverview,
  TaskQueryParams,
  TaskUpdateRequest,
} from '../models/task.models';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class TaskService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/Tasks`;

  getPaged(query: TaskQueryParams): Observable<PagedResult<TaskItem>> {
    let params = new HttpParams().set('page', query.page).set('pageSize', query.pageSize);

    if (query.search?.trim()) {
      params = params.set('search', query.search.trim());
    }

    if (query.categoryId) {
      params = params.set('categoryId', query.categoryId);
    }

    if (query.status) {
      params = params.set('status', query.status);
    }

    return this.http.get<PagedResult<TaskItem>>(this.apiUrl, { params });
  }

  getOverview(): Observable<TaskOverview> {
    return this.http.get<TaskOverview>(`${this.apiUrl}/overview`);
  }

  getById(id: number): Observable<TaskItem> {
    return this.http.get<TaskItem>(`${this.apiUrl}/${id}`);
  }

  create(request: TaskCreateRequest): Observable<TaskItem> {
    return this.http.post<TaskItem>(this.apiUrl, request);
  }

  update(id: number, request: TaskUpdateRequest): Observable<TaskItem> {
    return this.http.put<TaskItem>(`${this.apiUrl}/${id}`, request);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
