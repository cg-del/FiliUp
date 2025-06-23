package edu.cit.filiup.controller;

import edu.cit.filiup.dto.BadgeDTO;
import edu.cit.filiup.dto.StudentBadgeDTO;
import edu.cit.filiup.dto.StudentBadgeStatsDTO;
import edu.cit.filiup.entity.BadgeEntity;
import edu.cit.filiup.entity.UserEntity;
import edu.cit.filiup.repository.UserRepository;
import edu.cit.filiup.service.BadgeService;
import edu.cit.filiup.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/badges")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173", "http://127.0.0.1:3000"}, allowCredentials = "true")
public class BadgeController {
    
    private final BadgeService badgeService;
    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;

    @Autowired
    public BadgeController(BadgeService badgeService, JwtUtil jwtUtil, UserRepository userRepository) {
        this.badgeService = badgeService;
        this.jwtUtil = jwtUtil;
        this.userRepository = userRepository;
    }

    // Get all available badges
    @GetMapping
    public ResponseEntity<?> getAllBadges() {
        try {
            List<BadgeEntity> badges = badgeService.getAllActiveBadges();
            if (badges == null || badges.isEmpty()) {
                return ResponseEntity.ok(new ArrayList<>());
            }
            return ResponseEntity.ok(badges);
        } catch (Exception e) {
            e.printStackTrace(); // Add logging to see the actual error
            System.err.println("Error in getAllBadges: " + e.getMessage());
            return ResponseEntity.status(500).body("Error fetching badges: " + e.getMessage());
        }
    }

    // Get badges for a specific student (with earned status)
    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<BadgeDTO>> getStudentBadges(@PathVariable UUID studentId) {
        try {
            List<BadgeDTO> badges = badgeService.getStudentBadges(studentId);
            return ResponseEntity.ok(badges);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // Get current user's badges (requires authentication)
    @GetMapping("/my-badges")
    public ResponseEntity<?> getMyBadges(@RequestHeader("Authorization") String token) {
        try {
            String jwt = token.substring(7); // Remove "Bearer " prefix
            String username = jwtUtil.extractUsername(jwt);
            
            // Find user by username instead of parsing as UUID
            UserEntity user = userRepository.findByUserName(username);
            if (user == null) {
                return ResponseEntity.status(404).body("User not found: " + username);
            }
            
            List<StudentBadgeDTO> badges = badgeService.getEarnedBadgesWithDetails(user.getUserId());
            if (badges == null || badges.isEmpty()) {
                return ResponseEntity.ok(new ArrayList<>());
            }
            return ResponseEntity.ok(badges);
        } catch (Exception e) {
            e.printStackTrace();
            System.err.println("Error in getMyBadges: " + e.getMessage());
            return ResponseEntity.status(500).body("Error fetching student badges: " + e.getMessage());
        }
    }

    // Get student badge statistics
    @GetMapping("/student/{studentId}/stats")
    public ResponseEntity<StudentBadgeStatsDTO> getStudentBadgeStats(@PathVariable UUID studentId) {
        try {
            StudentBadgeStatsDTO stats = badgeService.getStudentBadgeStats(studentId);
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // Get current user's badge statistics
    @GetMapping("/my-stats")
    public ResponseEntity<?> getMyBadgeStats(@RequestHeader("Authorization") String token) {
        try {
            String jwt = token.substring(7); // Remove "Bearer " prefix
            String username = jwtUtil.extractUsername(jwt);
            
            // Find user by username instead of parsing as UUID
            UserEntity user = userRepository.findByUserName(username);
            if (user == null) {
                return ResponseEntity.status(404).body("User not found: " + username);
            }
            
            StudentBadgeStatsDTO stats = badgeService.getStudentBadgeStats(user.getUserId());
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            e.printStackTrace();
            System.err.println("Error in getMyBadgeStats: " + e.getMessage());
            return ResponseEntity.status(500).body("Error fetching badge stats: " + e.getMessage());
        }
    }

    // Get recent badges for a student
    @GetMapping("/student/{studentId}/recent")
    public ResponseEntity<List<BadgeDTO>> getRecentBadges(
            @PathVariable UUID studentId,
            @RequestParam(defaultValue = "5") int limit) {
        try {
            List<BadgeDTO> badges = badgeService.getRecentBadgesForStudent(studentId, limit);
            return ResponseEntity.ok(badges);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // Get recent badges for current user
    @GetMapping("/my-recent")
    public ResponseEntity<List<BadgeDTO>> getMyRecentBadges(
            @RequestHeader("Authorization") String token,
            @RequestParam(defaultValue = "5") int limit) {
        try {
            String jwt = token.substring(7); // Remove "Bearer " prefix
            String username = jwtUtil.extractUsername(jwt);
            
            // Find user by username instead of parsing as UUID
            UserEntity user = userRepository.findByUserName(username);
            if (user == null) {
                return ResponseEntity.badRequest().build();
            }
            
            List<BadgeDTO> badges = badgeService.getRecentBadgesForStudent(user.getUserId(), limit);
            return ResponseEntity.ok(badges);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // Get badges for a specific class
    @GetMapping("/class/{classId}")
    public ResponseEntity<List<BadgeDTO>> getClassBadges(@PathVariable UUID classId) {
        try {
            List<BadgeDTO> badges = badgeService.getBadgesForClass(classId);
            return ResponseEntity.ok(badges);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // Get class badge leaderboard
    @GetMapping("/class/{classId}/leaderboard")
    public ResponseEntity<List<StudentBadgeStatsDTO>> getClassBadgeLeaderboard(@PathVariable UUID classId) {
        try {
            List<StudentBadgeStatsDTO> leaderboard = badgeService.getClassBadgeLeaderboard(classId);
            return ResponseEntity.ok(leaderboard);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // Create a new badge (admin/teacher only)
    @PostMapping
    public ResponseEntity<BadgeEntity> createBadge(
            @RequestBody BadgeEntity badge,
            @RequestHeader("Authorization") String token) {
        try {
            String jwt = token.substring(7); // Remove "Bearer " prefix
            String username = jwtUtil.extractUsername(jwt);
            
            // Find user by username instead of parsing as UUID
            UserEntity user = userRepository.findByUserName(username);
            if (user == null) {
                return ResponseEntity.badRequest().build();
            }
            
            BadgeEntity createdBadge = badgeService.createBadge(badge, user.getUserId());
            return ResponseEntity.ok(createdBadge);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // Update a badge (admin/teacher only)
    @PutMapping("/{badgeId}")
    public ResponseEntity<BadgeEntity> updateBadge(
            @PathVariable UUID badgeId,
            @RequestBody BadgeEntity badge) {
        try {
            BadgeEntity updatedBadge = badgeService.updateBadge(badgeId, badge);
            return ResponseEntity.ok(updatedBadge);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // Delete a badge (admin/teacher only)
    @DeleteMapping("/{badgeId}")
    public ResponseEntity<Void> deleteBadge(@PathVariable UUID badgeId) {
        try {
            badgeService.deleteBadge(badgeId);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // Manually award a badge to a student (teacher/admin only)
    @PostMapping("/{badgeId}/award/{studentId}")
    public ResponseEntity<Void> awardBadge(
            @PathVariable UUID badgeId,
            @PathVariable UUID studentId,
            @RequestParam(required = false) Double performanceScore,
            @RequestParam(required = false) String notes) {
        try {
            badgeService.awardBadgeToStudent(studentId, badgeId, performanceScore, notes);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // Revoke a badge from a student (teacher/admin only)
    @DeleteMapping("/{badgeId}/revoke/{studentId}")
    public ResponseEntity<Void> revokeBadge(
            @PathVariable UUID badgeId,
            @PathVariable UUID studentId) {
        try {
            badgeService.revokeBadgeFromStudent(studentId, badgeId);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // Initialize system badges (admin only)
    @PostMapping("/initialize")
    public ResponseEntity<Void> initializeSystemBadges() {
        try {
            badgeService.initializeSystemBadges();
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // Get most earned badges
    @GetMapping("/most-earned")
    public ResponseEntity<List<BadgeDTO>> getMostEarnedBadges(
            @RequestParam(defaultValue = "10") int limit) {
        try {
            List<BadgeDTO> badges = badgeService.getMostEarnedBadges(limit);
            return ResponseEntity.ok(badges);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // Get rarest badges
    @GetMapping("/rarest")
    public ResponseEntity<List<BadgeDTO>> getRarestBadges(
            @RequestParam(defaultValue = "10") int limit) {
        try {
            List<BadgeDTO> badges = badgeService.getRarestBadges(limit);
            return ResponseEntity.ok(badges);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
} 