package com.diplomna.robota.auth;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class AuthExceptionHandler {
  @ExceptionHandler(MethodArgumentNotValidException.class)
  ResponseEntity<ErrorResponse> invalidRequest() {
    return ResponseEntity.badRequest().body(new ErrorResponse("AUTH_INVALID_REQUEST"));
  }

  @ExceptionHandler(DataIntegrityViolationException.class)
  ResponseEntity<ErrorResponse> duplicateUser() {
    return ResponseEntity.status(HttpStatus.CONFLICT).body(new ErrorResponse("AUTH_USER_ALREADY_EXISTS"));
  }

  @ExceptionHandler(InvalidCredentialsException.class)
  ResponseEntity<ErrorResponse> invalidCredentials() {
    return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new ErrorResponse("AUTH_INVALID_CREDENTIALS"));
  }

  private record ErrorResponse(String code) {}
}
