package com.diplomna.robota.tasks;

import java.util.UUID;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TaskRepository extends JpaRepository<TaskEntity, UUID> {
  Optional<TaskEntity> findByIdAndTeamId(UUID id, UUID teamId);
}
