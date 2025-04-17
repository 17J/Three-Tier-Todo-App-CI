
export type Priority = 'low' | 'medium' | 'high';
export type Status = 'todo' | 'inprogress' | 'done';
export type Category = 'work' | 'personal' | 'study' | 'other';

export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: Priority;
  status: Status;
  category: Category;
  createdAt: Date;
  dueDate?: Date;
}

// Backend response types
export interface TaskResponse {
  id: string;
  title: string;
  description?: string;
  priority: string;
  status: string;
  category: string;
  createdAt: string;
  dueDate?: string;
}

// For API requests
export interface CreateTaskRequest {
  title: string;
  description?: string;
  priority: Priority;
  status: Status;
  category: Category;
  dueDate?: string;
}

export interface UpdateTaskRequest extends CreateTaskRequest {
  id: string;
}
