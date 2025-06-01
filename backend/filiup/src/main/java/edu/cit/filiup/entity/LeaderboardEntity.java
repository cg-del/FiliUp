package edu.cit.filiup.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "leaderboard")
public class LeaderboardEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID entryId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private UserEntity student;

    @Column(name = "score", nullable = false)
    private Integer score;

    @Column(name = "ranking")
    private Integer rank;

    @Column(name = "category", nullable = false)
    @Enumerated(EnumType.STRING)
    private Category category;

    @Column(name = "time_frame", nullable = false)
    @Enumerated(EnumType.STRING)
    private TimeFrame timeFrame;

    @Column(name = "last_updated", nullable = false)
    private LocalDateTime lastUpdated;

    public enum Category {
        QUESTION_BANK,
        ASSIGNMENT,
        LESSON,
        PRACTICE,
        PROJECT,
        OVERALL
    }

    public enum TimeFrame {
        DAILY,
        WEEKLY,
        MONTHLY,
        ALL_TIME
    }

    // Constructors
    public LeaderboardEntity() {
        this.lastUpdated = LocalDateTime.now();
    }

    public LeaderboardEntity(UserEntity student, Integer score, Category category, TimeFrame timeFrame) {
        this();
        this.student = student;
        this.score = score;
        this.category = category;
        this.timeFrame = timeFrame;
    }

    // Getters and Setters
    public UUID getEntryId() {
        return entryId;
    }

    public void setEntryId(UUID entryId) {
        this.entryId = entryId;
    }

    public UserEntity getStudent() {
        return student;
    }

    public void setStudent(UserEntity student) {
        this.student = student;
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

    public Category getCategory() {
        return category;
    }

    public void setCategory(Category category) {
        this.category = category;
    }

    public TimeFrame getTimeFrame() {
        return timeFrame;
    }

    public void setTimeFrame(TimeFrame timeFrame) {
        this.timeFrame = timeFrame;
    }

    public LocalDateTime getLastUpdated() {
        return lastUpdated;
    }

    public void setLastUpdated(LocalDateTime lastUpdated) {
        this.lastUpdated = lastUpdated;
    }
}
