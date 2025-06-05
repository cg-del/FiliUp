package edu.cit.filiup.dto;

import java.time.LocalDateTime;
import java.util.UUID;

public class LeaderboardDTO {
    private UUID entryId;
    private UUID studentId;
    private String studentName;
    private String studentEmail;
    private Integer score;
    private Integer rank;
    private String category;
    private String timeFrame;
    private Double accuracyPercentage;
    private Double averageTimeMinutes;
    private Integer totalQuizzesCompleted;
    private UUID classId;
    private String className;
    private UUID storyId;
    private String storyTitle;
    private LocalDateTime lastUpdated;

    // Constructors
    public LeaderboardDTO() {}

    public LeaderboardDTO(UUID entryId, UUID studentId, String studentName, String studentEmail,
                         Integer score, Integer rank, String category, String timeFrame,
                         Double accuracyPercentage, Double averageTimeMinutes, Integer totalQuizzesCompleted,
                         UUID classId, String className, UUID storyId, String storyTitle,
                         LocalDateTime lastUpdated) {
        this.entryId = entryId;
        this.studentId = studentId;
        this.studentName = studentName;
        this.studentEmail = studentEmail;
        this.score = score;
        this.rank = rank;
        this.category = category;
        this.timeFrame = timeFrame;
        this.accuracyPercentage = accuracyPercentage;
        this.averageTimeMinutes = averageTimeMinutes;
        this.totalQuizzesCompleted = totalQuizzesCompleted;
        this.classId = classId;
        this.className = className;
        this.storyId = storyId;
        this.storyTitle = storyTitle;
        this.lastUpdated = lastUpdated;
    }

    // Getters and Setters
    public UUID getEntryId() {
        return entryId;
    }

    public void setEntryId(UUID entryId) {
        this.entryId = entryId;
    }

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

    public String getStudentEmail() {
        return studentEmail;
    }

    public void setStudentEmail(String studentEmail) {
        this.studentEmail = studentEmail;
    }

    public Integer getScore() {
        return score;
    }

    public void setScore(Integer score) {
        this.score = score;
    }

    public Integer getRank() {
        return rank;
    }

    public void setRank(Integer rank) {
        this.rank = rank;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getTimeFrame() {
        return timeFrame;
    }

    public void setTimeFrame(String timeFrame) {
        this.timeFrame = timeFrame;
    }

    public Double getAccuracyPercentage() {
        return accuracyPercentage;
    }

    public void setAccuracyPercentage(Double accuracyPercentage) {
        this.accuracyPercentage = accuracyPercentage;
    }

    public Double getAverageTimeMinutes() {
        return averageTimeMinutes;
    }

    public void setAverageTimeMinutes(Double averageTimeMinutes) {
        this.averageTimeMinutes = averageTimeMinutes;
    }

    public Integer getTotalQuizzesCompleted() {
        return totalQuizzesCompleted;
    }

    public void setTotalQuizzesCompleted(Integer totalQuizzesCompleted) {
        this.totalQuizzesCompleted = totalQuizzesCompleted;
    }

    public UUID getClassId() {
        return classId;
    }

    public void setClassId(UUID classId) {
        this.classId = classId;
    }

    public String getClassName() {
        return className;
    }

    public void setClassName(String className) {
        this.className = className;
    }

    public UUID getStoryId() {
        return storyId;
    }

    public void setStoryId(UUID storyId) {
        this.storyId = storyId;
    }

    public String getStoryTitle() {
        return storyTitle;
    }

    public void setStoryTitle(String storyTitle) {
        this.storyTitle = storyTitle;
    }

    public LocalDateTime getLastUpdated() {
        return lastUpdated;
    }

    public void setLastUpdated(LocalDateTime lastUpdated) {
        this.lastUpdated = lastUpdated;
    }
} 