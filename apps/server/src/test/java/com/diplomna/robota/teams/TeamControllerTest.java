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

    String teamId = response.replaceAll(".*\"id\":\"([^\"]+)\".*", "$1");

    mockMvc.perform(get("/api/teams/" + teamId).header("Authorization", "Bearer " + token))
      .andExpect(status().isOk())
      .andExpect(jsonPath("$.name").value("Platform"));
  }
}
