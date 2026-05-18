package com.diplomna.robota.users;

import java.util.UUID;

public record UserResponseDto(UUID id, String email, String username, String displayName, String avatarUrl) {
  public static UserResponseDto from(UserEntity user) {
    return new UserResponseDto(user.getId(), user.getEmail(), user.getUsername(), user.getDisplayName(), user.getAvatarUrl());
  }
}
