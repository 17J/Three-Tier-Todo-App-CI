
# Task Manager Application

This is a full-stack task management application built with React and Spring Boot.

## Features

- Create, read, update, and delete tasks
- Filter tasks by status, priority, category, and search terms
- Responsive design with animations
- Backend API with Java Spring Boot 
- Docker support for easy deployment

## Project Structure

```
task-manager/
├── frontend/ (React application)
│   ├── src/
│   │   ├── components/ (UI components)
│   │   ├── context/ (React context for state management)
│   │   ├── pages/ (Route components)
│   │   ├── services/ (API services)
│   │   ├── types/ (TypeScript interfaces)
│   │   └── utils/ (Helper functions)
│   └── Dockerfile
├── backend/ (Spring Boot application)
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/taskmanager/
│   │   │   │   ├── controller/ (REST controllers)
│   │   │   │   ├── model/ (Entity classes)
│   │   │   │   ├── repository/ (Data access)
│   │   │   │   └── service/ (Business logic)
│   │   │   └── resources/
│   │   │       └── application.properties (Configuration)
│   └── Dockerfile
└── docker-compose.yml (Docker setup)
```

## Getting Started

### Prerequisites

- Node.js and npm
- Java Development Kit (JDK) 17
- Docker and Docker Compose (optional)

### Running Locally

#### Frontend

```bash
cd frontend
npm install
npm run dev
```

#### Backend

```bash
cd backend
./mvnw spring-boot:run
```

### Using Docker

```bash
docker-compose up
```

## API Endpoints

- `GET /api/tasks` - Get all tasks
- `GET /api/tasks/{id}` - Get task by ID
- `POST /api/tasks` - Create new task
- `PUT /api/tasks/{id}` - Update task
- `DELETE /api/tasks/{id}` - Delete task

## Development

The frontend will work with or without the backend being available:
- If the backend is running, it will fetch and save data via the API
- If the backend is not running, it will use local sample data

## License

MIT
