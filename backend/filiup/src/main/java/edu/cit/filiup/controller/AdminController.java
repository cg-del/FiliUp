package edu.cit.filiup.controller;

import edu.cit.filiup.dto.AdminDashboardDTO;
import edu.cit.filiup.entity.*;
import edu.cit.filiup.service.*;
import edu.cit.filiup.util.RequireRole;
import edu.cit.filiup.util.ResponseUtil;
import edu.cit.filiup.repository.*;
import edu.cit.filiup.service.CommonStoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"}, allowCredentials = "true")
@RequireRole({"ADMIN"})
public class AdminController {

    @Autowired
    private AdminService adminService;

    @Autowired
    private UserService userService;

    @Autowired
    private StoryService storyService;

    @Autowired
    private ClassService classService;

    @Autowired
    private ProgressTrackingService progressTrackingService;

    @Autowired
    private RewardService rewardService;

    @Autowired
    private LeaderboardService leaderboardService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private StoryRepository storyRepository;

    @Autowired
    private ClassRepository classRepository;

    @Autowired
    private ProgressRepository progressRepository;

    @Autowired
    private QuizRepository quizRepository;



    @Autowired
    private CommonStoryService commonStoryService;

    @Autowired
    private CommonStoryRepository commonStoryRepository;

    // ================================
    // USER MANAGEMENT ENDPOINTS
    // ================================

    @GetMapping("/users")
    public ResponseEntity<?> getAllUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir,
            @RequestParam(required = false) String role,
            @RequestParam(required = false) Boolean isActive) {
        try {
            Sort sort = sortDir.equalsIgnoreCase("desc") ? 
                Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
            Pageable pageable = PageRequest.of(page, size, sort);

            List<UserEntity> users;
            if (role != null && isActive != null) {
                users = userRepository.findByUserRoleAndIsActive(role, isActive);
            } else if (role != null) {
                users = userRepository.findByUserRole(role);
            } else if (isActive != null) {
                users = userRepository.findByIsActive(isActive);
            } else {
                users = userService.getAllUser();
            }

            Map<String, Object> response = new HashMap<>();
            response.put("users", users);
            response.put("totalUsers", users.size());
            response.put("currentPage", page);
            response.put("totalPages", (users.size() + size - 1) / size);

            return ResponseUtil.success("Users retrieved successfully", response);
        } catch (Exception e) {
            return ResponseUtil.serverError("Failed to retrieve users: " + e.getMessage());
        }
    }

    @PostMapping("/users")
    public ResponseEntity<?> createUser(@RequestBody UserEntity user) {
        try {
            // Validate required fields
            if (user.getUserName() == null || user.getUserEmail() == null || 
                user.getUserPassword() == null || user.getUserRole() == null) {
                return ResponseUtil.badRequest("Username, email, password, and role are required");
            }

            // Check if user already exists
            if (userRepository.findByUserEmail(user.getUserEmail()) != null) {
                return ResponseUtil.badRequest("User with this email already exists");
            }

            if (userRepository.findByUserName(user.getUserName()) != null) {
                return ResponseUtil.badRequest("User with this username already exists");
            }

            user.setCreatedAt(LocalDateTime.now());
            user.setIsActive(true);
            UserEntity savedUser = userService.postUser(user);

            return ResponseUtil.success("User created successfully", savedUser);
        } catch (Exception e) {
            return ResponseUtil.badRequest("Failed to create user: " + e.getMessage());
        }
    }

    @PutMapping("/users/{userId}")
    public ResponseEntity<?> updateUser(@PathVariable UUID userId, @RequestBody UserEntity userUpdates) {
        try {
            UserEntity existingUser = userRepository.findByUserId(userId);
            if (existingUser == null) {
                return ResponseUtil.notFound("User not found");
            }

            // Update allowed fields
            if (userUpdates.getUserName() != null) {
                existingUser.setUserName(userUpdates.getUserName());
            }
            if (userUpdates.getUserEmail() != null) {
                existingUser.setUserEmail(userUpdates.getUserEmail());
            }
            if (userUpdates.getUserRole() != null) {
                existingUser.setUserRole(userUpdates.getUserRole());
            }
            if (userUpdates.getIsActive() != null) {
                existingUser.setIsActive(userUpdates.getIsActive());
            }
            if (userUpdates.getUserProfilePictureUrl() != null) {
                existingUser.setUserProfilePictureUrl(userUpdates.getUserProfilePictureUrl());
            }

            UserEntity updatedUser = userRepository.save(existingUser);
            return ResponseUtil.success("User updated successfully", updatedUser);
        } catch (Exception e) {
            return ResponseUtil.badRequest("Failed to update user: " + e.getMessage());
        }
    }

    @DeleteMapping("/users/{userId}")
    public ResponseEntity<?> deleteUser(@PathVariable UUID userId) {
        try {
            UserEntity user = userRepository.findByUserId(userId);
            if (user == null) {
                return ResponseUtil.notFound("User not found");
            }

            userRepository.delete(user);
            return ResponseUtil.success("User deleted successfully");
        } catch (Exception e) {
            return ResponseUtil.badRequest("Failed to delete user: " + e.getMessage());
        }
    }

    @PatchMapping("/users/{userId}/toggle-status")
    public ResponseEntity<?> toggleUserStatus(@PathVariable UUID userId) {
        try {
            UserEntity user = userRepository.findByUserId(userId);
            if (user == null) {
                return ResponseUtil.notFound("User not found");
            }

            user.setIsActive(!user.getIsActive());
            UserEntity updatedUser = userRepository.save(user);

            return ResponseUtil.success("User status updated successfully", updatedUser);
        } catch (Exception e) {
            return ResponseUtil.badRequest("Failed to update user status: " + e.getMessage());
        }
    }

    @PostMapping("/users/bulk-action")
    public ResponseEntity<?> bulkUserAction(@RequestBody Map<String, Object> request) {
        try {
            List<UUID> userIds = (List<UUID>) request.get("userIds");
            String action = (String) request.get("action");

            if (userIds == null || userIds.isEmpty()) {
                return ResponseUtil.badRequest("User IDs are required");
            }

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
                    return ResponseUtil.success("Users deleted successfully");
                default:
                    return ResponseUtil.badRequest("Invalid action: " + action);
            }

            userRepository.saveAll(users);
            return ResponseUtil.success("Bulk action completed successfully", users);
        } catch (Exception e) {
            return ResponseUtil.badRequest("Failed to perform bulk action: " + e.getMessage());
        }
    }

    // ================================
    // STORY MANAGEMENT ENDPOINTS
    // ================================

    @GetMapping("/stories")
    public ResponseEntity<?> getAllStories(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "storyId") String sortBy,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) UUID teacherId) {
        try {
            List<StoryEntity> stories;
            
            if (teacherId != null) {
                stories = storyRepository.findByCreatedBy_UserId(teacherId);
            } else {
                stories = storyService.getAllStories();
            }

            // Transform stories to include necessary user information
            List<Map<String, Object>> transformedStories = stories.stream()
                .map(story -> {
                    Map<String, Object> storyMap = new HashMap<>();
                    storyMap.put("storyId", story.getStoryId());
                    storyMap.put("title", story.getTitle());
                    storyMap.put("content", story.getContent());
                    storyMap.put("genre", story.getGenre());
                    storyMap.put("fictionType", story.getFictionType());
                    storyMap.put("createdAt", story.getCreatedAt());
                    storyMap.put("isActive", story.getIsActive());
                    
                    // Add user information
                    if (story.getCreatedBy() != null) {
                        Map<String, Object> createdBy = new HashMap<>();
                        createdBy.put("userId", story.getCreatedBy().getUserId());
                        // Display "FiliUp" for system user, otherwise show actual username
                        String displayName = "FiliUp".equals(story.getCreatedBy().getUserName()) ? 
                                           "FiliUp" : story.getCreatedBy().getUserName();
                        createdBy.put("userName", displayName);
                        storyMap.put("createdBy", createdBy);
                    } else {
                        Map<String, Object> createdBy = new HashMap<>();
                        createdBy.put("userId", null);
                        createdBy.put("userName", "FiliUp");
                        storyMap.put("createdBy", createdBy);
                    }
                    
                    return storyMap;
                })
                .collect(Collectors.toList());

            Map<String, Object> response = new HashMap<>();
            response.put("stories", transformedStories);
            response.put("totalStories", transformedStories.size());
            response.put("currentPage", page);

            return ResponseUtil.success("Stories retrieved successfully", response);
        } catch (Exception e) {
            return ResponseUtil.serverError("Failed to retrieve stories: " + e.getMessage());
        }
    }

    // Admin cannot update teacher-created stories
    // This endpoint has been removed to prevent admin from modifying teacher stories
    // Only common stories can be updated through /common-stories endpoints

    // Admin cannot delete teacher-created stories
    // This endpoint has been removed to prevent admin from deleting teacher stories
    // Only common stories can be deleted through /common-stories endpoints

    // ================================
    // COMMON STORY MANAGEMENT
    // ================================

    @GetMapping("/common-stories")
    public ResponseEntity<?> getAllCommonStories(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "storyId") String sortBy,
            @RequestParam(required = false) String status) {
        try {
            List<CommonStoryEntity> stories = commonStoryService.getAllCommonStories();

            // Transform stories to include necessary user information
            List<Map<String, Object>> transformedStories = stories.stream()
                .map(story -> {
                    Map<String, Object> storyMap = new HashMap<>();
                    storyMap.put("storyId", story.getStoryId());
                    storyMap.put("title", story.getTitle());
                    storyMap.put("content", story.getContent());
                    storyMap.put("genre", story.getGenre());
                    storyMap.put("fictionType", story.getFictionType());
                    storyMap.put("createdAt", story.getCreatedAt());
                    storyMap.put("isActive", story.getIsActive());
                    storyMap.put("coverPictureUrl", story.getCoverPictureUrl());
                    storyMap.put("coverPictureType", story.getCoverPictureType());
                    
                    // Add user information
                    if (story.getCreatedBy() != null) {
                        Map<String, Object> createdBy = new HashMap<>();
                        createdBy.put("userId", story.getCreatedBy().getUserId());
                        // Display "FiliUp" for system user, otherwise show actual username
                        String displayName = "FiliUp".equals(story.getCreatedBy().getUserName()) ? 
                                           "FiliUp" : story.getCreatedBy().getUserName();
                        createdBy.put("userName", displayName);
                        storyMap.put("createdBy", createdBy);
                    } else {
                        Map<String, Object> createdBy = new HashMap<>();
                        createdBy.put("userId", null);
                        createdBy.put("userName", "FiliUp");
                        storyMap.put("createdBy", createdBy);
                    }
                    
                    return storyMap;
                })
                .collect(Collectors.toList());

            Map<String, Object> response = new HashMap<>();
            response.put("stories", transformedStories);
            response.put("totalStories", transformedStories.size());
            response.put("currentPage", page);

            return ResponseUtil.success("Common stories retrieved successfully", response);
        } catch (Exception e) {
            return ResponseUtil.serverError("Failed to retrieve common stories: " + e.getMessage());
        }
    }

    @PostMapping("/common-stories")
    public ResponseEntity<?> createCommonStory(@RequestBody CommonStoryEntity story, JwtAuthenticationToken authentication) {
        try {
            // Extract user identifier from JWT token (could be username or email)
            String userIdentifier = authentication.getToken().getClaim("sub");
            String userRole = authentication.getToken().getClaim("role");
            
            // Fallback to other email claims if available
            if (userIdentifier == null) {
                String emailClaim = authentication.getToken().getClaim("email");
                if (emailClaim != null) {
                    userIdentifier = emailClaim;
                    System.out.println("Using 'email' claim instead of 'sub': " + userIdentifier);
                }
            }
            
            // Log the request for debugging
            System.out.println("Create common story request:");
            System.out.println("User Identifier: " + userIdentifier);
            System.out.println("User Role: " + userRole);
            
            if (userIdentifier == null) {
                return ResponseUtil.badRequest("User identifier not found in token");
            }
            
            // Try to find user by email first, then by username
            UserEntity user = userRepository.findByUserEmail(userIdentifier);
            if (user == null) {
                user = userRepository.findByUserName(userIdentifier);
                System.out.println("User not found by email, trying username: " + userIdentifier);
            }
            
            if (user == null) {
                return ResponseUtil.unauthorized("User not found with identifier: " + userIdentifier);
            }
            
            System.out.println("Found user: " + user.getUserName() + " (" + user.getUserEmail() + ") with role: " + user.getUserRole());

            // Validate required fields
            if (story.getTitle() == null || story.getContent() == null || story.getGenre() == null) {
                return ResponseUtil.badRequest("Title, content, and genre are required");
            }

            // For admin-created common stories, create or find the system "FiliUp" user
            UserEntity filiupUser = userRepository.findByUserName("FiliUp");
            if (filiupUser == null) {
                // Create the system FiliUp user if it doesn't exist
                filiupUser = new UserEntity();
                filiupUser.setUserName("FiliUp");
                filiupUser.setUserEmail("system@filiup.com");
                filiupUser.setUserRole("ADMIN");
                filiupUser.setUserPassword(""); // Empty password since it's a system user
                filiupUser.setIsActive(true);
                filiupUser.setCreatedAt(java.time.LocalDateTime.now());
                filiupUser = userRepository.save(filiupUser);
                System.out.println("Created system FiliUp user: " + filiupUser.getUserId());
            }

            CommonStoryEntity savedStory = commonStoryService.createCommonStory(story, filiupUser);
            return ResponseUtil.success("Common story created successfully", savedStory);
        } catch (Exception e) {
            return ResponseUtil.badRequest("Failed to create common story: " + e.getMessage());
        }
    }

    @PutMapping("/common-stories/{storyId}")
    public ResponseEntity<?> updateCommonStory(@PathVariable UUID storyId, @RequestBody CommonStoryEntity storyUpdates) {
        try {
            CommonStoryEntity updatedStory = commonStoryService.updateCommonStory(storyId, storyUpdates);
            if (updatedStory == null) {
                return ResponseUtil.notFound("Common story not found");
            }
            return ResponseUtil.success("Common story updated successfully", updatedStory);
        } catch (Exception e) {
            return ResponseUtil.badRequest("Failed to update common story: " + e.getMessage());
        }
    }

    @DeleteMapping("/common-stories/{storyId}")
    public ResponseEntity<?> deleteCommonStory(@PathVariable UUID storyId) {
        try {
            boolean deleted = commonStoryService.deleteCommonStory(storyId);
            if (!deleted) {
                return ResponseUtil.notFound("Common story not found");
            }
            return ResponseUtil.success("Common story deleted successfully");
        } catch (Exception e) {
            return ResponseUtil.badRequest("Failed to delete common story: " + e.getMessage());
        }
    }

    @PatchMapping("/common-stories/{storyId}/toggle-status")
    public ResponseEntity<?> toggleCommonStoryStatus(@PathVariable UUID storyId) {
        try {
            boolean toggled = commonStoryService.toggleCommonStoryStatus(storyId);
            if (!toggled) {
                return ResponseUtil.notFound("Common story not found");
            }
            return ResponseUtil.success("Common story status updated successfully");
        } catch (Exception e) {
            return ResponseUtil.badRequest("Failed to update common story status: " + e.getMessage());
        }
    }

    // ================================
    // ANALYTICS AND DASHBOARD
    // ================================

    @GetMapping("/dashboard")
    public ResponseEntity<?> getDashboardData() {
        try {
            AdminDashboardDTO dashboard = adminService.getDashboardData();
            return ResponseUtil.success("Dashboard data retrieved successfully", dashboard);
        } catch (Exception e) {
            return ResponseUtil.serverError("Failed to retrieve dashboard data: " + e.getMessage());
        }
    }

    @GetMapping("/analytics/user-growth")
    public ResponseEntity<?> getUserGrowthAnalytics(@RequestParam(defaultValue = "30") int days) {
        try {
            Map<String, Object> response = adminService.getUserGrowthAnalytics(days);
            return ResponseUtil.success("User growth analytics retrieved successfully", response);
        } catch (Exception e) {
            return ResponseUtil.serverError("Failed to retrieve user growth analytics: " + e.getMessage());
        }
    }

    @GetMapping("/analytics/activity-summary")
    public ResponseEntity<?> getActivitySummary() {
        try {
            LocalDateTime twentyFourHoursAgo = LocalDateTime.now().minusHours(24);
            LocalDateTime oneWeekAgo = LocalDateTime.now().minusWeeks(1);

            Map<String, Object> summary = new HashMap<>();

            // Recent user activity
            long activeUsersLast24h = userRepository.countByLastLoginAfter(twentyFourHoursAgo);
            long activeUsersLastWeek = userRepository.countByLastLoginAfter(oneWeekAgo);

            summary.put("activeUsersLast24h", activeUsersLast24h);
            summary.put("activeUsersLastWeek", activeUsersLastWeek);

            return ResponseUtil.success("Activity summary retrieved successfully", summary);
        } catch (Exception e) {
            return ResponseUtil.serverError("Failed to retrieve activity summary: " + e.getMessage());
        }
    }



    @GetMapping("/logs/user-activities")
    public ResponseEntity<?> getUserActivityLogs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size,
            @RequestParam(required = false) UUID userId) {
        try {
            // This would typically connect to a logging system
            // For now, we'll return recent user login activities
            List<UserEntity> users;
            if (userId != null) {
                UserEntity user = userRepository.findByUserId(userId);
                users = user != null ? List.of(user) : List.of();
            } else {
                users = userRepository.findAllByOrderByLastLoginDesc();
            }

            List<Map<String, Object>> activities = users.stream()
                .filter(user -> user.getLastLogin() != null)
                .map(user -> {
                    Map<String, Object> activity = new HashMap<>();
                    activity.put("userId", user.getUserId());
                    activity.put("userName", user.getUserName());
                    activity.put("userRole", user.getUserRole());
                    activity.put("lastLogin", user.getLastLogin());
                    activity.put("action", "LOGIN");
                    return activity;
                })
                .collect(Collectors.toList());

            Map<String, Object> response = new HashMap<>();
            response.put("activities", activities);
            response.put("totalActivities", activities.size());
            response.put("currentPage", page);

            return ResponseUtil.success("User activity logs retrieved successfully", response);
        } catch (Exception e) {
            return ResponseUtil.serverError("Failed to retrieve user activity logs: " + e.getMessage());
        }
    }

}