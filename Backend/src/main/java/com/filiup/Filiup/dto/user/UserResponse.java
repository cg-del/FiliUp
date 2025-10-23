package com.filiup.Filiup.dto.user;

import com.filiup.Filiup.entity.UserRole;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse {
    private UUID id;
    private String email;
    private String fullName;
    private UserRole role;
    private UUID sectionId;
    private Boolean isActive;
    private Boolean firstLogin;
    private LocalDateTime createdAt;
}
