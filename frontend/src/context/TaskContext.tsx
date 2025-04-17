import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { Task, Priority, Status, Category, TaskResponse } from '../types/task';
import { sampleTasks, generateId } from '../utils/taskUtils';
import { toast } from 'sonner';
import { taskApi } from '@/services/api';

interface TaskContextType {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => Promise<void>;
  updateTask: (task: Task) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  getTask: (id: string) => Task | undefined;
  filterTasks: (status?: Status, priority?: Priority, category?: Category, searchTerm?: string) => Task[];
  refreshTasks: () => Promise<void>;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

const convertResponseToTask = (response: TaskResponse): Task => ({
  id: response.id,
  title: response.title,
  description: response.description,
  priority: response.priority as Priority,
  status: response.status as Status,
  category: response.category as Category,
  createdAt: new Date(response.createdAt),
  dueDate: response.dueDate ? new Date(response.dueDate) : undefined,
});

export const TaskProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [tasks, setTasks] = useState<Task[]>(sampleTasks);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isApiEnabled, setIsApiEnabled] = useState<boolean>(false);

  const refreshTasks = async () => {
    if (!isApiEnabled) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await taskApi.getAllTasks();
      const convertedTasks = response.map(convertResponseToTask);
      setTasks(convertedTasks);
    } catch (err) {
      console.error('Failed to fetch tasks:', err);
      setError('Failed to fetch tasks. Using sample data instead.');
      setTasks(sampleTasks);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const checkApiAvailability = async () => {
      try {
        await taskApi.getAllTasks();
        setIsApiEnabled(true);
        refreshTasks();
      } catch (err) {
        console.log('API not available, using local data');
        setTasks(sampleTasks);
      }
    };

    checkApiAvailability();
  }, []);

  const addTask = async (task: Omit<Task, 'id' | 'createdAt'>) => {
    if (isApiEnabled) {
      setLoading(true);
      try {
        const dueDate = task.dueDate ? task.dueDate.toISOString() : undefined;
        const response = await taskApi.createTask({
          ...task,
          dueDate,
        });
        const newTask = convertResponseToTask(response);
        setTasks(prev => [newTask, ...prev]);
        toast.success('Task created successfully');
      } catch (err) {
        toast.error('Failed to create task');
        throw err;
      } finally {
        setLoading(false);
      }
    } else {
      const newTask: Task = {
        ...task,
        id: generateId(),
        createdAt: new Date()
      };
      setTasks(prev => [newTask, ...prev]);
      toast.success('Task created successfully');
    }
  };

  const updateTask = async (updatedTask: Task) => {
    if (isApiEnabled) {
      setLoading(true);
      try {
        const dueDate = updatedTask.dueDate ? updatedTask.dueDate.toISOString() : undefined;
        await taskApi.updateTask({
          id: updatedTask.id,
          title: updatedTask.title,
          description: updatedTask.description,
          priority: updatedTask.priority,
          status: updatedTask.status,
          category: updatedTask.category,
          dueDate,
        });
        setTasks(prev => 
          prev.map(task => task.id === updatedTask.id ? updatedTask : task)
        );
        toast.success('Task updated successfully');
      } catch (err) {
        toast.error('Failed to update task');
        throw err;
      } finally {
        setLoading(false);
      }
    } else {
      setTasks(prev => 
        prev.map(task => task.id === updatedTask.id ? updatedTask : task)
      );
      toast.success('Task updated successfully');
    }
  };

  const deleteTask = async (id: string) => {
    if (isApiEnabled) {
      setLoading(true);
      try {
        await taskApi.deleteTask(id);
        setTasks(prev => prev.filter(task => task.id !== id));
        toast.success('Task deleted successfully');
      } catch (err) {
        toast.error('Failed to delete task');
        throw err;
      } finally {
        setLoading(false);
      }
    } else {
      setTasks(prev => prev.filter(task => task.id !== id));
      toast.success('Task deleted successfully');
    }
  };

  const getTask = (id: string) => {
    return tasks.find(task => task.id === id);
  };

  const filterTasks = (
    status?: Status, 
    priority?: Priority, 
    category?: Category, 
    searchTerm?: string
  ) => {
    return tasks.filter(task => {
      const matchesStatus = !status || task.status === status;
      const matchesPriority = !priority || task.priority === priority;
      const matchesCategory = !category || task.category === category;
      const matchesSearch = !searchTerm || 
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        (task.description && task.description.toLowerCase().includes(searchTerm.toLowerCase()));
      
      return matchesStatus && matchesPriority && matchesCategory && matchesSearch;
    });
  };

  const value = {
    tasks,
    loading,
    error,
    addTask,
    updateTask,
    deleteTask,
    getTask,
    filterTasks,
    refreshTasks
  };

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
};

export const useTaskContext = (): TaskContextType => {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error('useTaskContext must be used within a TaskProvider');
  }
  return context;
};
