package edu.cit.filiup.service;

import edu.cit.filiup.dto.AdminDashboardDTO;
import edu.cit.filiup.entity.*;
import edu.cit.filiup.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AdminService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private StoryRepository storyRepository;

    @Autowired
    private ClassRepository classRepository;

    @Autowired
    private QuizRepository quizRepository;



    @Autowired
    private ProgressRepository progressRepository;

    public AdminDashboardDTO getDashboardData() {
        AdminDashboardDTO dashboard = new AdminDashboardDTO();

        // Get user statistics
        long totalUsers = userRepository.count();
        long activeUsers = userRepository.countByIsActive(true);
        long studentCount = userRepository.countByUserRole("STUDENT");
        long teacherCount = userRepository.countByUserRole("TEACHER");
        long adminCount = userRepository.countByUserRole("ADMIN");
        
        LocalDateTime thirtyDaysAgo = LocalDateTime.now().minusDays(30);
        long recentRegistrations = userRepository.countByCreatedAtAfter(thirtyDaysAgo);

        AdminDashboardDTO.UserStatsDTO userStats = new AdminDashboardDTO.UserStatsDTO(
            totalUsers, activeUsers, studentCount, teacherCount, adminCount, recentRegistrations
        );

        // Get content statistics
        long totalStories = storyRepository.count();
        long totalClasses = classRepository.count();
        long totalQuizzes = quizRepository.count();
        long totalReports = 0; // Reports functionality removed

        AdminDashboardDTO.ContentStatsDTO contentStats = new AdminDashboardDTO.ContentStatsDTO(
            totalStories, totalClasses, totalQuizzes, totalReports
        );

        // Get activity statistics
        LocalDateTime twentyFourHoursAgo = LocalDateTime.now().minusHours(24);
        LocalDateTime oneWeekAgo = LocalDateTime.now().minusWeeks(1);
        
        long activeUsersLast24h = userRepository.countByLastLoginAfter(twentyFourHoursAgo);
        long activeUsersLastWeek = userRepository.countByLastLoginAfter(oneWeekAgo);

        // Get daily registrations for the last 30 days
        List<UserEntity> recentUsers = userRepository.findByCreatedAtAfter(thirtyDaysAgo);
        Map<String, Long> dailyRegistrations = recentUsers.stream()
            .collect(Collectors.groupingBy(
                user -> user.getCreatedAt().toLocalDate().toString(),
                Collectors.counting()
            ));

        AdminDashboardDTO.ActivityStatsDTO activityStats = new AdminDashboardDTO.ActivityStatsDTO(
            activeUsersLast24h, activeUsersLastWeek, dailyRegistrations
        );

        dashboard.setUserStats(userStats);
        dashboard.setContentStats(contentStats);
        dashboard.setActivityStats(activityStats);

        return dashboard;
    }

    public Map<String, Object> getUserGrowthAnalytics(int days) {
        LocalDateTime startDate = LocalDateTime.now().minusDays(days);
        List<UserEntity> users = userRepository.findByCreatedAtAfter(startDate);

        Map<String, Long> dailyRegistrations = users.stream()
            .collect(Collectors.groupingBy(
                user -> user.getCreatedAt().toLocalDate().toString(),
                Collectors.counting()
            ));

        Map<String, Object> response = new HashMap<>();
        response.put("dailyRegistrations", dailyRegistrations);
        response.put("totalNewUsers", users.size());
        response.put("periodDays", days);
        response.put("averagePerDay", (double) users.size() / days);

        return response;
    }

    public Map<String, Object> getSystemMetrics() {
        Map<String, Object> metrics = new HashMap<>();
        
        // User metrics
        Map<String, Object> userMetrics = new HashMap<>();
        userMetrics.put("totalUsers", userRepository.count());
        userMetrics.put("activeUsers", userRepository.countByIsActive(true));
        userMetrics.put("inactiveUsers", userRepository.countByIsActive(false));
        
        // Role distribution
        Map<String, Long> roleDistribution = new HashMap<>();
        roleDistribution.put("students", userRepository.countByUserRole("STUDENT"));
        roleDistribution.put("teachers", userRepository.countByUserRole("TEACHER"));
        roleDistribution.put("admins", userRepository.countByUserRole("ADMIN"));
        userMetrics.put("roleDistribution", roleDistribution);

        // Content metrics
        Map<String, Object> contentMetrics = new HashMap<>();
        contentMetrics.put("stories", storyRepository.count());
        contentMetrics.put("classes", classRepository.count());
        contentMetrics.put("quizzes", quizRepository.count());
        contentMetrics.put("reports", 0); // Reports functionality removed

        // Activity metrics
        LocalDateTime today = LocalDateTime.now().withHour(0).withMinute(0).withSecond(0);
        LocalDateTime yesterday = today.minusDays(1);
        LocalDateTime lastWeek = today.minusWeeks(1);
        
        Map<String, Object> activityMetrics = new HashMap<>();
        activityMetrics.put("activeToday", userRepository.countByLastLoginAfter(today));
        activityMetrics.put("activeYesterday", userRepository.countByLastLoginAfter(yesterday));
        activityMetrics.put("activeThisWeek", userRepository.countByLastLoginAfter(lastWeek));

        metrics.put("users", userMetrics);
        metrics.put("content", contentMetrics);
        metrics.put("activity", activityMetrics);
        metrics.put("timestamp", LocalDateTime.now());

        return metrics;
    }

    public List<Map<String, Object>> getUserActivityLogs(UUID userId, int limit) {
        List<UserEntity> users;
        
        if (userId != null) {
            UserEntity user = userRepository.findByUserId(userId);
            users = user != null ? List.of(user) : List.of();
        } else {
            users = userRepository.findAllByOrderByLastLoginDesc();
        }

        return users.stream()
            .filter(user -> user.getLastLogin() != null)
            .limit(limit)
            .map(user -> {
                Map<String, Object> activity = new HashMap<>();
                activity.put("userId", user.getUserId());
                activity.put("userName", user.getUserName());
                activity.put("userRole", user.getUserRole());
                activity.put("lastLogin", user.getLastLogin());
                activity.put("isActive", user.getIsActive());
                activity.put("action", "LOGIN");
                return activity;
            })
            .collect(Collectors.toList());
    }

    public Map<String, Object> getContentStatistics() {
        Map<String, Object> stats = new HashMap<>();
        
        // Story statistics
        Map<String, Object> storyStats = new HashMap<>();
        storyStats.put("total", storyRepository.count());
        storyStats.put("active", storyRepository.findByIsActiveTrue().size());
        
        // Group stories by fiction type
        List<StoryEntity> allStories = storyRepository.findAll();
        Map<String, Long> fictionTypeDistribution = allStories.stream()
            .collect(Collectors.groupingBy(
                story -> story.getFictionType() != null ? story.getFictionType() : "Unknown",
                Collectors.counting()
            ));
        storyStats.put("fictionTypeDistribution", fictionTypeDistribution);

        // Class statistics
        Map<String, Object> classStats = new HashMap<>();
        classStats.put("total", classRepository.count());
        classStats.put("active", classRepository.findByIsActiveTrue().size());

        // Quiz statistics
        Map<String, Object> quizStats = new HashMap<>();
        quizStats.put("total", quizRepository.count());
        quizStats.put("active", quizRepository.findByIsActiveTrue().size());

        stats.put("stories", storyStats);
        stats.put("classes", classStats);
        stats.put("quizzes", quizStats);
        
        return stats;
    }



    public boolean bulkUpdateUsers(List<UUID> userIds, String action) {
        try {
            List<UserEntity> users = userRepository.findByUserIdIn(userIds);
            
            switch (action.toLowerCase()) {
                case "activate":
                    users.forEach(user -> user.setIsActive(true));
                    break;
                case "deactivate":
                    users.forEach(user -> user.setIsActive(false));
                    break;
                case "delete":
                    userRepository.deleteAll(users);
                    return true;
                default:
                    return false;
            }
            
            userRepository.saveAll(users);
            return true;
        } catch (Exception e) {
            return false;
        }
    }
} 