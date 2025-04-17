
import { Priority, Status, Task, Category } from "../types/task";

// Generate a unique ID
export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 9);
};

// Get priority color class
export const getPriorityColorClass = (priority: Priority): string => {
  return `bg-task-${priority}`;
};

// Get status color class
export const getStatusColorClass = (status: Status): string => {
  return `bg-task-${status}`;
};

// Get status display text
export const getStatusDisplayText = (status: Status): string => {
  const statusMap: Record<Status, string> = {
    todo: 'To Do',
    inprogress: 'In Progress',
    done: 'Done'
  };
  return statusMap[status];
};

// Get priority display text
export const getPriorityDisplayText = (priority: Priority): string => {
  const priorityMap: Record<Priority, string> = {
    low: 'Low',
    medium: 'Medium',
    high: 'High'
  };
  return priorityMap[priority];
};

// Get category display text
export const getCategoryDisplayText = (category: Category): string => {
  const categoryMap: Record<Category, string> = {
    work: 'Work',
    personal: 'Personal',
    study: 'Study',
    other: 'Other'
  };
  return categoryMap[category];
};

// Get formatted date
export const formatDate = (date: Date): string => {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

// Sample tasks data
export const sampleTasks: Task[] = [
  {
    id: generateId(),
    title: 'Complete project proposal',
    description: 'Draft the initial proposal for client review',
    priority: 'high',
    status: 'todo',
    category: 'work',
    createdAt: new Date(),
    dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000) // 2 days from now
  },
  {
    id: generateId(),
    title: 'Update documentation',
    description: 'Update the API documentation with new endpoints',
    priority: 'medium',
    status: 'inprogress',
    category: 'work',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000) // 1 day from now
  },
  {
    id: generateId(),
    title: 'Buy groceries',
    description: 'Get milk, eggs, bread and vegetables',
    priority: 'low',
    status: 'todo',
    category: 'personal',
    createdAt: new Date(),
    dueDate: new Date(Date.now() + 12 * 60 * 60 * 1000) // 12 hours from now
  },
  {
    id: generateId(),
    title: 'Finish React tutorial',
    description: 'Complete sections 4-6 of the advanced React course',
    priority: 'medium',
    status: 'inprogress',
    category: 'study',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) // 3 days from now
  },
  {
    id: generateId(),
    title: 'Schedule dentist appointment',
    description: 'Call Dr. Smith for annual checkup',
    priority: 'low',
    status: 'done',
    category: 'personal',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
    dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) // 1 day ago
  },
  {
    id: generateId(),
    title: 'Team weekly meeting',
    description: 'Prepare slides for the weekly progress update',
    priority: 'high',
    status: 'todo',
    category: 'work',
    createdAt: new Date(),
    dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000) // 1 day from now
  }
];

