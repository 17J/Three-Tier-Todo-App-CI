
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Task, Priority, Status, Category } from '@/types/task';
import { useTaskContext } from '@/context/TaskContext';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface TaskFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editTaskId?: string;
}

type FormData = Omit<Task, 'id' | 'createdAt'>;

const TaskForm: React.FC<TaskFormProps> = ({ 
  open, 
  onOpenChange,
  editTaskId 
}) => {
  const { addTask, getTask, updateTask } = useTaskContext();
  const [date, setDate] = useState<Date | undefined>(undefined);

  const form = useForm<FormData>({
    defaultValues: {
      title: '',
      description: '',
      priority: 'medium' as Priority,
      status: 'todo' as Status,
      category: 'work' as Category,
    }
  });
  
  // Reset form and load task data if editing
  useEffect(() => {
    if (open) {
      if (editTaskId) {
        const task = getTask(editTaskId);
        if (task) {
          form.reset({
            title: task.title,
            description: task.description || '',
            priority: task.priority,
            status: task.status,
            category: task.category,
          });
          setDate(task.dueDate);
        }
      } else {
        form.reset({
          title: '',
          description: '',
          priority: 'medium',
          status: 'todo',
          category: 'work',
        });
        setDate(undefined);
      }
    }
  }, [open, editTaskId, getTask, form]);

  const onSubmit = (data: FormData) => {
    if (editTaskId) {
      const task = getTask(editTaskId);
      if (task) {
        updateTask({
          ...task,
          ...data,
          dueDate: date
        });
      }
    } else {
      addTask({
        ...data,
        dueDate: date
      });
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{editTaskId ? 'Edit Task' : 'Create New Task'}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="Task title"
              {...form.register('title', { required: true })}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea
              id="description"
              placeholder="Add details about this task"
              className="min-h-[80px]"
              {...form.register('description')}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select
                defaultValue={form.getValues('priority')}
                onValueChange={(value) => form.setValue('priority', value as Priority)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                defaultValue={form.getValues('category')}
                onValueChange={(value) => form.setValue('category', value as Category)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="work">Work</SelectItem>
                  <SelectItem value="personal">Personal</SelectItem>
                  <SelectItem value="study">Study</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                defaultValue={form.getValues('status')}
                onValueChange={(value) => form.setValue('status', value as Status)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todo">To Do</SelectItem>
                  <SelectItem value="inprogress">In Progress</SelectItem>
                  <SelectItem value="done">Done</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Due Date (Optional)</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          
          <DialogFooter>
            <Button type="submit">
              {editTaskId ? 'Update' : 'Create'} Task
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TaskForm;

