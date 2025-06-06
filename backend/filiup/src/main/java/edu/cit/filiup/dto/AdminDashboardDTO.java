package edu.cit.filiup.dto;

import java.time.LocalDateTime;
import java.util.Map;

public class AdminDashboardDTO {
    private UserStatsDTO userStats;
    private ContentStatsDTO contentStats;
    private ActivityStatsDTO activityStats;
    private LocalDateTime lastUpdated;

    public AdminDashboardDTO() {
        this.lastUpdated = LocalDateTime.now();
    }

    // User statistics nested class
    public static class UserStatsDTO {
        private long totalUsers;
        private long activeUsers;
        private long students;
        private long teachers;
        private long admins;
        private long recentRegistrations;

        public UserStatsDTO() {}

        public UserStatsDTO(long totalUsers, long activeUsers, long students, long teachers, long admins, long recentRegistrations) {
            this.totalUsers = totalUsers;
            this.activeUsers = activeUsers;
            this.students = students;
            this.teachers = teachers;
            this.admins = admins;
            this.recentRegistrations = recentRegistrations;
        }

        // Getters and setters
        public long getTotalUsers() { return totalUsers; }
        public void setTotalUsers(long totalUsers) { this.totalUsers = totalUsers; }

        public long getActiveUsers() { return activeUsers; }
        public void setActiveUsers(long activeUsers) { this.activeUsers = activeUsers; }

        public long getStudents() { return students; }
        public void setStudents(long students) { this.students = students; }

        public long getTeachers() { return teachers; }
        public void setTeachers(long teachers) { this.teachers = teachers; }

        public long getAdmins() { return admins; }
        public void setAdmins(long admins) { this.admins = admins; }

        public long getRecentRegistrations() { return recentRegistrations; }
        public void setRecentRegistrations(long recentRegistrations) { this.recentRegistrations = recentRegistrations; }
    }

    // Content statistics nested class
    public static class ContentStatsDTO {
        private long totalStories;
        private long totalClasses;
        private long totalQuizzes;
        private long totalReports;

        public ContentStatsDTO() {}

        public ContentStatsDTO(long totalStories, long totalClasses, long totalQuizzes, long totalReports) {
            this.totalStories = totalStories;
            this.totalClasses = totalClasses;
            this.totalQuizzes = totalQuizzes;
            this.totalReports = totalReports;
        }

        // Getters and setters
        public long getTotalStories() { return totalStories; }
        public void setTotalStories(long totalStories) { this.totalStories = totalStories; }

        public long getTotalClasses() { return totalClasses; }
        public void setTotalClasses(long totalClasses) { this.totalClasses = totalClasses; }

        public long getTotalQuizzes() { return totalQuizzes; }
        public void setTotalQuizzes(long totalQuizzes) { this.totalQuizzes = totalQuizzes; }

        public long getTotalReports() { return totalReports; }
        public void setTotalReports(long totalReports) { this.totalReports = totalReports; }
    }

    // Activity statistics nested class
    public static class ActivityStatsDTO {
        private long activeUsersLast24h;
        private long activeUsersLastWeek;
        private Map<String, Long> dailyRegistrations;

        public ActivityStatsDTO() {}

        public ActivityStatsDTO(long activeUsersLast24h, long activeUsersLastWeek, Map<String, Long> dailyRegistrations) {
            this.activeUsersLast24h = activeUsersLast24h;
            this.activeUsersLastWeek = activeUsersLastWeek;
            this.dailyRegistrations = dailyRegistrations;
        }

        // Getters and setters
        public long getActiveUsersLast24h() { return activeUsersLast24h; }
        public void setActiveUsersLast24h(long activeUsersLast24h) { this.activeUsersLast24h = activeUsersLast24h; }

        public long getActiveUsersLastWeek() { return activeUsersLastWeek; }
        public void setActiveUsersLastWeek(long activeUsersLastWeek) { this.activeUsersLastWeek = activeUsersLastWeek; }

        public Map<String, Long> getDailyRegistrations() { return dailyRegistrations; }
        public void setDailyRegistrations(Map<String, Long> dailyRegistrations) { this.dailyRegistrations = dailyRegistrations; }
    }

    // Main class getters and setters
    public UserStatsDTO getUserStats() { return userStats; }
    public void setUserStats(UserStatsDTO userStats) { this.userStats = userStats; }

    public ContentStatsDTO getContentStats() { return contentStats; }
    public void setContentStats(ContentStatsDTO contentStats) { this.contentStats = contentStats; }

    public ActivityStatsDTO getActivityStats() { return activityStats; }
    public void setActivityStats(ActivityStatsDTO activityStats) { this.activityStats = activityStats; }

    public LocalDateTime getLastUpdated() { return lastUpdated; }
    public void setLastUpdated(LocalDateTime lastUpdated) { this.lastUpdated = lastUpdated; }
} 