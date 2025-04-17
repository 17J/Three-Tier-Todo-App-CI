
package com.taskmanager.service;

import com.taskmanager.dto.TaskDTO;
import com.taskmanager.model.Task;
import com.taskmanager.repository.TaskRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class TaskService {
    private final TaskRepository taskRepository;

    @Autowired
    public TaskService(TaskRepository taskRepository) {
        this.taskRepository = taskRepository;
    }

    public List<TaskDTO> getAllTasks() {
        return taskRepository.findAll().stream()
                .map(TaskDTO::new)
                .collect(Collectors.toList());
    }

    public Optional<TaskDTO> getTaskById(String id) {
        return taskRepository.findById(id).map(TaskDTO::new);
    }

    public TaskDTO createTask(TaskDTO taskDTO) {
        Task task = convertDTOToEntity(taskDTO);
        Task savedTask = taskRepository.save(task);
        return new TaskDTO(savedTask);
    }

    public Optional<TaskDTO> updateTask(String id, TaskDTO taskDTO) {
        return taskRepository.findById(id)
                .map(existingTask -> {
                    updateTaskFromDTO(existingTask, taskDTO);
                    Task updatedTask = taskRepository.save(existingTask);
                    return new TaskDTO(updatedTask);
                });
    }

    public boolean deleteTask(String id) {
        if (taskRepository.existsById(id)) {
            taskRepository.deleteById(id);
            return true;
        }
        return false;
    }

    private Task convertDTOToEntity(TaskDTO taskDTO) {
        Task task = new Task();
        task.setTitle(taskDTO.getTitle());
        task.setDescription(taskDTO.getDescription());
        
        if (taskDTO.getPriority() != null) {
            task.setPriority(Task.Priority.valueOf(taskDTO.getPriority().toUpperCase()));
        }
        
        if (taskDTO.getStatus() != null) {
            task.setStatus(Task.Status.valueOf(taskDTO.getStatus().toUpperCase()));
        }
        
        if (taskDTO.getCategory() != null) {
            task.setCategory(Task.Category.valueOf(taskDTO.getCategory().toUpperCase()));
        }
        
        task.setDueDate(taskDTO.getDueDate());
        
        return task;
    }

    private void updateTaskFromDTO(Task task, TaskDTO taskDTO) {
        if (taskDTO.getTitle() != null) task.setTitle(taskDTO.getTitle());
        if (taskDTO.getDescription() != null) task.setDescription(taskDTO.getDescription());
        
        if (taskDTO.getPriority() != null) {
            task.setPriority(Task.Priority.valueOf(taskDTO.getPriority().toUpperCase()));
        }
        
        if (taskDTO.getStatus() != null) {
            task.setStatus(Task.Status.valueOf(taskDTO.getStatus().toUpperCase()));
        }
        
        if (taskDTO.getCategory() != null) {
            task.setCategory(Task.Category.valueOf(taskDTO.getCategory().toUpperCase()));
        }
        
        task.setDueDate(taskDTO.getDueDate());
    }
}
