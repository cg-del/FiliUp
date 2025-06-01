package edu.cit.filiup.repository;

import edu.cit.filiup.entity.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface UserRepository extends JpaRepository<UserEntity, UUID> {
    UserEntity findByUserEmail(String userEmail);
    List<UserEntity> findByUserRoleAndUserNameContainingIgnoreCase(String userRole, String userName);
}