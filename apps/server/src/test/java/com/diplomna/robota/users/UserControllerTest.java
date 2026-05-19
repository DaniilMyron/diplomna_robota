package com.diplomna.robota.users;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.diplomna.robota.auth.JwtService;
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
class UserControllerTest {
  @Autowired MockMvc mockMvc;
  @Autowired UserRepository userRepository;
  @Autowired PasswordEncoder passwordEncoder;
  @Autowired JwtService jwtService;

  @Test
  void authenticatedUserCanUpdateProfileWithoutChangingUsername() throws Exception {
    var user = userRepository.save(new UserEntity("profile@example.com", "profile-user", "Profile", "/avatars/default.png", passwordEncoder.encode("secret123")));
    String token = jwtService.createToken(user.getEmail());

    mockMvc.perform(put("/api/users/me")
        .header("Authorization", "Bearer " + token)
        .contentType(MediaType.APPLICATION_JSON)
        .content("{\"displayName\":\"Updated Profile\",\"avatarUrl\":\"https://example.com/avatar.png\"}"))
      .andExpect(status().isOk())
      .andExpect(jsonPath("$.username").value("profile-user"))
      .andExpect(jsonPath("$.displayName").value("Updated Profile"))
      .andExpect(jsonPath("$.avatarUrl").value("https://example.com/avatar.png"));
  }
}
