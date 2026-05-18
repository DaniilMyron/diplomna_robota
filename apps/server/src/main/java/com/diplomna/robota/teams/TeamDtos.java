package com.diplomna.robota.teams;

import jakarta.validation.constraints.NotBlank;
import java.util.UUID;

public final class TeamDtos {
  private TeamDtos() {}

  public record CreateTeamRequest(@NotBlank String name) {}
  public record TeamResponse(UUID id, String name) {
    static TeamResponse from(TeamEntity team) {
      return new TeamResponse(team.getId(), team.getName());
    }
  }
}
