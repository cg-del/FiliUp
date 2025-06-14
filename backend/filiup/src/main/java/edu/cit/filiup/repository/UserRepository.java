package edu.cit.filiup.repository;

import edu.cit.filiup.entity.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public interface UserRepository extends JpaRepository<UserEntity, UUID> {
    UserEntity findByUserEmail(String userEmail);
    UserEntity findByUserName(String userName);
    UserEntity findByUserId(UUID userId);
    List<UserEntity> findByUserRoleAndUserNameContainingIgnoreCase(String userRole, String userName);
    
    // Admin-specific repository methods
    List<UserEntity> findByUserRole(String userRole);
    List<UserEntity> findByIsActive(Boolean isActive);
    List<UserEntity> findByUserRoleAndIsActive(String userRole, Boolean isActive);
    List<UserEntity> findByUserIdIn(List<UUID> userIds);
    
    // Count methods for analytics
    long countByUserRole(String userRole);
    long countByIsActive(Boolean isActive);
    long countByCreatedAtAfter(LocalDateTime dateTime);
    long countByLastLoginAfter(LocalDateTime dateTime);
    
    // Find methods for analytics
    List<UserEntity> findByCreatedAtAfter(LocalDateTime dateTime);
    List<UserEntity> findAllByOrderByLastLoginDesc();
}