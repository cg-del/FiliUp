package edu.cit.filiup.repository;

import edu.cit.filiup.entity.TeacherProfileEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface TeacherProfileRepository extends JpaRepository<TeacherProfileEntity, UUID> {
    Optional<TeacherProfileEntity> findByUserUserId(UUID userId);
    boolean existsByUserUserId(UUID userId);
} 