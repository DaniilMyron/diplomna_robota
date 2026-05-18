package com.diplomna.robota.teams;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class TeamExceptionHandler {
  @ExceptionHandler(TeamAccessDeniedException.class)
  ResponseEntity<ErrorResponse> forbidden() {
    return ResponseEntity.status(HttpStatus.FORBIDDEN).body(new ErrorResponse("TEAM_FORBIDDEN"));
  }

  @ExceptionHandler(TeamMemberNotFoundException.class)
  ResponseEntity<ErrorResponse> memberNotFound() {
    return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new ErrorResponse("TEAM_MEMBER_NOT_FOUND"));
  }

  @ExceptionHandler(TeamMemberAlreadyExistsException.class)
  ResponseEntity<ErrorResponse> memberAlreadyExists() {
    return ResponseEntity.status(HttpStatus.CONFLICT).body(new ErrorResponse("TEAM_MEMBER_ALREADY_EXISTS"));
  }

  private record ErrorResponse(String code) {}
}
