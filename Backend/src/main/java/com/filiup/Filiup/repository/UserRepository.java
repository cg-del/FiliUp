package com.filiup.Filiup.repository;

import com.filiup.Filiup.entity.Section;
import com.filiup.Filiup.entity.User;
import com.filiup.Filiup.entity.UserRole;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    Page<User> findByRole(UserRole role, Pageable pageable);
    List<User> findBySection(Section section);
    
    @Query("SELECT u FROM User u WHERE u.role = :role AND (LOWER(u.fullName) LIKE LOWER(:search) OR LOWER(u.email) LIKE LOWER(:search))")
    Page<User> findByRoleAndSearch(
        @Param("role") UserRole role,
        @Param("search") String search,
        Pageable pageable
    );
    
    @Query("SELECT u FROM User u WHERE LOWER(u.fullName) LIKE LOWER(:search) OR LOWER(u.email) LIKE LOWER(:search)")
    Page<User> searchAllUsers(
        @Param("search") String search,
        Pageable pageable
    );
}
