
import React from 'react';
import { PlusIcon, ListChecksIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TaskHeaderProps {
  onAddTask: () => void;
}

const TaskHeader: React.FC<TaskHeaderProps> = ({ onAddTask }) => {
  return (
    <div className="flex items-center justify-between mb-6 animate-fade-in">
      <div className="flex items-center">
        <ListChecksIcon className="h-8 w-8 text-primary mr-3" />
        <div>
          <h1 className="text-2xl font-bold">Task Manager</h1>
          <p className="text-muted-foreground text-sm">Organize your tasks efficiently</p>
        </div>
      </div>
      <Button onClick={onAddTask} className="gap-1">
        <PlusIcon size={18} /> New Task
      </Button>
    </div>
  );
};

export default TaskHeader;

