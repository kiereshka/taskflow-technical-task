# TaskFlow

TaskFlow is a full-stack productivity dashboard for organizing tasks by category, completion status and due date. It is built as an interview-ready technical task with a clean Angular frontend and a layered ASP.NET Core REST API.

## Tech Stack

- ASP.NET Core Web API
- Entity Framework Core
- SQL Server Express
- JWT authentication
- Angular standalone components
- Bootstrap and SCSS

## Features

- Register and login with JWT authentication
- Logout with frontend token removal
- Create, view, edit and delete tasks
- Mark tasks as active or completed
- Create, view, edit and delete categories
- Search tasks by title or description
- Filter tasks by category
- Paginated task list
- Productivity dashboard overview
- Responsive Bootstrap UI

## Backend Setup

The backend project is located in `backend/TodoApi`.

Required User Secrets:

```bash
dotnet user-secrets set "ConnectionStrings:DefaultConnection" "YOUR_SQL_SERVER_CONNECTION_STRING"
dotnet user-secrets set "Jwt:Key" "YOUR_LONG_SECURE_JWT_KEY"
```

Secrets are not stored in `appsettings.json`. The repository configuration keeps sensitive values in User Secrets for local development.

Run the backend:

```bash
cd backend/TodoApi
dotnet run
```

Backend URL:

```text
http://localhost:5007
```

Expected API base URL:

```text
http://localhost:5007/api
```

## Frontend Setup

The frontend project is located in `frontend`.

Install dependencies:

```bash
cd frontend
npm install
```

Run the frontend:

```bash
ng serve
```

Frontend URL:

```text
http://localhost:4200
```

The Angular API base URL is configured in:

- `frontend/src/environments/environment.ts`
- `frontend/src/environments/environment.development.ts`

Default API URL:

```ts
apiUrl: 'http://localhost:5007/api'
```

## API Endpoints

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/tasks`
- `GET /api/tasks/overview`
- `GET /api/tasks/{id}`
- `POST /api/tasks`
- `PUT /api/tasks/{id}`
- `DELETE /api/tasks/{id}`
- `GET /api/categories`
- `POST /api/categories`
- `PUT /api/categories/{id}`
- `DELETE /api/categories/{id}`

Task list query example:

```text
GET /api/tasks?page=1&pageSize=10&search=test&categoryId=2
```
