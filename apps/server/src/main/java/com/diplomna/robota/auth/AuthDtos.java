package com.diplomna.robota.auth;

import com.diplomna.robota.users.UserResponseDto;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public final class AuthDtos {
  private AuthDtos() {}

  public record RegisterRequest(
    @Email @NotBlank String email,
    @NotBlank String username,
    @NotBlank String displayName,
    @NotBlank String password
  ) {}

  public record LoginRequest(@Email @NotBlank String email, @NotBlank String password) {}

  public record AuthResponse(String token, UserResponseDto user) {}
}
