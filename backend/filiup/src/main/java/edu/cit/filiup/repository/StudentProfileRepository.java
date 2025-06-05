package edu.cit.filiup.repository;

import edu.cit.filiup.entity.StudentProfileEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface StudentProfileRepository extends JpaRepository<StudentProfileEntity, UUID> {
    Optional<StudentProfileEntity> findByUserUserId(UUID userId);
    boolean existsByUserUserId(UUID userId);
} 