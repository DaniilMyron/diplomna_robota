package com.diplomna.robota.users;

import com.diplomna.robota.shared.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity
@Table(name = "users")
public class UserEntity extends BaseEntity {
  @Column(nullable = false, unique = true)
  private String email;

  @Column(nullable = false, unique = true)
  private String username;

  @Column(nullable = false)
  private String displayName;

  @Column(nullable = false)
  private String avatarUrl;

  @Column(nullable = false)
  private String passwordHash;

  protected UserEntity() {}

  public UserEntity(String email, String username, String displayName, String avatarUrl, String passwordHash) {
    this.email = email;
    this.username = username;
    this.displayName = displayName;
    this.avatarUrl = avatarUrl;
    this.passwordHash = passwordHash;
  }

  public String getEmail() { return email; }
  public String getUsername() { return username; }
  public String getDisplayName() { return displayName; }
  public String getAvatarUrl() { return avatarUrl; }
  public String getPasswordHash() { return passwordHash; }
}
