package edu.cit.filiup.repository;

import edu.cit.filiup.entity.ProgressEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface ProgressRepository extends JpaRepository<ProgressEntity, UUID> {
    List<ProgressEntity> findByStudentUserId(UUID studentId);
    List<ProgressEntity> findByStudentUserIdAndActivityType(UUID studentId, ProgressEntity.ActivityType activityType);
    List<ProgressEntity> findByStudentUserIdAndCompletionPercentageGreaterThanEqual(UUID studentId, Double completionPercentage);
    List<ProgressEntity> findByStudentUserIdAndCompletedAtIsNotNull(UUID studentId);
    List<ProgressEntity> findByStudentUserIdOrderByLastUpdatedDesc(UUID studentId);
}
