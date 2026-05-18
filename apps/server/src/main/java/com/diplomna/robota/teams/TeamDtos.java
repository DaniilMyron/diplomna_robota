package com.diplomna.robota.teams;

import jakarta.validation.constraints.NotBlank;
import com.diplomna.robota.users.UserEntity;
import java.util.List;
import java.util.UUID;

public final class TeamDtos {
  private TeamDtos() {}

  public record CreateTeamRequest(@NotBlank String name) {}
  public record AddTeamMemberRequest(@NotBlank String lookup) {}
  public record TeamMemberResponse(UUID id, String email, String username, String displayName, String avatarUrl) {
    static TeamMemberResponse from(UserEntity user) {
      return new TeamMemberResponse(user.getId(), user.getEmail(), user.getUsername(), user.getDisplayName(), user.getAvatarUrl());
    }
  }
  public record TeamResponse(UUID id, String name, List<TeamMemberResponse> members, boolean canManageMembership) {
    static TeamResponse from(TeamEntity team, List<TeamMemberEntity> members, boolean canManageMembership) {
      return new TeamResponse(
        team.getId(),
        team.getName(),
        members.stream().map(member -> TeamMemberResponse.from(member.getUser())).toList(),
        canManageMembership
      );
    }
  }
}
