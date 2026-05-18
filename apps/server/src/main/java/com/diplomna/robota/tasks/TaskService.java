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
    if (!teamMemberRepository.existsByTeamIdAndUserEmail(teamId, email)) {
      throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Team not accessible");
    }

    var team = teamRepository.findById(teamId).orElseThrow();
    UserEntity assignee = assigneeId == null ? null : resolveAssignee(teamId, assigneeId);
    return TaskResponse.from(taskRepository.save(new TaskEntity(title, description, team, assignee)));
  }

  private UserEntity resolveAssignee(UUID teamId, UUID assigneeId) {
    if (!teamMemberRepository.existsByTeamIdAndUserId(teamId, assigneeId)) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Assignee must belong to the team");
    }
    return userRepository.findById(assigneeId).orElseThrow();
  }
}
