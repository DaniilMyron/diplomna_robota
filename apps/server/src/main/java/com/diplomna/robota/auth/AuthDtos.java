package com.diplomna.robota.auth;

import com.diplomna.robota.users.UserResponseDto;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public final class AuthDtos {
  private AuthDtos() {}

  public record RegisterRequest(
    @Email @NotBlank String email,
    @NotBlank @Size(min = 3, max = 64) @Pattern(regexp = "^[a-zA-Z0-9._-]+$") String username,
    @NotBlank @Size(min = 2, max = 80) String displayName,
    @NotBlank @Size(min = 8, max = 128) String password
  ) {}

  public record LoginRequest(@Email @NotBlank String email, @NotBlank String password) {}

  public record AuthResponse(String token, UserResponseDto user) {}
}
