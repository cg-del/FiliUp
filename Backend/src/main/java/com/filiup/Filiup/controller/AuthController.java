package com.filiup.Filiup.controller;

import com.filiup.Filiup.dto.auth.AuthResponse;
import com.filiup.Filiup.dto.auth.LoginRequest;
import com.filiup.Filiup.dto.auth.PasswordResetRequest;
import com.filiup.Filiup.dto.auth.RegisterRequest;
import com.filiup.Filiup.dto.user.UserResponse;
import com.filiup.Filiup.service.AuthService;
import com.filiup.Filiup.repository.UserRepository;
import com.filiup.Filiup.entity.User;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final UserRepository userRepository;

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<UserResponse> resetPassword(
            @Valid @RequestBody PasswordResetRequest request,
            Authentication authentication) {
        // authentication.getName() is the username (email), not UUID
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        UUID userId = user.getId();
        return ResponseEntity.ok(authService.resetPassword(userId, request));
    }
}
