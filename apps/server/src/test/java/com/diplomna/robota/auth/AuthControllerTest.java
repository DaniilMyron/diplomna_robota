package com.diplomna.robota.auth;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AuthControllerTest {
  @Autowired MockMvc mockMvc;

  @Test
  void visitorCanRegisterAndProtectedRequestsRequireBearerToken() throws Exception {
    String body = """
      {"email":"user@example.com","username":"dmyrosh","displayName":"Dmytro","password":"secret123"}
      """;

    mockMvc.perform(post("/api/auth/register").contentType(MediaType.APPLICATION_JSON).content(body))
      .andExpect(status().isOk())
      .andExpect(jsonPath("$.token").isString())
      .andExpect(jsonPath("$.user.email").value("user@example.com"));

    mockMvc.perform(get("/api/users/me"))
      .andExpect(status().isForbidden());
  }
}
