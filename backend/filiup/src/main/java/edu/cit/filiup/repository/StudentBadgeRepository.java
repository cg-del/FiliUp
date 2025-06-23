package edu.cit.filiup.repository;

import edu.cit.filiup.entity.StudentBadgeEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface StudentBadgeRepository extends JpaRepository<StudentBadgeEntity, UUID> {
    
    // Find all badges earned by a specific student
    List<StudentBadgeEntity> findByStudentUserIdAndIsActiveTrue(UUID studentId);
    
    // Check if student already has a specific badge
    boolean existsByStudentUserIdAndBadgeBadgeIdAndIsActiveTrue(UUID studentId, UUID badgeId);
    
    // Find specific badge for a student
    Optional<StudentBadgeEntity> findByStudentUserIdAndBadgeBadgeIdAndIsActiveTrue(UUID studentId, UUID badgeId);
    
    // Find badges earned from a specific quiz
    List<StudentBadgeEntity> findByEarnedFromQuizIdAndIsActiveTrue(UUID quizId);
    
    // Find badges earned from a specific story
    List<StudentBadgeEntity> findByEarnedFromStoryIdAndIsActiveTrue(UUID storyId);
    
    // Find badges earned from a specific class
    List<StudentBadgeEntity> findByEarnedFromClassIdAndIsActiveTrue(UUID classId);
    
    // Get recent badges earned by a student
    @Query("SELECT sb FROM StudentBadgeEntity sb WHERE sb.student.userId = :studentId " +
           "AND sb.isActive = true ORDER BY sb.earnedAt DESC")
    List<StudentBadgeEntity> findRecentBadgesByStudent(@Param("studentId") UUID studentId);
    
    // Get badges earned within a specific time period
    @Query("SELECT sb FROM StudentBadgeEntity sb WHERE sb.student.userId = :studentId " +
           "AND sb.earnedAt >= :startDate AND sb.isActive = true ORDER BY sb.earnedAt DESC")
    List<StudentBadgeEntity> findBadgesEarnedSince(@Param("studentId") UUID studentId, 
                                                    @Param("startDate") LocalDateTime startDate);
    
    // Count total badges earned by student
    long countByStudentUserIdAndIsActiveTrue(UUID studentId);
    
    // Find all students who have earned a specific badge
    @Query("SELECT sb FROM StudentBadgeEntity sb WHERE sb.badge.badgeId = :badgeId " +
           "AND sb.isActive = true ORDER BY sb.earnedAt ASC")
    List<StudentBadgeEntity> findStudentsWithBadge(@Param("badgeId") UUID badgeId);
    
    // Get leaderboard of students by badge count in a class
    @Query("SELECT sb.student.userId, COUNT(sb) as badgeCount FROM StudentBadgeEntity sb " +
           "WHERE sb.earnedFromClassId = :classId AND sb.isActive = true " +
           "GROUP BY sb.student.userId ORDER BY badgeCount DESC")
    List<Object[]> findBadgeLeaderboardForClass(@Param("classId") UUID classId);
} 