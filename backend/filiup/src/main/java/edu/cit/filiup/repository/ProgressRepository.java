package edu.cit.filiup.repository;

import edu.cit.filiup.entity.ProgressEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ProgressRepository extends JpaRepository<ProgressEntity, Long> {
    List<ProgressEntity> findByStudentUserId(int studentId);
    List<ProgressEntity> findByStudentUserIdAndActivityType(int studentId, ProgressEntity.ActivityType activityType);
    List<ProgressEntity> findByStudentUserIdAndCompletionPercentageGreaterThanEqual(int studentId, Double completionPercentage);
    List<ProgressEntity> findByStudentUserIdAndCompletedAtIsNotNull(int studentId);
    List<ProgressEntity> findByStudentUserIdOrderByLastUpdatedDesc(int studentId);
}
