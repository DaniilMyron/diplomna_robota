package com.diplomna.robota.auth;

import com.diplomna.robota.auth.AuthDtos.AuthResponse;
import com.diplomna.robota.auth.AuthDtos.LoginRequest;
import com.diplomna.robota.auth.AuthDtos.RegisterRequest;
import com.diplomna.robota.users.UserEntity;
import com.diplomna.robota.users.UserRepository;
import com.diplomna.robota.users.UserResponseDto;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {
  private final UserRepository userRepository;
  private final PasswordEncoder passwordEncoder;
  private final JwtService jwtService;

  public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtService jwtService) {
    this.userRepository = userRepository;
    this.passwordEncoder = passwordEncoder;
    this.jwtService = jwtService;
  }

  @Transactional
  public AuthResponse register(RegisterRequest request) {
    UserEntity user = userRepository.save(new UserEntity(
      request.email(),
      request.username(),
      request.displayName(),
      "/avatars/default.png",
      passwordEncoder.encode(request.password())
    ));
    return new AuthResponse(jwtService.createToken(user.getEmail()), UserResponseDto.from(user));
  }

  public AuthResponse login(LoginRequest request) {
    UserEntity user = userRepository.findByEmail(request.email())
      .orElseThrow(InvalidCredentialsException::new);
    if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
      throw new InvalidCredentialsException();
    }
    return new AuthResponse(jwtService.createToken(user.getEmail()), UserResponseDto.from(user));
  }
}
