package edu.cit.filiup.repository;

import edu.cit.filiup.entity.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface UserRepository extends JpaRepository<UserEntity, Integer> {
    UserEntity findByUserEmail(String userEmail);
    List<UserEntity> findByUserRoleAndUserNameContainingIgnoreCase(String userRole, String userName);
}