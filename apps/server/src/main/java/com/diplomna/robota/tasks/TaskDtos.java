package com.diplomna.robota.tasks;

import com.diplomna.robota.users.UserEntity;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.Instant;
import java.util.UUID;

public final class TaskDtos {
  private TaskDtos() {}

  public record CreateTaskRequest(@NotBlank String title, String description, UUID assigneeId) {}
  public record CreateTaskCommentRequest(@NotBlank String body) {}

  public record UpdateTaskRequest(@NotBlank String title, String description, UUID assigneeId, @NotNull TaskStatus status) {}
  public record UpdateTaskStatusRequest(@NotNull TaskStatus status) {}

  public record AssigneeResponse(UUID id, String username, String displayName, String avatarUrl) {
    static AssigneeResponse from(UserEntity assignee) {
      return new AssigneeResponse(assignee.getId(), assignee.getUsername(), assignee.getDisplayName(), assignee.getAvatarUrl());
    }
  }

  public record TaskResponse(UUID id, String title, String description, TaskStatus status, AssigneeResponse assignee) {
    static TaskResponse from(TaskEntity task) {
      var assignee = task.getAssignee() == null ? null : AssigneeResponse.from(task.getAssignee());
      return new TaskResponse(task.getId(), task.getTitle(), task.getDescription(), task.getStatus(), assignee);
    }
  }

  public record TaskCommentResponse(UUID id, String body, AssigneeResponse author, Instant createdAt) {
    static TaskCommentResponse from(TaskCommentEntity comment) {
      return new TaskCommentResponse(comment.getId(), comment.getBody(), AssigneeResponse.from(comment.getAuthor()), comment.getCreatedAt());
    }
  }
}
