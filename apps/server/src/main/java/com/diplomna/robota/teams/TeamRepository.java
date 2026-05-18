package com.diplomna.robota.teams;

import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TeamRepository extends JpaRepository<TeamEntity, UUID> {
  List<TeamEntity> findAllByOwnerEmail(String email);
}
