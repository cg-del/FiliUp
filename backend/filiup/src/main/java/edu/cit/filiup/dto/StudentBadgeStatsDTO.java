package edu.cit.filiup.dto;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public class StudentBadgeStatsDTO {
    private UUID studentId;
    private String studentName;
    private Long totalBadgesEarned;
    private Long totalPossibleBadges;
    private Double badgeCompletionPercentage;
    private List<BadgeDTO> recentBadges;
    private List<BadgeDTO> allBadges;
    private LocalDateTime lastBadgeEarned;
    private Integer classRankByBadges;
    private Double averagePerformanceScore;

    // Badge category counts
    private Long performanceBadges;
    private Long streakBadges;
    private Long improvementBadges;
    private Long specialBadges;

    // Constructors
    public StudentBadgeStatsDTO() {}

    public StudentBadgeStatsDTO(UUID studentId, String studentName) {
        this.studentId = studentId;
        this.studentName = studentName;
    }

    // Getters and Setters
    public UUID getStudentId() {
        return studentId;
    }

    public void setStudentId(UUID studentId) {
        this.studentId = studentId;
    }

    public String getStudentName() {
        return studentName;
    }

    public void setStudentName(String studentName) {
        this.studentName = studentName;
    }

    public Long getTotalBadgesEarned() {
        return totalBadgesEarned;
    }

    public void setTotalBadgesEarned(Long totalBadgesEarned) {
        this.totalBadgesEarned = totalBadgesEarned;
    }

    public Long getTotalPossibleBadges() {
        return totalPossibleBadges;
    }

    public void setTotalPossibleBadges(Long totalPossibleBadges) {
        this.totalPossibleBadges = totalPossibleBadges;
    }

    public Double getBadgeCompletionPercentage() {
        return badgeCompletionPercentage;
    }

    public void setBadgeCompletionPercentage(Double badgeCompletionPercentage) {
        this.badgeCompletionPercentage = badgeCompletionPercentage;
    }

    public List<BadgeDTO> getRecentBadges() {
        return recentBadges;
    }

    public void setRecentBadges(List<BadgeDTO> recentBadges) {
        this.recentBadges = recentBadges;
    }

    public List<BadgeDTO> getAllBadges() {
        return allBadges;
    }

    public void setAllBadges(List<BadgeDTO> allBadges) {
        this.allBadges = allBadges;
    }

    public LocalDateTime getLastBadgeEarned() {
        return lastBadgeEarned;
    }

    public void setLastBadgeEarned(LocalDateTime lastBadgeEarned) {
        this.lastBadgeEarned = lastBadgeEarned;
    }

    public Integer getClassRankByBadges() {
        return classRankByBadges;
    }

    public void setClassRankByBadges(Integer classRankByBadges) {
        this.classRankByBadges = classRankByBadges;
    }

    public Double getAveragePerformanceScore() {
        return averagePerformanceScore;
    }

    public void setAveragePerformanceScore(Double averagePerformanceScore) {
        this.averagePerformanceScore = averagePerformanceScore;
    }

    public Long getPerformanceBadges() {
        return performanceBadges;
    }

    public void setPerformanceBadges(Long performanceBadges) {
        this.performanceBadges = performanceBadges;
    }

    public Long getStreakBadges() {
        return streakBadges;
    }

    public void setStreakBadges(Long streakBadges) {
        this.streakBadges = streakBadges;
    }

    public Long getImprovementBadges() {
        return improvementBadges;
    }

    public void setImprovementBadges(Long improvementBadges) {
        this.improvementBadges = improvementBadges;
    }

    public Long getSpecialBadges() {
        return specialBadges;
    }

    public void setSpecialBadges(Long specialBadges) {
        this.specialBadges = specialBadges;
    }
} 