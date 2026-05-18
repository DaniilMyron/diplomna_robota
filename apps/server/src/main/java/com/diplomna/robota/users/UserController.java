package com.diplomna.robota.users;

import java.security.Principal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/users")
public class UserController {
  private final UserRepository userRepository;

  public UserController(UserRepository userRepository) {
    this.userRepository = userRepository;
  }

  @GetMapping("/me")
  public UserResponseDto me(Principal principal) {
    return userRepository.findByEmail(principal.getName())
      .map(UserResponseDto::from)
      .orElseThrow();
  }
}
