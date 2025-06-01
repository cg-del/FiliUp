package edu.cit.filiup.repository;

import edu.cit.filiup.entity.EnrollmentEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface EnrollmentRepository extends JpaRepository<EnrollmentEntity, UUID> {
    boolean existsByUserIdAndClassCode(UUID userId, String classCode);
    List<EnrollmentEntity> findByUserId(UUID userId);
    List<EnrollmentEntity> findByClassCode(String classCode);
    Optional<EnrollmentEntity> findByUserIdAndClassCode(UUID userId, String classCode);
    List<EnrollmentEntity> findByUserIdAndIsAcceptedTrue(UUID userId);
    Optional<EnrollmentEntity> findByClassCodeAndUserId(String classCode, UUID userId);
    List<EnrollmentEntity> findByUserIdAndIsAccepted(UUID userId, Boolean isAccepted);
}