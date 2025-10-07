package com.filiup.Filiup.service;

import com.filiup.Filiup.dto.auth.AuthResponse;
import com.filiup.Filiup.dto.auth.LoginRequest;
import com.filiup.Filiup.dto.auth.PasswordResetRequest;
import com.filiup.Filiup.dto.auth.RegisterRequest;
import com.filiup.Filiup.dto.user.UserResponse;
import com.filiup.Filiup.entity.User;
import com.filiup.Filiup.repository.UserRepository;
import com.filiup.Filiup.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists");
        }

        User user = User.builder()
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName())
                .role(request.getRole())
                .isActive(true)
                .build();

        user = userRepository.save(user);

        String token = jwtUtil.generateToken(user.getEmail(), user.getRole().name(), user.getId().toString());
        
        return AuthResponse.builder()
                .token(token)
                .refreshToken(token) // For simplicity, using same token
                .user(mapToUserResponse(user))
                .build();
    }

    public AuthResponse login(LoginRequest request) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
            );
        } catch (BadCredentialsException e) {
            throw new RuntimeException("Invalid credentials");
        }

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        String token = jwtUtil.generateToken(user.getEmail(), user.getRole().name(), user.getId().toString());

        return AuthResponse.builder()
                .token(token)
                .refreshToken(token)
                .user(mapToUserResponse(user))
                .build();
    }

    @Transactional
    public UserResponse resetPassword(UUID userId, PasswordResetRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Verify current password
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPasswordHash())) {
            throw new RuntimeException("Current password is incorrect");
        }

        // Verify password confirmation
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new RuntimeException("Password confirmation does not match");
        }

        // Update password and mark as no longer first login
        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        user.setFirstLogin(false);
        user = userRepository.save(user);

        return mapToUserResponse(user);
    }

    private UserResponse mapToUserResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole())
                .sectionId(user.getSection() != null ? user.getSection().getId() : null)
                .isActive(user.getIsActive())
                .firstLogin(user.getFirstLogin())
                .build();
    }
}
