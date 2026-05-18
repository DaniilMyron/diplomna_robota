package com.diplomna.robota.teams;

import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TeamMemberRepository extends JpaRepository<TeamMemberEntity, UUID> {
  boolean existsByTeamIdAndUserEmail(UUID teamId, String email);
}
