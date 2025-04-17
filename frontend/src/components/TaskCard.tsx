
import React from 'react';
import { Task } from '../types/task';
import { 
  getPriorityColorClass, 
  getStatusColorClass, 
  getPriorityDisplayText, 
  getStatusDisplayText,
  getCategoryDisplayText,
  formatDate
} from '../utils/taskUtils';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CalendarIcon, PencilIcon, Trash2Icon } from 'lucide-react';
import { useTaskContext } from '@/context/TaskContext';

interface TaskCardProps {
  task: Task;
  onEdit: () => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onEdit }) => {
  const { deleteTask, updateTask } = useTaskContext();
  
  const handleToggleStatus = () => {
    let newStatus: Task['status'] = 'todo';
    
    if (task.status === 'todo') newStatus = 'inprogress';
    else if (task.status === 'inprogress') newStatus = 'done';
    else if (task.status === 'done') newStatus = 'todo';
    
    updateTask({
      ...task,
      status: newStatus
    });
  };

  return (
    <Card className="animate-fade-in task-card">
      <CardHeader className="pb-2 pt-4">
        <div className="flex justify-between items-start">
          <div className="flex items-start space-x-2">
            <div className={`${getPriorityColorClass(task.priority)} priority-dot mt-1.5`} />
            <div>
              <h3 className="font-medium leading-none text-lg">{task.title}</h3>
              <p className="text-xs mt-1 text-muted-foreground">
                Category: {getCategoryDisplayText(task.category)}
              </p>
            </div>
          </div>
          <Button 
            variant="ghost"
            className={`${getStatusColorClass(task.status)} text-white hover:text-white status-badge`}
            onClick={handleToggleStatus}
          >
            {getStatusDisplayText(task.status)}
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="pt-2">
        {task.description && (
          <p className="text-sm text-muted-foreground">{task.description}</p>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-between border-t pt-3">
        <div className="flex items-center text-xs text-muted-foreground">
          <CalendarIcon size={14} className="mr-1" />
          {task.dueDate ? `Due: ${formatDate(task.dueDate)}` : 'No due date'}
        </div>
        
        <div className="flex space-x-1">
          <Button variant="ghost" size="sm" onClick={onEdit}>
            <PencilIcon size={14} />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => deleteTask(task.id)}>
            <Trash2Icon size={14} />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default TaskCard;

