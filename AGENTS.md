# Project Instructions for Codex

This is a full-stack To-Do application technical task, similar to Microsoft To-Do.

## Project structure

- `frontend/` contains the Angular application.
- `backend/` contains the ASP.NET Core REST API.

## Main rule

Before making changes, identify whether the user is asking for frontend work, backend work, or full-stack work.

Do not modify both frontend and backend in the same task unless the user explicitly asks for a full-stack change.

If unsure, explain which files need to be changed before editing.

## Required features

The application must support:

- Creating tasks
- Viewing tasks
- Editing tasks
- Deleting tasks
- Adding categories for tasks
- Login and logout
- Pagination for the task list
- Searching tasks by text
- Filtering tasks by category

## Frontend requirements

- Use Angular.
- Use Bootstrap for styling unless Tailwind is explicitly requested.
- Use Angular services for API requests.
- Use TypeScript interfaces for models.
- Use environment configuration for the API base URL.
- Do not hardcode backend data inside components.
- Keep components small and readable.
- Do not change backend files unless explicitly asked.

## Backend requirements

- Use ASP.NET Core / .NET Web API.
- Build a REST API.
- Use Entity Framework Core.
- Use Dependency Injection.
- Use a relational database.
- Prefer MS SQL Server unless another relational database is explicitly chosen.
- Use JWT-based authentication unless another authentication approach is explicitly requested.
- Frontend logout should remove the stored authentication token.
- Do not expose EF Core entities directly from controllers.
- Use DTOs for request and response models.
- Keep business logic inside services, not controllers.
- Do not change frontend files unless explicitly asked.

## Backend architecture

Use 4-level architecture:

1. Controllers
2. Services
3. Interfaces
4. Data Access

Recommended backend structure:

- Controllers/
- Services/
- Interfaces/
- Data/
    - AppDbContext
    - Repositories or data access classes
- Models/
- DTOs/

## API conventions

Use REST API endpoints under `/api`.

Expected endpoints:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/tasks`
- `GET /api/tasks/{id}`
- `POST /api/tasks`
- `PUT /api/tasks/{id}`
- `DELETE /api/tasks/{id}`
- `GET /api/categories`
- `POST /api/categories`
- `PUT /api/categories/{id}`
- `DELETE /api/categories/{id}`

Task list query example:

`GET /api/tasks?page=1&pageSize=10&search=test&categoryId=2`

Expected paginated response shape:

```json
{
  "items": [],
  "page": 1,
  "pageSize": 10,
  "totalItems": 0,
  "totalPages": 0
}