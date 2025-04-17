
import React from 'react';
import { Status, Priority, Category } from '@/types/task';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { SearchIcon, FilterIcon, XIcon } from 'lucide-react';

interface TaskFilterProps {
  statusFilter: Status | undefined;
  priorityFilter: Priority | undefined;
  categoryFilter: Category | undefined;
  searchTerm: string;
  onStatusChange: (value: Status | undefined) => void;
  onPriorityChange: (value: Priority | undefined) => void;
  onCategoryChange: (value: Category | undefined) => void;
  onSearchChange: (value: string) => void;
  onResetFilters: () => void;
}

const TaskFilter: React.FC<TaskFilterProps> = ({
  statusFilter,
  priorityFilter,
  categoryFilter,
  searchTerm,
  onStatusChange,
  onPriorityChange,
  onCategoryChange,
  onSearchChange,
  onResetFilters
}) => {
  const handleStatusChange = (value: string) => {
    onStatusChange(value === 'all' ? undefined : value as Status);
  };

  const handlePriorityChange = (value: string) => {
    onPriorityChange(value === 'all' ? undefined : value as Priority);
  };

  const handleCategoryChange = (value: string) => {
    onCategoryChange(value === 'all' ? undefined : value as Category);
  };

  const isFiltersApplied = statusFilter || priorityFilter || categoryFilter || searchTerm;

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border mb-6 animate-fade-in">
      <div className="mb-4 flex items-center">
        <FilterIcon size={18} className="text-primary mr-2" />
        <h3 className="text-lg font-medium">Filter Tasks</h3>
        {isFiltersApplied && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onResetFilters}
            className="ml-auto text-xs"
          >
            <XIcon size={14} className="mr-1" /> Clear filters
          </Button>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="relative">
          <Input
            placeholder="Search tasks..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pr-8"
          />
          <SearchIcon className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
        </div>
        
        <Select
          value={statusFilter || 'all'}
          onValueChange={handleStatusChange}
        >
          <SelectTrigger>
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="todo">To Do</SelectItem>
            <SelectItem value="inprogress">In Progress</SelectItem>
            <SelectItem value="done">Done</SelectItem>
          </SelectContent>
        </Select>
        
        <Select
          value={priorityFilter || 'all'}
          onValueChange={handlePriorityChange}
        >
          <SelectTrigger>
            <SelectValue placeholder="Filter by priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priorities</SelectItem>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="high">High</SelectItem>
          </SelectContent>
        </Select>
        
        <Select
          value={categoryFilter || 'all'}
          onValueChange={handleCategoryChange}
        >
          <SelectTrigger>
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="work">Work</SelectItem>
            <SelectItem value="personal">Personal</SelectItem>
            <SelectItem value="study">Study</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default TaskFilter;

