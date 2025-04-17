
import React, { useState } from 'react';
import { TaskProvider } from '@/context/TaskContext';
import TaskHeader from '@/components/TaskHeader';
import TaskFilter from '@/components/TaskFilter';
import TaskList from '@/components/TaskList';
import TaskForm from '@/components/TaskForm';
import { Status, Priority, Category } from '@/types/task';
import { useTaskContext } from '@/context/TaskContext';

const TaskManager: React.FC = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | undefined>(undefined);
  const [statusFilter, setStatusFilter] = useState<Status | undefined>(undefined);
  const [priorityFilter, setPriorityFilter] = useState<Priority | undefined>(undefined);
  const [categoryFilter, setCategoryFilter] = useState<Category | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState('');
  
  const { filterTasks } = useTaskContext();

  const handleAddTask = () => {
    setEditingTaskId(undefined);
    setIsFormOpen(true);
  };
  
  const handleEditTask = (taskId: string) => {
    setEditingTaskId(taskId);
    setIsFormOpen(true);
  };
  
  const handleFormOpenChange = (open: boolean) => {
    setIsFormOpen(open);
    if (!open) {
      setEditingTaskId(undefined);
    }
  };
  
  const resetFilters = () => {
    setStatusFilter(undefined);
    setPriorityFilter(undefined);
    setCategoryFilter(undefined);
    setSearchTerm('');
  };
  
  const filteredTasks = filterTasks(statusFilter, priorityFilter, categoryFilter, searchTerm);

  return (
    <div className="container mx-auto py-8 px-4">
      <TaskHeader onAddTask={handleAddTask} />
      
      <TaskFilter
        statusFilter={statusFilter}
        priorityFilter={priorityFilter}
        categoryFilter={categoryFilter}
        searchTerm={searchTerm}
        onStatusChange={setStatusFilter}
        onPriorityChange={setPriorityFilter}
        onCategoryChange={setCategoryFilter}
        onSearchChange={setSearchTerm}
        onResetFilters={resetFilters}
      />
      
      <TaskList tasks={filteredTasks} onEditTask={handleEditTask} />
      
      <TaskForm
        open={isFormOpen}
        onOpenChange={handleFormOpenChange}
        editTaskId={editingTaskId}
      />
    </div>
  );
};

const Index = () => {
  return (
    <TaskProvider>
      <TaskManager />
    </TaskProvider>
  );
};

export default Index;

