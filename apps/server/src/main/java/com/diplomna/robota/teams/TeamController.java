package com.diplomna.robota.teams;

import com.diplomna.robota.teams.TeamDtos.CreateTeamRequest;
import com.diplomna.robota.teams.TeamDtos.TeamResponse;
import jakarta.validation.Valid;
import java.security.Principal;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/teams")
public class TeamController {
  private final TeamService teamService;

  public TeamController(TeamService teamService) {
    this.teamService = teamService;
  }

  @GetMapping
  public List<TeamResponse> list(Principal principal) {
    return teamService.listFor(principal.getName());
  }

  @PostMapping
  public TeamResponse create(Principal principal, @Valid @RequestBody CreateTeamRequest request) {
    return teamService.createFor(principal.getName(), request.name());
  }
}
