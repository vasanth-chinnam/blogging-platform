package com.blogplatform.service;

import com.blogplatform.dto.*;
import com.blogplatform.exception.*;
import com.blogplatform.model.User;
import com.blogplatform.repository.UserRepository;
import com.blogplatform.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;

@Service
@RequiredArgsConstructor
@SuppressWarnings("null")
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;

    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(request.usernameOrEmail, request.password)
        );

        String token = tokenProvider.generateToken(authentication);
        User user = userRepository.findByUsernameOrEmail(request.usernameOrEmail, request.usernameOrEmail)
            .orElseThrow(() -> new ResourceNotFoundException("User", "username", request.usernameOrEmail));

        return AuthResponse.builder()
            .accessToken(token)
            .tokenType("Bearer")
            .userId(user.getId())
            .username(user.getUsername())
            .email(user.getEmail())
            .roles(user.getRoles())
            .build();
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.username)) {
            throw new BadRequestException("Username is already taken!");
        }
        if (userRepository.existsByEmail(request.email)) {
            throw new BadRequestException("Email is already in use!");
        }

        User user = User.builder()
            .username(request.username)
            .email(request.email)
            .password(passwordEncoder.encode(request.password))
            .roles(Set.of("USER"))
            .enabled(true)
            .build();

        userRepository.save(user);

        String token = tokenProvider.generateToken(user.getUsername());
        return AuthResponse.builder()
            .accessToken(token)
            .tokenType("Bearer")
            .userId(user.getId())
            .username(user.getUsername())
            .email(user.getEmail())
            .roles(user.getRoles())
            .build();
    }
}
