
import React from 'react';
import TaskCard from './TaskCard';
import { Task } from '@/types/task';
import { ClipboardListIcon } from 'lucide-react';

interface TaskListProps {
  tasks: Task[];
  onEditTask: (taskId: string) => void;
}

const TaskList: React.FC<TaskListProps> = ({ tasks, onEditTask }) => {
  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center bg-muted/50 rounded-lg p-12 text-center animate-fade-in">
        <ClipboardListIcon className="h-16 w-16 text-muted-foreground mb-4" />
        <h3 className="text-xl font-medium mb-2">No tasks found</h3>
        <p className="text-muted-foreground">
          Try changing your filters or create a new task to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {tasks.map((task) => (
        <TaskCard
          key={task.id}
          task={task}
          onEdit={() => onEditTask(task.id)}
        />
      ))}
    </div>
  );
};

export default TaskList;

