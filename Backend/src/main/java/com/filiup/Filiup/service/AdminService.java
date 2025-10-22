package com.filiup.Filiup.service;

import com.filiup.Filiup.dto.user.CreateUserRequest;
import com.filiup.Filiup.dto.user.UserResponse;
import com.filiup.Filiup.entity.Section;
import com.filiup.Filiup.entity.User;
import com.filiup.Filiup.entity.UserRole;
import com.filiup.Filiup.repository.ActivityLogRepository;
import com.filiup.Filiup.repository.SectionRepository;
import com.filiup.Filiup.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final SectionRepository sectionRepository;
    private final ActivityLogRepository activityLogRepository;
    private final PasswordEncoder passwordEncoder;

    public Map<String, Object> getSystemStats() {
        long totalUsers = userRepository.count();
        long activeStudents = userRepository.findByRole(UserRole.STUDENT, Pageable.unpaged())
                .stream()
                .filter(User::getIsActive)
                .count();
        long totalSections = sectionRepository.count();

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalUsers", totalUsers);
        stats.put("activeStudents", activeStudents);
        stats.put("totalSections", totalSections);
        stats.put("systemHealth", 99.2);

        return stats;
    }

    public Page<UserResponse> searchUsers(String searchTerm, Pageable pageable, UserRole role) {
        String searchPattern = "%" + searchTerm.toLowerCase() + "%";
        Page<User> users;
        
        if (role != null) {
            users = userRepository.findByRoleAndSearch(role, searchPattern, pageable);
        } else {
            users = userRepository.searchAllUsers(searchPattern, pageable);
        }
        
        return users.map(this::mapToUserResponse);
    }
    
    public Page<UserResponse> getAllUsers(Pageable pageable, UserRole role) {
        Page<User> users;
        
        if (role != null) {
            users = userRepository.findByRole(role, pageable);
        } else {
            users = userRepository.findAll(pageable);
        }

        return users.map(this::mapToUserResponse);
    }

    @Transactional
    public UserResponse createUser(CreateUserRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists");
        }

        // Use default password "teacher123" for teachers
        String password = request.getPassword();
        if (request.getRole() == UserRole.TEACHER) {
            password = "teacher123";
        }

        User user = User.builder()
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(password))
                .fullName(request.getFullName())
                .role(request.getRole())
                .isActive(true)
                .firstLogin(request.getRole() == UserRole.TEACHER) // Only teachers need to reset password on first login
                .build();

        if (request.getSection() != null) {
            Section section = sectionRepository.findById(request.getSection())
                    .orElseThrow(() -> new RuntimeException("Section not found"));
            user.setSection(section);
        }

        user = userRepository.save(user);
        return mapToUserResponse(user);
    }

    @Transactional
    public UserResponse updateUser(UUID userId, CreateUserRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setFullName(request.getFullName());
        
        // Update role if provided and different from current role
        if (request.getRole() != null && !request.getRole().equals(user.getRole())) {
            user.setRole(request.getRole());
        }
        
        if (request.getPassword() != null && !request.getPassword().isEmpty()) {
            user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        }

        if (request.getSection() != null) {
            Section section = sectionRepository.findById(request.getSection())
                    .orElseThrow(() -> new RuntimeException("Section not found"));
            user.setSection(section);
        }

        user = userRepository.save(user);
        return mapToUserResponse(user);
    }

    @Transactional
    public void deleteUser(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        user.setIsActive(false);
        userRepository.save(user);
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
