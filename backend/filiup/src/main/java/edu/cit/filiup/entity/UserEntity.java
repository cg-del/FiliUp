package edu.cit.filiup.entity;

import jakarta.persistence.*;
import java.util.List;
import java.util.ArrayList;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "users")
public class UserEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID userId;

    @Column(name = "user_name", length = 255, nullable = false, unique = true)
    private String userName;

    @Column(name = "user_password", length = 255, nullable = false)
    private String userPassword;

    @Column(name = "user_email", length = 255, nullable = false, unique = true)
    private String userEmail;

    @Column(name = "user_role", length = 20, nullable = false)
    private String userRole; // "STUDENT", "TEACHER", or "ADMIN"

    @Column(name = "user_profile_picture_url")
    private String userProfilePictureUrl;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "last_login")
    private LocalDateTime lastLogin;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    // Student-specific relationships
    @OneToMany(mappedBy = "student", cascade = CascadeType.ALL)
    private List<ProgressEntity> progressRecords = new ArrayList<>();

    @OneToMany(mappedBy = "student", cascade = CascadeType.ALL)
    private List<LeaderboardEntity> leaderboardEntries = new ArrayList<>();

    // Teacher-specific relationships
    @OneToMany(mappedBy = "teacher", cascade = CascadeType.ALL)
    private List<ReportEntity> reports = new ArrayList<>();

    @OneToMany(mappedBy = "createdBy", cascade = CascadeType.ALL)
    private List<BadgeEntity> createdBadges = new ArrayList<>();

    @Column(name = "must_change_password", nullable = false)
    private Boolean mustChangePassword = false;

    // Constructors
    public UserEntity() {
        this.createdAt = LocalDateTime.now();
        this.mustChangePassword = false;
    }

    public UserEntity(UUID userId, String userName, String userPassword, String userEmail, String userRole) {
        this();
        this.userId = userId;
        this.userName = userName;
        this.userPassword = userPassword;
        this.userEmail = userEmail;
        this.userRole = userRole;
        this.mustChangePassword = false;
    }

    public Boolean getMustChangePassword() {
        return mustChangePassword;
    }

    public void setMustChangePassword(Boolean mustChangePassword) {
        this.mustChangePassword = mustChangePassword;
    }

    // Getters and Setters
    public UUID getUserId() {
        return userId;
    }

    public void setUserId(UUID userId) {
        this.userId = userId;
    }

    public String getUserName() {
        return userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }

    public String getUserPassword() {
        return userPassword;
    }

    public void setUserPassword(String userPassword) {
        this.userPassword = userPassword;
    }

    public String getUserEmail() {
        return userEmail;
    }

    public void setUserEmail(String userEmail) {
        this.userEmail = userEmail;
    }

    public String getUserRole() {
        return userRole;
    }

    public void setUserRole(String userRole) {
        this.userRole = userRole;
    }

    public String getUserProfilePictureUrl() {
        return userProfilePictureUrl;
    }

    public void setUserProfilePictureUrl(String userProfilePictureUrl) {
        this.userProfilePictureUrl = userProfilePictureUrl;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getLastLogin() {
        return lastLogin;
    }

    public void setLastLogin(LocalDateTime lastLogin) {
        this.lastLogin = lastLogin;
    }

    public Boolean getIsActive() {
        return isActive;
    }

    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }

    // Student-specific getters and setters
    public List<ProgressEntity> getProgressRecords() {
        return progressRecords;
    }

    public void setProgressRecords(List<ProgressEntity> progressRecords) {
        this.progressRecords = progressRecords;
    }

    public void addProgressRecord(ProgressEntity progress) {
        progressRecords.add(progress);
        progress.setStudent(this);
    }

    public List<LeaderboardEntity> getLeaderboardEntries() {
        return leaderboardEntries;
    }

    public void setLeaderboardEntries(List<LeaderboardEntity> leaderboardEntries) {
        this.leaderboardEntries = leaderboardEntries;
    }

    public void addLeaderboardEntry(LeaderboardEntity entry) {
        leaderboardEntries.add(entry);
        entry.setStudent(this);
    }

    // Teacher-specific getters and setters
    public List<ReportEntity> getReports() {
        return reports;
    }

    public void setReports(List<ReportEntity> reports) {
        this.reports = reports;
    }

    public void addReport(ReportEntity report) {
        reports.add(report);
        report.setTeacher(this);
    }

    public List<BadgeEntity> getCreatedBadges() {
        return createdBadges;
    }

    public void setCreatedBadges(List<BadgeEntity> createdBadges) {
        this.createdBadges = createdBadges;
    }

    public void addCreatedBadge(BadgeEntity badge) {
        createdBadges.add(badge);
        badge.setCreatedBy(this);
    }
}
