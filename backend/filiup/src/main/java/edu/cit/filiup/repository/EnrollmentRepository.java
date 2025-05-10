package edu.cit.filiup.repository;

import edu.cit.filiup.entity.EnrollmentEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface EnrollmentRepository extends JpaRepository<EnrollmentEntity, Long> {
    boolean existsByUserIdAndClassCode(Integer userId, String classCode);
    List<EnrollmentEntity> findByUserId(Integer userId);
    List<EnrollmentEntity> findByClassCode(String classCode);
    Optional<EnrollmentEntity> findByUserIdAndClassCode(Integer userId, String classCode);
}