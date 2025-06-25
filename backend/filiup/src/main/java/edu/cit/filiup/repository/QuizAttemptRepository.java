package edu.cit.filiup.repository;

import edu.cit.filiup.entity.QuizAttemptEntity;
import edu.cit.filiup.entity.ClassCommonStoryEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
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
    
    // New method for resume functionality
    List<QuizAttemptEntity> findByQuizQuizIdAndStudentUserIdOrderByStartedAtDesc(UUID quizId, UUID studentId);
    
    // New methods for leaderboard calculations
    
    // Get completed quiz attempts by class
    @Query("SELECT qa FROM QuizAttemptEntity qa " +
           "JOIN qa.quiz q " +
           "LEFT JOIN q.story s " +
           "LEFT JOIN q.commonStory cs " +
           "LEFT JOIN ClassCommonStoryEntity ccs ON ccs.story.storyId = cs.storyId " +
           "WHERE ((s.classEntity.classId = :classId) OR (ccs.classEntity.classId = :classId)) " +
           "AND qa.isCompleted = true " +
           "AND (:startDate IS NULL OR qa.completedAt >= :startDate)")
    List<QuizAttemptEntity> findCompletedAttemptsByClass(
        @Param("classId") UUID classId, 
        @Param("startDate") LocalDateTime startDate);
    
    // Get completed quiz attempts by story
    @Query("SELECT qa FROM QuizAttemptEntity qa " +
           "JOIN qa.quiz q " +
           "WHERE q.story.storyId = :storyId AND qa.isCompleted = true " +
           "AND (:startDate IS NULL OR qa.completedAt >= :startDate)")
    List<QuizAttemptEntity> findCompletedAttemptsByStory(
        @Param("storyId") UUID storyId, 
        @Param("startDate") LocalDateTime startDate);
    
    // Get completed quiz attempts by student
    @Query("SELECT qa FROM QuizAttemptEntity qa " +
           "WHERE qa.student.userId = :studentId AND qa.isCompleted = true " +
           "AND (:startDate IS NULL OR qa.completedAt >= :startDate)")
    List<QuizAttemptEntity> findCompletedAttemptsByStudent(
        @Param("studentId") UUID studentId, 
        @Param("startDate") LocalDateTime startDate);
    
    // Get completed quiz attempts by student and class
    @Query("SELECT qa FROM QuizAttemptEntity qa " +
           "JOIN qa.quiz q " +
           "LEFT JOIN q.story s " +
           "LEFT JOIN q.commonStory cs " +
           "LEFT JOIN ClassCommonStoryEntity ccs ON ccs.story.storyId = cs.storyId " +
           "WHERE qa.student.userId = :studentId " +
           "AND ((s.classEntity.classId = :classId) OR (ccs.classEntity.classId = :classId)) " +
           "AND qa.isCompleted = true " +
           "AND (:startDate IS NULL OR qa.completedAt >= :startDate)")
    List<QuizAttemptEntity> findCompletedAttemptsByStudentAndClass(
        @Param("studentId") UUID studentId, 
        @Param("classId") UUID classId, 
        @Param("startDate") LocalDateTime startDate);
    
    // Get completed quiz attempts by student and story
    @Query("SELECT qa FROM QuizAttemptEntity qa " +
           "JOIN qa.quiz q " +
           "WHERE qa.student.userId = :studentId AND q.story.storyId = :storyId " +
           "AND qa.isCompleted = true " +
           "AND (:startDate IS NULL OR qa.completedAt >= :startDate)")
    List<QuizAttemptEntity> findCompletedAttemptsByStudentAndStory(
        @Param("studentId") UUID studentId, 
        @Param("storyId") UUID storyId, 
        @Param("startDate") LocalDateTime startDate);
    
    // Get quiz statistics for leaderboard calculations
    @Query("SELECT qa.student.userId, " +
           "SUM(qa.score), " +
           "AVG(CAST(qa.score AS DOUBLE) / CAST(qa.maxPossibleScore AS DOUBLE) * 100), " +
           "AVG(CAST(qa.timeTakenMinutes AS DOUBLE)), " +
           "COUNT(qa) " +
           "FROM QuizAttemptEntity qa " +
           "JOIN qa.quiz q " +
           "LEFT JOIN q.story s " +
           "LEFT JOIN q.commonStory cs " +
           "LEFT JOIN ClassCommonStoryEntity ccs ON ccs.story.storyId = cs.storyId " +
           "WHERE ((s.classEntity.classId = :classId) OR (ccs.classEntity.classId = :classId)) " +
           "AND qa.isCompleted = true " +
           "AND (:startDate IS NULL OR qa.completedAt >= :startDate) " +
           "GROUP BY qa.student.userId")
    List<Object[]> findQuizStatsByClass(
        @Param("classId") UUID classId, 
        @Param("startDate") LocalDateTime startDate);
    
    @Query("SELECT qa.student.userId, " +
           "SUM(qa.score), " +
           "AVG(CAST(qa.score AS DOUBLE) / CAST(qa.maxPossibleScore AS DOUBLE) * 100), " +
           "AVG(CAST(qa.timeTakenMinutes AS DOUBLE)), " +
           "COUNT(qa) " +
           "FROM QuizAttemptEntity qa " +
           "JOIN qa.quiz q " +
           "WHERE (q.story.storyId = :storyId OR q.commonStory.storyId = :storyId) " +
           "AND qa.isCompleted = true " +
           "AND (:startDate IS NULL OR qa.completedAt >= :startDate) " +
           "GROUP BY qa.student.userId")
    List<Object[]> findQuizStatsByStory(
        @Param("storyId") UUID storyId, 
        @Param("startDate") LocalDateTime startDate);
    
    // Get overall quiz statistics (all completed attempts)
    @Query("SELECT qa.student.userId, " +
           "SUM(qa.score), " +
           "AVG(CAST(qa.score AS DOUBLE) / CAST(qa.maxPossibleScore AS DOUBLE) * 100), " +
           "AVG(CAST(qa.timeTakenMinutes AS DOUBLE)), " +
           "COUNT(qa) " +
           "FROM QuizAttemptEntity qa " +
           "WHERE qa.isCompleted = true " +
           "AND (:startDate IS NULL OR qa.completedAt >= :startDate) " +
           "GROUP BY qa.student.userId")
    List<Object[]> findOverallQuizStats(@Param("startDate") LocalDateTime startDate);
    
    // New methods for teacher endpoints
    
    // Get all quiz attempts for classes taught by a teacher
    @Query("SELECT qa FROM QuizAttemptEntity qa " +
           "JOIN qa.quiz q " +
           "LEFT JOIN q.story s " +
           "LEFT JOIN q.commonStory cs " +
           "LEFT JOIN ClassCommonStoryEntity ccs ON ccs.story.storyId = cs.storyId " +
           "WHERE (q.createdBy.userId = :teacherId OR ccs.addedBy.userId = :teacherId) " +
           "ORDER BY qa.startedAt DESC")
    List<QuizAttemptEntity> findQuizAttemptsByTeacher(@Param("teacherId") UUID teacherId);
    
    // Get quiz attempts for a specific class
    @Query("SELECT qa FROM QuizAttemptEntity qa " +
           "JOIN qa.quiz q " +
           "LEFT JOIN q.story s " +
           "LEFT JOIN q.commonStory cs " +
           "LEFT JOIN ClassCommonStoryEntity ccs ON ccs.story.storyId = cs.storyId " +
           "WHERE ((s.classEntity.classId = :classId) OR (ccs.classEntity.classId = :classId)) " +
           "ORDER BY qa.startedAt DESC")
    List<QuizAttemptEntity> findQuizAttemptsByClass(@Param("classId") UUID classId);
    
    // Get quiz attempts for students enrolled in classes taught by a teacher
    @Query("SELECT qa FROM QuizAttemptEntity qa " +
           "JOIN qa.quiz q " +
           "LEFT JOIN q.story s " +
           "LEFT JOIN q.commonStory cs " +
           "LEFT JOIN ClassCommonStoryEntity ccs ON ccs.story.storyId = cs.storyId " +
           "WHERE (q.createdBy.userId = :teacherId OR ccs.addedBy.userId = :teacherId) " +
           "AND qa.isCompleted = true " +
           "ORDER BY qa.student.userName, q.title")
    List<QuizAttemptEntity> findCompletedQuizAttemptsByTeacherClasses(@Param("teacherId") UUID teacherId);
    
    // Add new method to get quiz attempts for common stories by class
    @Query("SELECT qa FROM QuizAttemptEntity qa " +
           "JOIN qa.quiz q " +
           "JOIN q.commonStory cs " +
           "JOIN ClassCommonStoryEntity ccs ON ccs.story.storyId = cs.storyId " +
           "WHERE ccs.classEntity.classId = :classId " +
           "AND qa.isCompleted = true " +
           "AND (:startDate IS NULL OR qa.completedAt >= :startDate)")
    List<QuizAttemptEntity> findCompletedCommonStoryAttemptsByClass(
        @Param("classId") UUID classId, 
        @Param("startDate") LocalDateTime startDate);
    
    // Add method to get common story quiz statistics by class
    @Query("SELECT qa.student.userId, " +
           "SUM(qa.score), " +
           "AVG(CAST(qa.score AS DOUBLE) / CAST(qa.maxPossibleScore AS DOUBLE) * 100), " +
           "AVG(CAST(qa.timeTakenMinutes AS DOUBLE)), " +
           "COUNT(qa) " +
           "FROM QuizAttemptEntity qa " +
           "JOIN qa.quiz q " +
           "JOIN q.commonStory cs " +
           "JOIN ClassCommonStoryEntity ccs ON ccs.story.storyId = cs.storyId " +
           "WHERE ccs.classEntity.classId = :classId AND qa.isCompleted = true " +
           "AND (:startDate IS NULL OR qa.completedAt >= :startDate) " +
           "GROUP BY qa.student.userId")
    List<Object[]> findCommonStoryQuizStatsByClass(
        @Param("classId") UUID classId, 
        @Param("startDate") LocalDateTime startDate);
} 