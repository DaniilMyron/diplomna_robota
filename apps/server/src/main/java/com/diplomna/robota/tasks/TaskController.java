package com.diplomna.robota.tasks;

import com.diplomna.robota.tasks.TaskDtos.CreateTaskRequest;
import com.diplomna.robota.tasks.TaskDtos.TaskResponse;
import com.diplomna.robota.tasks.TaskDtos.UpdateTaskRequest;
import jakarta.validation.Valid;
import java.security.Principal;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/teams/{teamId}/tasks")
public class TaskController {
  private final TaskService taskService;

  public TaskController(TaskService taskService) {
    this.taskService = taskService;
  }

  @PostMapping
  public TaskResponse create(Principal principal, @PathVariable UUID teamId, @Valid @RequestBody CreateTaskRequest request) {
    return taskService.createForMember(teamId, principal.getName(), request.title(), request.description(), request.assigneeId());
  }

  @PatchMapping("/{taskId}")
  public TaskResponse update(Principal principal, @PathVariable UUID teamId, @PathVariable UUID taskId, @Valid @RequestBody UpdateTaskRequest request) {
    return taskService.updateForMember(teamId, taskId, principal.getName(), request.title(), request.description(), request.assigneeId(), request.status());
  }

  @DeleteMapping("/{taskId}")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  public void delete(Principal principal, @PathVariable UUID teamId, @PathVariable UUID taskId) {
    taskService.deleteForMember(teamId, taskId, principal.getName());
  }
}
