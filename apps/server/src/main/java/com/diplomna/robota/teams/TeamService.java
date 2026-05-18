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
    return teamRepository.findAllByOwnerEmail(email).stream().map(TeamResponse::from).toList();
  }

  @Transactional
  public TeamResponse createFor(String email, String name) {
    var owner = userRepository.findByEmail(email).orElseThrow();
    var team = teamRepository.save(new TeamEntity(name, owner));
    teamMemberRepository.save(new TeamMemberEntity(team, owner, "OWNER"));
    return TeamResponse.from(team);
  }

  public TeamResponse getForMember(UUID teamId, String email) {
    boolean isMember = teamMemberRepository.existsByTeamIdAndUserEmail(teamId, email);
    if (!isMember) {
      throw new IllegalArgumentException("Team not accessible");
    }
    return teamRepository.findById(teamId).map(TeamResponse::from).orElseThrow();
  }
}
