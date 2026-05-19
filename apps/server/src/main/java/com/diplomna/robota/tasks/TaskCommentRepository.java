package com.diplomna.robota.tasks;

import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TaskCommentRepository extends JpaRepository<TaskCommentEntity, UUID> {
  List<TaskCommentEntity> findAllByTaskIdOrderByCreatedAtAsc(UUID taskId);
}
