package com.diplomna.robota.tasks;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.diplomna.robota.auth.JwtService;
import com.diplomna.robota.teams.TeamEntity;
import com.diplomna.robota.teams.TeamMemberEntity;
import com.diplomna.robota.teams.TeamMemberRepository;
import com.diplomna.robota.teams.TeamRepository;
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
class TaskControllerTest {
  @Autowired MockMvc mockMvc;
  @Autowired UserRepository userRepository;
  @Autowired TeamRepository teamRepository;
  @Autowired TeamMemberRepository teamMemberRepository;
  @Autowired PasswordEncoder passwordEncoder;
  @Autowired JwtService jwtService;

  @Test
  void teamMemberCanCreateUnassignedTodoTask() throws Exception {
    var member = saveUser("task-member@example.com", "task-member", "Member");
    var team = saveTeam("Platform", member);
    String token = jwtService.createToken(member.getEmail());

    mockMvc.perform(post("/api/teams/" + team.getId() + "/tasks")
        .header("Authorization", "Bearer " + token)
        .contentType(MediaType.APPLICATION_JSON)
        .content("{\"title\":\"Create board cards\",\"description\":\"Keep them compact\"}"))
      .andExpect(status().isOk())
      .andExpect(jsonPath("$.title").value("Create board cards"))
      .andExpect(jsonPath("$.description").value("Keep them compact"))
      .andExpect(jsonPath("$.status").value("TODO"))
      .andExpect(jsonPath("$.assignee").doesNotExist());
  }

  @Test
  void createdTaskMayHaveOneAssigneeFromSameTeam() throws Exception {
    var creator = saveUser("creator@example.com", "creator", "Creator");
    var assignee = saveUser("assignee@example.com", "assignee", "Assignee");
    var team = saveTeam("Platform", creator);
    teamMemberRepository.save(new TeamMemberEntity(team, assignee, "MEMBER"));
    String token = jwtService.createToken(creator.getEmail());

    mockMvc.perform(post("/api/teams/" + team.getId() + "/tasks")
        .header("Authorization", "Bearer " + token)
        .contentType(MediaType.APPLICATION_JSON)
        .content("{\"title\":\"Wire API\",\"assigneeId\":\"" + assignee.getId() + "\"}"))
      .andExpect(status().isOk())
      .andExpect(jsonPath("$.assignee.id").value(assignee.getId().toString()))
      .andExpect(jsonPath("$.assignee.displayName").value("Assignee"));
  }

  @Test
  void taskAssigneeMustBelongToSameTeam() throws Exception {
    var creator = saveUser("task-owner@example.com", "task-owner", "Owner");
    var outsider = saveUser("task-outsider@example.com", "task-outsider", "Outsider");
    var team = saveTeam("Platform", creator);
    String token = jwtService.createToken(creator.getEmail());

    mockMvc.perform(post("/api/teams/" + team.getId() + "/tasks")
        .header("Authorization", "Bearer " + token)
        .contentType(MediaType.APPLICATION_JSON)
        .content("{\"title\":\"Reject outsider\",\"assigneeId\":\"" + outsider.getId() + "\"}"))
      .andExpect(status().isBadRequest());
  }

  @Test
  void teamMemberCanEditTaskDetailsAndStatus() throws Exception {
    var creator = saveUser("editor@example.com", "editor", "Editor");
    var assignee = saveUser("editor-assignee@example.com", "editor-assignee", "Editor Assignee");
    var team = saveTeam("Platform", creator);
    teamMemberRepository.save(new TeamMemberEntity(team, assignee, "MEMBER"));
    String token = jwtService.createToken(creator.getEmail());

    String taskJson = mockMvc.perform(post("/api/teams/" + team.getId() + "/tasks")
        .header("Authorization", "Bearer " + token)
        .contentType(MediaType.APPLICATION_JSON)
        .content("{\"title\":\"Draft details\"}"))
      .andReturn()
      .getResponse()
      .getContentAsString();
    String taskId = taskJson.replaceAll(".*\"id\":\"([^\"]+)\".*", "$1");

    mockMvc.perform(patch("/api/teams/" + team.getId() + "/tasks/" + taskId)
        .header("Authorization", "Bearer " + token)
        .contentType(MediaType.APPLICATION_JSON)
        .content("{\"title\":\"Ship details\",\"description\":\"Ready to review\",\"assigneeId\":\"" + assignee.getId() + "\",\"status\":\"IN_PROGRESS\"}"))
      .andExpect(status().isOk())
      .andExpect(jsonPath("$.title").value("Ship details"))
      .andExpect(jsonPath("$.description").value("Ready to review"))
      .andExpect(jsonPath("$.status").value("IN_PROGRESS"))
      .andExpect(jsonPath("$.assignee.id").value(assignee.getId().toString()));
  }

  @Test
  void editedTaskAssigneeMustBelongToSameTeam() throws Exception {
    var creator = saveUser("update-owner@example.com", "update-owner", "Update Owner");
    var outsider = saveUser("update-outsider@example.com", "update-outsider", "Update Outsider");
    var team = saveTeam("Platform", creator);
    String token = jwtService.createToken(creator.getEmail());

    String taskJson = mockMvc.perform(post("/api/teams/" + team.getId() + "/tasks")
        .header("Authorization", "Bearer " + token)
        .contentType(MediaType.APPLICATION_JSON)
        .content("{\"title\":\"Keep local\"}"))
      .andReturn()
      .getResponse()
      .getContentAsString();
    String taskId = taskJson.replaceAll(".*\"id\":\"([^\"]+)\".*", "$1");

    mockMvc.perform(patch("/api/teams/" + team.getId() + "/tasks/" + taskId)
        .header("Authorization", "Bearer " + token)
        .contentType(MediaType.APPLICATION_JSON)
        .content("{\"title\":\"Keep local\",\"assigneeId\":\"" + outsider.getId() + "\",\"status\":\"TODO\"}"))
      .andExpect(status().isBadRequest());
  }

  @Test
  void teamMemberCanDeleteTask() throws Exception {
    var member = saveUser("delete-member@example.com", "delete-member", "Delete Member");
    var team = saveTeam("Platform", member);
    String token = jwtService.createToken(member.getEmail());

    String taskJson = mockMvc.perform(post("/api/teams/" + team.getId() + "/tasks")
        .header("Authorization", "Bearer " + token)
        .contentType(MediaType.APPLICATION_JSON)
        .content("{\"title\":\"Obsolete task\"}"))
      .andReturn()
      .getResponse()
      .getContentAsString();
    String taskId = taskJson.replaceAll(".*\"id\":\"([^\"]+)\".*", "$1");

    mockMvc.perform(delete("/api/teams/" + team.getId() + "/tasks/" + taskId)
        .header("Authorization", "Bearer " + token))
      .andExpect(status().isNoContent());
  }

  private UserEntity saveUser(String email, String username, String displayName) {
    return userRepository.save(new UserEntity(email, username, displayName, "/avatars/default.png", passwordEncoder.encode("secret123")));
  }

  private TeamEntity saveTeam(String name, UserEntity owner) {
    var team = teamRepository.save(new TeamEntity(name, owner));
    teamMemberRepository.save(new TeamMemberEntity(team, owner, "OWNER"));
    return team;
  }
}
