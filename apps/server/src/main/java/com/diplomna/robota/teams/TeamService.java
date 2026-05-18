package com.diplomna.robota.teams;

import com.diplomna.robota.teams.TeamDtos.TeamResponse;
import com.diplomna.robota.users.UserRepository;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class TeamService {
  private final TeamRepository teamRepository;
  private final TeamMemberRepository teamMemberRepository;
  private final UserRepository userRepository;

  public TeamService(TeamRepository teamRepository, TeamMemberRepository teamMemberRepository, UserRepository userRepository) {
    this.teamRepository = teamRepository;
    this.teamMemberRepository = teamMemberRepository;
    this.userRepository = userRepository;
  }

  public List<TeamResponse> listFor(String email) {
    return teamRepository.findAllByOwnerEmail(email).stream()
      .map(team -> TeamResponse.from(team, teamMemberRepository.findAllByTeamIdOrderByCreatedAtAsc(team.getId()), true))
      .toList();
  }

  @Transactional
  public TeamResponse createFor(String email, String name) {
    var owner = userRepository.findByEmail(email).orElseThrow();
    var team = teamRepository.save(new TeamEntity(name, owner));
    teamMemberRepository.save(new TeamMemberEntity(team, owner, "OWNER"));
    return TeamResponse.from(team, teamMemberRepository.findAllByTeamIdOrderByCreatedAtAsc(team.getId()), true);
  }

  public TeamResponse getForMember(UUID teamId, String email) {
    boolean isMember = teamMemberRepository.existsByTeamIdAndUserEmail(teamId, email);
    if (!isMember) {
      throw new TeamAccessDeniedException();
    }
    var team = teamRepository.findById(teamId).orElseThrow();
    return TeamResponse.from(team, teamMemberRepository.findAllByTeamIdOrderByCreatedAtAsc(teamId), team.getOwner().getEmail().equals(email));
  }

  @Transactional
  public TeamResponse addMember(UUID teamId, String actorEmail, String lookup) {
    var team = teamRepository.findById(teamId).orElseThrow();
    if (!team.getOwner().getEmail().equals(actorEmail)) {
      throw new TeamAccessDeniedException();
    }

    var user = lookup.startsWith("@")
      ? userRepository.findByUsername(lookup.substring(1)).orElseThrow(TeamMemberNotFoundException::new)
      : userRepository.findByEmail(lookup).orElseThrow(TeamMemberNotFoundException::new);

    if (!teamMemberRepository.existsByTeamIdAndUserId(teamId, user.getId())) {
      teamMemberRepository.save(new TeamMemberEntity(team, user, "MEMBER"));
    }

    return TeamResponse.from(team, teamMemberRepository.findAllByTeamIdOrderByCreatedAtAsc(teamId), true);
  }
}
