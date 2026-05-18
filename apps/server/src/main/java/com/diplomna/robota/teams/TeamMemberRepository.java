package com.diplomna.robota.teams;

import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TeamMemberRepository extends JpaRepository<TeamMemberEntity, UUID> {
  boolean existsByTeamIdAndUserEmail(UUID teamId, String email);
  List<TeamMemberEntity> findAllByUserEmail(String email);
}
