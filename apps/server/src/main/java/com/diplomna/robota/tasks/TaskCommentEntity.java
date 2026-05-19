package com.diplomna.robota.tasks;

import com.diplomna.robota.shared.BaseEntity;
import com.diplomna.robota.users.UserEntity;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "task_comments")
public class TaskCommentEntity extends BaseEntity {
  private String body;

  @ManyToOne
  @JoinColumn(name = "task_id")
  private TaskEntity task;

  @ManyToOne
  @JoinColumn(name = "author_id")
  private UserEntity author;

  protected TaskCommentEntity() {}

  public TaskCommentEntity(String body, TaskEntity task, UserEntity author) {
    this.body = body;
    this.task = task;
    this.author = author;
  }

  public String getBody() { return body; }
  public UserEntity getAuthor() { return author; }
}
