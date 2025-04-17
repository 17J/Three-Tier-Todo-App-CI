
import { CreateTaskRequest, TaskResponse, UpdateTaskRequest } from '@/types/task';

// This is a placeholder for the actual API URL
const API_BASE_URL = 'http://localhost:8080/api';

// Helper function to handle API responses
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'API request failed');
  }
  return response.json();
};

// Task API methods
export const taskApi = {
  // Get all tasks
  getAllTasks: async (): Promise<TaskResponse[]> => {
    const response = await fetch(`${API_BASE_URL}/tasks`);
    return handleResponse(response);
  },

  // Get task by ID
  getTaskById: async (id: string): Promise<TaskResponse> => {
    const response = await fetch(`${API_BASE_URL}/tasks/${id}`);
    return handleResponse(response);
  },

  // Create a new task
  createTask: async (task: CreateTaskRequest): Promise<TaskResponse> => {
    const response = await fetch(`${API_BASE_URL}/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(task),
    });
    return handleResponse(response);
  },

  // Update an existing task
  updateTask: async (task: UpdateTaskRequest): Promise<TaskResponse> => {
    const response = await fetch(`${API_BASE_URL}/tasks/${task.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(task),
    });
    return handleResponse(response);
  },

  // Delete a task
  deleteTask: async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
      method: 'DELETE',
    });
    return handleResponse(response);
  },
};
