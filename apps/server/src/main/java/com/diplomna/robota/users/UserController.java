package com.diplomna.robota.users;

import java.security.Principal;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestBody;

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

  @PutMapping("/me")
  public UserResponseDto updateMe(Principal principal, @Valid @RequestBody UpdateUserRequest request) {
    var user = userRepository.findByEmail(principal.getName()).orElseThrow();
    user.updateProfile(request.displayName(), request.avatarUrl());

    return UserResponseDto.from(userRepository.save(user));
  }

  public record UpdateUserRequest(
    @NotBlank @Size(min = 2, max = 80) String displayName,
    @NotBlank @Size(max = 2_000_000) String avatarUrl
  ) {}
}
