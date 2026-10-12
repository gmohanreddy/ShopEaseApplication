package com.shopease.service;

import com.shopease.dto.AuthResponse;
import com.shopease.dto.LoginRequest;
import com.shopease.dto.RegisterRequest;
import com.shopease.entity.SecurityUser;
import com.shopease.entity.enums.Role;
import com.shopease.exception.DuplicateResourceException;
import com.shopease.repository.SecurityUserRepository;
import com.shopease.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final SecurityUserRepository securityUserRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        log.info("Registering new user: {}", request.getEmail());

        if (securityUserRepository.existsByEmail(request.getEmail())) {
            log.warn("Registration rejected - email already exists: {}",
                    request.getEmail());
            throw new DuplicateResourceException(
                    "Email already registered: " + request.getEmail());
        }

        SecurityUser user = SecurityUser.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.USER)
                .build();

        SecurityUser saved = securityUserRepository.save(user);
        log.info("User registered successfully: {}", saved.getEmail());

        String token = jwtUtil.generateToken(saved);

        return AuthResponse.builder()
                .token(token)
                .email(saved.getEmail())
                .role(saved.getRole().name())
                .message("Registration successful")
                .build();
    }

    @Transactional
    public AuthResponse registerAdmin(RegisterRequest request) {
        log.info("Registering ADMIN user: {}", request.getEmail());

        if (securityUserRepository.existsByEmail(request.getEmail())) {
            log.warn("Admin registration rejected - email already exists: {}",
                    request.getEmail());
            throw new DuplicateResourceException(
                    "Email already registered: " + request.getEmail());
        }

        // Role.ADMIN — this user gets full admin privileges
        SecurityUser user = SecurityUser.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.ADMIN)
                .build();

        SecurityUser saved = securityUserRepository.save(user);
        log.info("Admin registered successfully: {}", saved.getEmail());

        String token = jwtUtil.generateToken(saved);

        return AuthResponse.builder()
                .token(token)
                .email(saved.getEmail())
                .role(saved.getRole().name())
                .message("Admin registration successful")
                .build();
    }

    public AuthResponse login(LoginRequest request) {
        log.info("Login attempt for: {}", request.getEmail());

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        SecurityUser user = (SecurityUser) authentication.getPrincipal();
        String token = jwtUtil.generateToken(user);
        log.info("Login successful for: {}", user.getEmail());

        return AuthResponse.builder()
                .token(token)
                .email(user.getEmail())
                .role(user.getRole().name())
                .message("Login successful")
                .build();
    }
}