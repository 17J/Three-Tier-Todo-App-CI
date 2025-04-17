
import React, { useEffect } from 'react';
import { TaskProvider, useTaskContext } from '@/context/TaskContext';
import TaskHeader from '@/components/TaskHeader';
import TaskFilter from '@/components/TaskFilter';
import TaskList from '@/components/TaskList';
import TaskForm from '@/components/TaskForm';
import { Status, Priority, Category } from '@/types/task';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

const TaskManagerWithAPI: React.FC = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | undefined>(undefined);
  const [statusFilter, setStatusFilter] = useState<Status | undefined>(undefined);
  const [priorityFilter, setPriorityFilter] = useState<Priority | undefined>(undefined);
  const [categoryFilter, setCategoryFilter] = useState<Category | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState('');
  
  const { filterTasks, refreshTasks, loading, error } = useTaskContext();

  useEffect(() => {
    refreshTasks();
  }, [refreshTasks]);

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
    <div className="container mx-auto pt-4 pb-8 px-4">
      <TaskHeader onAddTask={handleAddTask} />
      
      <div className="flex justify-end mb-4">
        <Button 
          onClick={() => refreshTasks()} 
          variant="outline"
          disabled={loading}
          className="flex items-center gap-2"
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          Refresh
        </Button>
      </div>
      
      {error && (
        <div className="bg-destructive/15 text-destructive p-4 rounded-md mb-4">
          {error}
        </div>
      )}
      
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
      
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : (
        <TaskList tasks={filteredTasks} onEditTask={handleEditTask} />
      )}
      
      <TaskForm
        open={isFormOpen}
        onOpenChange={handleFormOpenChange}
        editTaskId={editingTaskId}
      />
    </div>
  );
};

const Tasks = () => {
  return (
    <TaskProvider>
      <TaskManagerWithAPI />
    </TaskProvider>
  );
};

export default Tasks;
