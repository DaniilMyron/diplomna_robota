package com.diplomna.robota.teams;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.diplomna.robota.auth.JwtService;
import com.diplomna.robota.users.UserEntity;
import com.diplomna.robota.users.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class TeamControllerTest {
  @Autowired MockMvc mockMvc;
  @Autowired UserRepository userRepository;
  @Autowired TeamRepository teamRepository;
  @Autowired TeamMemberRepository teamMemberRepository;
  @Autowired PasswordEncoder passwordEncoder;
  @Autowired JwtService jwtService;

  @Test
  void authenticatedUserCanCreateAndListTeams() throws Exception {
    var user = userRepository.save(new UserEntity("owner@example.com", "owner", "Owner", "/avatars/default.png", passwordEncoder.encode("secret123")));
    String token = jwtService.createToken(user.getEmail());

    mockMvc.perform(post("/api/teams")
        .header("Authorization", "Bearer " + token)
        .contentType(MediaType.APPLICATION_JSON)
        .content("{\"name\":\"Platform\"}"))
      .andExpect(status().isOk())
      .andExpect(jsonPath("$.name").value("Platform"));

    mockMvc.perform(get("/api/teams").header("Authorization", "Bearer " + token))
      .andExpect(status().isOk())
      .andExpect(jsonPath("$[0].name").value("Platform"));
  }

  @Test
  void teamMemberCanOpenBoardTeamDetail() throws Exception {
    var user = userRepository.save(new UserEntity("member@example.com", "member", "Member", "/avatars/default.png", passwordEncoder.encode("secret123")));
    String token = jwtService.createToken(user.getEmail());

    String response = mockMvc.perform(post("/api/teams")
        .header("Authorization", "Bearer " + token)
        .contentType(MediaType.APPLICATION_JSON)
        .content("{\"name\":\"Platform\"}"))
      .andReturn()
      .getResponse()
      .getContentAsString();

    String teamId = response.replaceAll("^\\{\"id\":\"([^\"]+)\".*", "$1");

    mockMvc.perform(get("/api/teams/" + teamId).header("Authorization", "Bearer " + token))
      .andExpect(status().isOk())
      .andExpect(jsonPath("$.name").value("Platform"))
      .andExpect(jsonPath("$.members[0].email").value("member@example.com"))
      .andExpect(jsonPath("$.canManageMembership").value(true));
  }

  @Test
  void ownerCanAddExistingMembersByUsername() throws Exception {
    var owner = userRepository.save(new UserEntity("owner-add@example.com", "owner-add", "Owner", "/avatars/default.png", passwordEncoder.encode("secret123")));
    userRepository.save(new UserEntity("username-member@example.com", "username-member", "Username Member", "/avatars/default.png", passwordEncoder.encode("secret123")));
    String token = jwtService.createToken(owner.getEmail());
    String teamId = createTeam(token);

    mockMvc.perform(post("/api/teams/" + teamId + "/members")
        .header("Authorization", "Bearer " + token)
        .contentType(MediaType.APPLICATION_JSON)
        .content("{\"lookup\":\"username-member\"}"))
      .andExpect(status().isOk())
      .andExpect(jsonPath("$.members[1].username").value("username-member"));
  }

  @Test
  void addMemberReturnsConflictWhenUserIsAlreadyInTeam() throws Exception {
    var owner = userRepository.save(new UserEntity("owner-duplicate@example.com", "owner-duplicate", "Owner", "/avatars/default.png", passwordEncoder.encode("secret123")));
    String token = jwtService.createToken(owner.getEmail());
    String teamId = createTeam(token);

    mockMvc.perform(post("/api/teams/" + teamId + "/members")
        .header("Authorization", "Bearer " + token)
        .contentType(MediaType.APPLICATION_JSON)
        .content("{\"lookup\":\"owner-duplicate\"}"))
      .andExpect(status().isConflict())
      .andExpect(jsonPath("$.code").value("TEAM_MEMBER_ALREADY_EXISTS"));
  }

  @Test
  void nonOwnersCannotManageMembershipAndNonMembersCannotOpenBoard() throws Exception {
    var owner = userRepository.save(new UserEntity("owner-auth@example.com", "owner-auth", "Owner", "/avatars/default.png", passwordEncoder.encode("secret123")));
    var member = userRepository.save(new UserEntity("member-auth@example.com", "member-auth", "Member", "/avatars/default.png", passwordEncoder.encode("secret123")));
    var outsider = userRepository.save(new UserEntity("outsider-auth@example.com", "outsider-auth", "Outsider", "/avatars/default.png", passwordEncoder.encode("secret123")));
    String ownerToken = jwtService.createToken(owner.getEmail());
    String memberToken = jwtService.createToken(member.getEmail());
    String outsiderToken = jwtService.createToken(outsider.getEmail());
    String teamId = createTeam(ownerToken);

    mockMvc.perform(post("/api/teams/" + teamId + "/members")
        .header("Authorization", "Bearer " + ownerToken)
        .contentType(MediaType.APPLICATION_JSON)
        .content("{\"lookup\":\"member-auth\"}"))
      .andExpect(status().isOk());

    mockMvc.perform(post("/api/teams/" + teamId + "/members")
        .header("Authorization", "Bearer " + memberToken)
        .contentType(MediaType.APPLICATION_JSON)
        .content("{\"lookup\":\"outsider-auth\"}"))
      .andExpect(status().isForbidden());

    mockMvc.perform(get("/api/teams/" + teamId).header("Authorization", "Bearer " + outsiderToken))
      .andExpect(status().isForbidden());
  }

  @Test
  void addMemberReturnsNotFoundWhenLookupDoesNotMatchAUser() throws Exception {
    var owner = userRepository.save(new UserEntity("owner-lookup@example.com", "owner-lookup", "Owner", "/avatars/default.png", passwordEncoder.encode("secret123")));
    String token = jwtService.createToken(owner.getEmail());
    String teamId = createTeam(token);

    mockMvc.perform(post("/api/teams/" + teamId + "/members")
        .header("Authorization", "Bearer " + token)
        .contentType(MediaType.APPLICATION_JSON)
        .content("{\"lookup\":\"missing\"}"))
      .andExpect(status().isNotFound());
  }

  private String createTeam(String token) throws Exception {
    String response = mockMvc.perform(post("/api/teams")
        .header("Authorization", "Bearer " + token)
        .contentType(MediaType.APPLICATION_JSON)
        .content("{\"name\":\"Platform\"}"))
      .andReturn()
      .getResponse()
      .getContentAsString();

    return response.replaceAll("^\\{\"id\":\"([^\"]+)\".*", "$1");
  }

  @Test
  void teamMemberCanListAccessibleTeams() throws Exception {
    var owner = userRepository.save(new UserEntity("owner-list@example.com", "owner-list", "Owner", "/avatars/default.png", passwordEncoder.encode("secret123")));
    var member = userRepository.save(new UserEntity("member-list@example.com", "member-list", "Member", "/avatars/default.png", passwordEncoder.encode("secret123")));
    var team = teamRepository.save(new TeamEntity("Platform", owner));
    teamMemberRepository.save(new TeamMemberEntity(team, member, "MEMBER"));
    String token = jwtService.createToken(member.getEmail());

    mockMvc.perform(get("/api/teams").header("Authorization", "Bearer " + token))
      .andExpect(status().isOk())
      .andExpect(jsonPath("$[0].name").value("Platform"));
  }
}
