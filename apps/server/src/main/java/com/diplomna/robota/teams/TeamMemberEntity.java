package com.diplomna.robota.teams;

import com.diplomna.robota.shared.BaseEntity;
import com.diplomna.robota.users.UserEntity;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "team_members")
public class TeamMemberEntity extends BaseEntity {
  @ManyToOne
  @JoinColumn(name = "team_id")
  private TeamEntity team;

  @ManyToOne
  @JoinColumn(name = "user_id")
  private UserEntity user;

  private String role;

  protected TeamMemberEntity() {}

  public TeamMemberEntity(TeamEntity team, UserEntity user, String role) {
    this.team = team;
    this.user = user;
    this.role = role;
  }

  public UserEntity getUser() { return user; }
  public TeamEntity getTeam() {
    return team;
  }
}
