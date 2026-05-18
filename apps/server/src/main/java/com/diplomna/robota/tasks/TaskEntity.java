package com.diplomna.robota.tasks;

import com.diplomna.robota.shared.BaseEntity;
import com.diplomna.robota.teams.TeamEntity;
import com.diplomna.robota.users.UserEntity;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "tasks")
public class TaskEntity extends BaseEntity {
  private String title;
  private String description;

  @Enumerated(EnumType.STRING)
  private TaskStatus status;

  @ManyToOne
  @JoinColumn(name = "team_id")
  private TeamEntity team;

  @ManyToOne
  @JoinColumn(name = "assignee_id")
  private UserEntity assignee;

  protected TaskEntity() {}

  public TaskEntity(String title, String description, TeamEntity team, UserEntity assignee) {
    this.title = title;
    this.description = description;
    this.status = TaskStatus.TODO;
    this.team = team;
    this.assignee = assignee;
  }

  public String getTitle() { return title; }
  public String getDescription() { return description; }
  public TaskStatus getStatus() { return status; }
  public UserEntity getAssignee() { return assignee; }
}
