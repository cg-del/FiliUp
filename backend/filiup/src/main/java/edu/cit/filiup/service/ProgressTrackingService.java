package edu.cit.filiup.service;

import edu.cit.filiup.entity.ProgressEntity;
import edu.cit.filiup.entity.UserEntity;
import edu.cit.filiup.repository.ProgressRepository;
import edu.cit.filiup.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class ProgressTrackingService {
    private final ProgressRepository progressRepository;
    private final UserRepository userRepository;

    @Autowired
    public ProgressTrackingService(ProgressRepository progressRepository, UserRepository userRepository) {
        this.progressRepository = progressRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public ProgressEntity createProgress(ProgressEntity progressEntity, int studentId) {
        UserEntity student = userRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));
        
        if (!"STUDENT".equals(student.getUserRole())) {
            throw new RuntimeException("Only students can have progress records");
        }

        progressEntity.setStudent(student);
        progressEntity.setStartedAt(LocalDateTime.now());
        progressEntity.setLastUpdated(LocalDateTime.now());
        progressEntity.setCompletionPercentage(0.0);
        
        return progressRepository.save(progressEntity);
    }

    public List<ProgressEntity> getStudentProgress(int studentId) {
        return progressRepository.findByStudentUserIdOrderByLastUpdatedDesc(studentId);
    }

    public List<ProgressEntity> getStudentProgressByActivityType(int studentId, ProgressEntity.ActivityType activityType) {
        return progressRepository.findByStudentUserIdAndActivityType(studentId, activityType);
    }

    public List<ProgressEntity> getCompletedActivities(int studentId) {
        return progressRepository.findByStudentUserIdAndCompletedAtIsNotNull(studentId);
    }

    public List<ProgressEntity> getProgressByCompletionThreshold(int studentId, Double completionPercentage) {
        return progressRepository.findByStudentUserIdAndCompletionPercentageGreaterThanEqual(studentId, completionPercentage);
    }

    public Optional<ProgressEntity> getProgressById(Long progressId) {
        return progressRepository.findById(progressId);
    }

    @Transactional
    public ProgressEntity updateProgress(Long progressId, ProgressEntity updatedProgress) {
        return progressRepository.findById(progressId)
                .map(existingProgress -> {
                    existingProgress.setCompletionPercentage(updatedProgress.getCompletionPercentage());
                    existingProgress.setScore(updatedProgress.getScore());
                    existingProgress.setTimeSpentMinutes(updatedProgress.getTimeSpentMinutes());
                    existingProgress.setNotes(updatedProgress.getNotes());
                    existingProgress.setLastUpdated(LocalDateTime.now());

                    // If completion percentage is 100%, mark as completed
                    if (updatedProgress.getCompletionPercentage() >= 100.0 && existingProgress.getCompletedAt() == null) {
                        existingProgress.setCompletedAt(LocalDateTime.now());
                    }

                    return progressRepository.save(existingProgress);
                })
                .orElseThrow(() -> new RuntimeException("Progress record not found"));
    }

    @Transactional
    public ProgressEntity markActivityCompleted(Long progressId) {
        return progressRepository.findById(progressId)
                .map(progress -> {
                    progress.setCompletionPercentage(100.0);
                    progress.setCompletedAt(LocalDateTime.now());
                    progress.setLastUpdated(LocalDateTime.now());
                    return progressRepository.save(progress);
                })
                .orElseThrow(() -> new RuntimeException("Progress record not found"));
    }

    @Transactional
    public void deleteProgress(Long progressId) {
        progressRepository.deleteById(progressId);
    }

    public Double calculateAverageCompletion(int studentId) {
        List<ProgressEntity> progressList = progressRepository.findByStudentUserId(studentId);
        if (progressList.isEmpty()) {
            return 0.0;
        }
        
        return progressList.stream()
                .mapToDouble(ProgressEntity::getCompletionPercentage)
                .average()
                .orElse(0.0);
    }

    public Integer calculateTotalTimeSpent(int studentId) {
        List<ProgressEntity> progressList = progressRepository.findByStudentUserId(studentId);
        return progressList.stream()
                .mapToInt(progress -> progress.getTimeSpentMinutes() != null ? progress.getTimeSpentMinutes() : 0)
                .sum();
    }
}
