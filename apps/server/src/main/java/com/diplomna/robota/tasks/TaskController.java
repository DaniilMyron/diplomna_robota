package com.diplomna.robota.tasks;

import com.diplomna.robota.tasks.TaskDtos.CreateTaskRequest;
import com.diplomna.robota.tasks.TaskDtos.TaskResponse;
import com.diplomna.robota.tasks.TaskDtos.UpdateTaskRequest;
import com.diplomna.robota.tasks.TaskDtos.UpdateTaskStatusRequest;
import jakarta.validation.Valid;
import java.security.Principal;
import java.util.List;
import java.util.UUID;
import org.springframework.web.bind.annotation.GetMapping;
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

  @GetMapping
  public List<TaskResponse> list(Principal principal, @PathVariable UUID teamId) {
    return taskService.listForMember(teamId, principal.getName());
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

  @PatchMapping("/{taskId}/status")
  public TaskResponse updateStatus(
      Principal principal,
      @PathVariable UUID teamId,
      @PathVariable UUID taskId,
      @Valid @RequestBody UpdateTaskStatusRequest request) {
    return taskService.updateStatusForMember(teamId, taskId, principal.getName(), request.status());
  }
}
