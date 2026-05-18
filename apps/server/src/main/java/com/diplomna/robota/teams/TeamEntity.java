package com.diplomna.robota.teams;

import com.diplomna.robota.shared.BaseEntity;
import com.diplomna.robota.users.UserEntity;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "teams")
public class TeamEntity extends BaseEntity {
  private String name;

  @ManyToOne
  @JoinColumn(name = "owner_id")
  private UserEntity owner;

  protected TeamEntity() {}

  public TeamEntity(String name, UserEntity owner) {
    this.name = name;
    this.owner = owner;
  }

  public String getName() { return name; }
  public UserEntity getOwner() { return owner; }
}
