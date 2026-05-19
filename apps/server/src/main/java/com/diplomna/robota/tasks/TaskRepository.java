package com.diplomna.robota.tasks;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface TaskRepository extends JpaRepository<TaskEntity, UUID> {
  Optional<TaskEntity> findByIdAndTeamId(UUID id, UUID teamId);
  List<TaskEntity> findAllByTeamIdOrderByCreatedAtAsc(UUID teamId);

  @Modifying
  @Query("update TaskEntity task set task.assignee = null where task.team.id = :teamId and task.assignee.id = :assigneeId")
  void clearAssigneeForTeamMember(UUID teamId, UUID assigneeId);
}
