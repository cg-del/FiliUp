package edu.cit.filiup.service;

import edu.cit.filiup.dto.BadgeDTO;
import edu.cit.filiup.dto.StudentBadgeDTO;
import edu.cit.filiup.dto.StudentBadgeStatsDTO;
import edu.cit.filiup.entity.BadgeEntity;
import edu.cit.filiup.entity.QuizAttemptEntity;
import edu.cit.filiup.entity.StudentBadgeEntity;

import java.util.List;
import java.util.UUID;

public interface BadgeService {
    
    // Basic Badge Management
    BadgeEntity createBadge(BadgeEntity badge, UUID createdByUserId);
    List<BadgeEntity> getAllActiveBadges();
    BadgeEntity getBadgeById(UUID badgeId);
    BadgeEntity updateBadge(UUID badgeId, BadgeEntity updatedBadge);
    void deleteBadge(UUID badgeId);
    
    // Badge Award Management
    StudentBadgeEntity awardBadgeToStudent(UUID studentId, UUID badgeId, Double performanceScore, String notes);
    void revokeBadgeFromStudent(UUID studentId, UUID badgeId);
    boolean hasStudentEarnedBadge(UUID studentId, UUID badgeId);
    
    // Student Badge Information
    List<BadgeDTO> getStudentBadges(UUID studentId);
    List<StudentBadgeEntity> getEarnedBadges(UUID studentId);
    List<StudentBadgeDTO> getEarnedBadgesWithDetails(UUID studentId);
    StudentBadgeStatsDTO getStudentBadgeStats(UUID studentId);
    List<BadgeDTO> getRecentBadgesForStudent(UUID studentId, int limit);
    
    // Class/Teacher Badge Views
    List<BadgeDTO> getBadgesForClass(UUID classId);
    List<StudentBadgeStatsDTO> getClassBadgeLeaderboard(UUID classId);
    
    // Automatic Badge Awarding (Core Feature)
    void evaluateAndAwardBadgesForQuizAttempt(QuizAttemptEntity quizAttempt);
    void evaluateAndAwardPerformanceBadges(UUID studentId);
    void evaluateAndAwardStreakBadges(UUID studentId);
    void evaluateAndAwardImprovementBadges(UUID studentId);
    
    // Badge Types Creation (System Initialization)
    void initializeSystemBadges();
    
    // Analytics
    List<BadgeDTO> getMostEarnedBadges(int limit);
    List<BadgeDTO> getRarestBadges(int limit);
} 