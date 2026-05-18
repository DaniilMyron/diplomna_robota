package com.diplomna.robota.tasks;

import com.diplomna.robota.tasks.TaskDtos.TaskResponse;
import com.diplomna.robota.teams.TeamMemberRepository;
import com.diplomna.robota.teams.TeamRepository;
import com.diplomna.robota.users.UserEntity;
import com.diplomna.robota.users.UserRepository;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class TaskService {
  private final TaskRepository taskRepository;
  private final TeamRepository teamRepository;
  private final TeamMemberRepository teamMemberRepository;
  private final UserRepository userRepository;

  public TaskService(TaskRepository taskRepository, TeamRepository teamRepository, TeamMemberRepository teamMemberRepository, UserRepository userRepository) {
    this.taskRepository = taskRepository;
    this.teamRepository = teamRepository;
    this.teamMemberRepository = teamMemberRepository;
    this.userRepository = userRepository;
  }

  @Transactional
  public TaskResponse createForMember(UUID teamId, String email, String title, String description, UUID assigneeId) {
    requireMember(teamId, email);

    var team = teamRepository.findById(teamId).orElseThrow();
    UserEntity assignee = assigneeId == null ? null : resolveAssignee(teamId, assigneeId);
    return TaskResponse.from(taskRepository.save(new TaskEntity(title, description, team, assignee)));
  }

  @Transactional
  public TaskResponse updateForMember(UUID teamId, UUID taskId, String email, String title, String description, UUID assigneeId, TaskStatus status) {
    requireMember(teamId, email);
    var task = taskRepository.findByIdAndTeamId(taskId, teamId)
      .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Task not found"));
    UserEntity assignee = assigneeId == null ? null : resolveAssignee(teamId, assigneeId);
    task.update(title, description, assignee, status);
    return TaskResponse.from(task);
  }

  @Transactional
  public void deleteForMember(UUID teamId, UUID taskId, String email) {
    requireMember(teamId, email);
    var task = taskRepository.findByIdAndTeamId(taskId, teamId)
      .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Task not found"));
    taskRepository.delete(task);
  }

  private void requireMember(UUID teamId, String email) {
    if (!teamMemberRepository.existsByTeamIdAndUserEmail(teamId, email)) {
      throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Team not accessible");
    }
  }

  @Transactional
  public TaskResponse updateStatusForMember(UUID teamId, UUID taskId, String email, TaskStatus status) {
    requireMember(teamId, email);
    var task = taskRepository.findByIdAndTeamId(taskId, teamId)
      .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Task not found"));
    task.moveTo(status);
    return TaskResponse.from(task);
  }

  private UserEntity resolveAssignee(UUID teamId, UUID assigneeId) {
    if (!teamMemberRepository.existsByTeamIdAndUserId(teamId, assigneeId)) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Assignee must belong to the team");
    }
    return userRepository.findById(assigneeId).orElseThrow();
  }
}
