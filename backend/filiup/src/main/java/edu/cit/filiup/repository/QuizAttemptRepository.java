package edu.cit.filiup.repository;

import edu.cit.filiup.entity.QuizAttemptEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface QuizAttemptRepository extends JpaRepository<QuizAttemptEntity, UUID> {
    List<QuizAttemptEntity> findByStudentUserIdOrderByStartedAtDesc(UUID studentId);
    List<QuizAttemptEntity> findByQuizQuizIdOrderByStartedAtDesc(UUID quizId);
    List<QuizAttemptEntity> findByQuizStoryStoryIdAndStudentUserIdOrderByStartedAtDesc(UUID storyId, UUID studentId);
    Optional<QuizAttemptEntity> findTopByStudentUserIdAndQuizQuizIdOrderByStartedAtDesc(UUID studentId, UUID quizId);
    List<QuizAttemptEntity> findByQuizQuizIdAndIsCompletedTrueOrderByScoreDesc(UUID quizId);
} 