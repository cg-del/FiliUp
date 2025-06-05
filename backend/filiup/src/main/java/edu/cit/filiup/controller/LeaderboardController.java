package edu.cit.filiup.controller;

import edu.cit.filiup.dto.LeaderboardDTO;
import edu.cit.filiup.entity.LeaderboardEntity;
import edu.cit.filiup.entity.UserEntity;
import edu.cit.filiup.service.LeaderboardService;
import edu.cit.filiup.service.UserService;
import edu.cit.filiup.util.RequireRole;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/leaderboard")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"}, allowCredentials = "true")
public class LeaderboardController {
    private final LeaderboardService leaderboardService;
    private final UserService userService;

    @Autowired
    public LeaderboardController(LeaderboardService leaderboardService, UserService userService) {
        this.leaderboardService = leaderboardService;
        this.userService = userService;
    }

    // Create new leaderboard entry
    @PostMapping
    public ResponseEntity<LeaderboardEntity> createLeaderboardEntry(
            @RequestBody LeaderboardEntity leaderboardEntity,
            @RequestParam UUID studentId) {
        try {
            LeaderboardEntity createdEntry = leaderboardService.createLeaderboardEntry(leaderboardEntity, studentId);
            return ResponseEntity.ok(createdEntry);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // Get all leaderboard entries
    @GetMapping
    public ResponseEntity<List<LeaderboardDTO>> getAllLeaderboardEntries() {
        try {
            List<LeaderboardDTO> leaderboards = leaderboardService.getAllLeaderboardDTOs();
            return ResponseEntity.ok(leaderboards);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Get leaderboard entry by ID
    @GetMapping("/{entryId}")
    public ResponseEntity<LeaderboardDTO> getLeaderboardEntryById(@PathVariable UUID entryId) {
        try {
            LeaderboardDTO leaderboard = leaderboardService.getLeaderboardDTOById(entryId);
            return leaderboard != null ? ResponseEntity.ok(leaderboard) : ResponseEntity.notFound().build();
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Get student's leaderboard entries
    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<LeaderboardDTO>> getStudentLeaderboardEntries(@PathVariable UUID studentId) {
        try {
            List<LeaderboardDTO> leaderboards = leaderboardService.getStudentLeaderboardDTOs(studentId);
            return ResponseEntity.ok(leaderboards);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // NEW CLASS-BASED LEADERBOARD ENDPOINTS

    // Get all leaderboard entries for a specific class
    @GetMapping("/class/{classId}")
    public ResponseEntity<List<LeaderboardDTO>> getLeaderboardsByClass(@PathVariable UUID classId) {
        try {
            List<LeaderboardDTO> leaderboards = leaderboardService.getLeaderboardsByClass(classId);
            return ResponseEntity.ok(leaderboards);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Get leaderboard entries for a class filtered by category
    @GetMapping("/class/{classId}/category/{category}")
    public ResponseEntity<List<LeaderboardDTO>> getLeaderboardsByClassAndCategory(
            @PathVariable UUID classId,
            @PathVariable LeaderboardEntity.Category category) {
        try {
            List<LeaderboardDTO> leaderboards = leaderboardService.getLeaderboardsByClassAndCategory(classId, category);
            return ResponseEntity.ok(leaderboards);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Get leaderboard entries for a class filtered by timeframe
    @GetMapping("/class/{classId}/timeframe/{timeFrame}")
    public ResponseEntity<List<LeaderboardDTO>> getLeaderboardsByClassAndTimeFrame(
            @PathVariable UUID classId,
            @PathVariable LeaderboardEntity.TimeFrame timeFrame) {
        try {
            List<LeaderboardDTO> leaderboards = leaderboardService.getLeaderboardsByClassAndTimeFrame(classId, timeFrame);
            return ResponseEntity.ok(leaderboards);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Get leaderboard entries for a class filtered by category and timeframe
    @GetMapping("/class/{classId}/category/{category}/timeframe/{timeFrame}")
    public ResponseEntity<List<LeaderboardDTO>> getLeaderboardsByClassCategoryAndTimeFrame(
            @PathVariable UUID classId,
            @PathVariable LeaderboardEntity.Category category,
            @PathVariable LeaderboardEntity.TimeFrame timeFrame) {
        try {
            List<LeaderboardDTO> leaderboards = leaderboardService.getLeaderboardsByClassCategoryAndTimeFrame(classId, category, timeFrame);
            return ResponseEntity.ok(leaderboards);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // NEW STORY-BASED LEADERBOARD ENDPOINTS

    // Get all leaderboard entries for a specific story
    @GetMapping("/story/{storyId}")
    public ResponseEntity<List<LeaderboardDTO>> getLeaderboardsByStory(@PathVariable UUID storyId) {
        try {
            List<LeaderboardDTO> leaderboards = leaderboardService.getLeaderboardsByStory(storyId);
            return ResponseEntity.ok(leaderboards);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Get leaderboard entries for a story filtered by category
    @GetMapping("/story/{storyId}/category/{category}")
    public ResponseEntity<List<LeaderboardDTO>> getLeaderboardsByStoryAndCategory(
            @PathVariable UUID storyId,
            @PathVariable LeaderboardEntity.Category category) {
        try {
            List<LeaderboardDTO> leaderboards = leaderboardService.getLeaderboardsByStoryAndCategory(storyId, category);
            return ResponseEntity.ok(leaderboards);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Get leaderboard entries for a story filtered by timeframe
    @GetMapping("/story/{storyId}/timeframe/{timeFrame}")
    public ResponseEntity<List<LeaderboardDTO>> getLeaderboardsByStoryAndTimeFrame(
            @PathVariable UUID storyId,
            @PathVariable LeaderboardEntity.TimeFrame timeFrame) {
        try {
            List<LeaderboardDTO> leaderboards = leaderboardService.getLeaderboardsByStoryAndTimeFrame(storyId, timeFrame);
            return ResponseEntity.ok(leaderboards);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Get leaderboard entries for a story filtered by category and timeframe
    @GetMapping("/story/{storyId}/category/{category}/timeframe/{timeFrame}")
    public ResponseEntity<List<LeaderboardDTO>> getLeaderboardsByStoryCategoryAndTimeFrame(
            @PathVariable UUID storyId,
            @PathVariable LeaderboardEntity.Category category,
            @PathVariable LeaderboardEntity.TimeFrame timeFrame) {
        try {
            List<LeaderboardDTO> leaderboards = leaderboardService.getLeaderboardsByStoryCategoryAndTimeFrame(storyId, category, timeFrame);
            return ResponseEntity.ok(leaderboards);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // EXISTING ENDPOINTS (kept as is)

    // Get leaderboard by category
    @GetMapping("/category/{category}")
    public ResponseEntity<List<LeaderboardDTO>> getLeaderboardByCategory(
            @PathVariable LeaderboardEntity.Category category) {
        try {
            List<LeaderboardDTO> leaderboards = leaderboardService.getLeaderboardDTOsByCategory(category);
            return ResponseEntity.ok(leaderboards);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Get leaderboard by time frame
    @GetMapping("/timeframe/{timeFrame}")
    public ResponseEntity<List<LeaderboardDTO>> getLeaderboardByTimeFrame(
            @PathVariable LeaderboardEntity.TimeFrame timeFrame) {
        try {
            List<LeaderboardDTO> leaderboards = leaderboardService.getLeaderboardDTOsByTimeFrame(timeFrame);
            return ResponseEntity.ok(leaderboards);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Get leaderboard by category and time frame
    @GetMapping("/category/{category}/timeframe/{timeFrame}")
    public ResponseEntity<List<LeaderboardDTO>> getLeaderboardByCategoryAndTimeFrame(
            @PathVariable LeaderboardEntity.Category category,
            @PathVariable LeaderboardEntity.TimeFrame timeFrame) {
        try {
            List<LeaderboardDTO> leaderboards = leaderboardService.getLeaderboardDTOsByCategoryAndTimeFrame(category, timeFrame);
            return ResponseEntity.ok(leaderboards);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Update leaderboard entry
    @PutMapping("/{entryId}")
    public ResponseEntity<LeaderboardEntity> updateLeaderboardEntry(
            @PathVariable UUID entryId,
            @RequestBody LeaderboardEntity updatedEntry) {
        try {
            LeaderboardEntity updated = leaderboardService.updateLeaderboardEntry(entryId, updatedEntry);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // Delete leaderboard entry
    @DeleteMapping("/{entryId}")
    public ResponseEntity<Void> deleteLeaderboardEntry(@PathVariable UUID entryId) {
        try {
            leaderboardService.deleteLeaderboardEntry(entryId);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // Update ranks for a category and time frame
    @PutMapping("/update-ranks")
    public ResponseEntity<String> updateRanks(
            @RequestParam LeaderboardEntity.Category category,
            @RequestParam LeaderboardEntity.TimeFrame timeFrame) {
        try {
            leaderboardService.updateRanks(category, timeFrame);
            return ResponseEntity.ok("Ranks updated successfully");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body("Failed to update ranks: " + e.getMessage());
        }
    }

    // QUIZ-BASED LEADERBOARD ENDPOINTS (existing)

    // Get class leaderboard based on quiz performance
    @GetMapping("/class/{classId}/quiz-performance")
    public ResponseEntity<List<LeaderboardDTO>> getClassQuizLeaderboard(
            @PathVariable UUID classId,
            @RequestParam(required = false, defaultValue = "ALL_TIME") LeaderboardEntity.TimeFrame timeFrame) {
        try {
            List<LeaderboardDTO> leaderboard = leaderboardService.getClassQuizLeaderboardDTOs(classId, timeFrame);
            return ResponseEntity.ok(leaderboard);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // Get story leaderboard based on quiz performance
    @GetMapping("/story/{storyId}/quiz-performance")
    public ResponseEntity<List<LeaderboardDTO>> getStoryQuizLeaderboard(
            @PathVariable UUID storyId,
            @RequestParam(required = false, defaultValue = "ALL_TIME") LeaderboardEntity.TimeFrame timeFrame) {
        try {
            List<LeaderboardDTO> leaderboard = leaderboardService.getStoryQuizLeaderboardDTOs(storyId, timeFrame);
            return ResponseEntity.ok(leaderboard);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // Generate quiz-based leaderboard entries
    @PostMapping("/generate-quiz-leaderboards")
    public ResponseEntity<String> generateQuizLeaderboards() {
        try {
            leaderboardService.generateQuizBasedLeaderboards();
            return ResponseEntity.ok("Quiz-based leaderboards generated successfully");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body("Failed to generate leaderboards: " + e.getMessage());
        }
    }

    // Get overall quiz leaderboard for all classes
    @GetMapping("/quiz-performance/overall")
    public ResponseEntity<List<LeaderboardDTO>> getOverallQuizLeaderboard(
            @RequestParam(required = false, defaultValue = "ALL_TIME") LeaderboardEntity.TimeFrame timeFrame) {
        try {
            List<LeaderboardDTO> leaderboard = leaderboardService.getOverallQuizLeaderboardDTOs(timeFrame);
            return ResponseEntity.ok(leaderboard);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Get top performers by accuracy
    @GetMapping("/quiz-performance/accuracy")
    public ResponseEntity<List<LeaderboardDTO>> getAccuracyLeaderboard(
            @RequestParam(required = false, defaultValue = "ALL_TIME") LeaderboardEntity.TimeFrame timeFrame,
            @RequestParam(required = false) UUID classId) {
        try {
            List<LeaderboardDTO> leaderboard = leaderboardService.getAccuracyLeaderboardDTOs(timeFrame, classId);
            return ResponseEntity.ok(leaderboard);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Get fastest completion leaderboard
    @GetMapping("/quiz-performance/speed")
    public ResponseEntity<List<LeaderboardDTO>> getSpeedLeaderboard(
            @RequestParam(required = false, defaultValue = "ALL_TIME") LeaderboardEntity.TimeFrame timeFrame,
            @RequestParam(required = false) UUID classId) {
        try {
            List<LeaderboardDTO> leaderboard = leaderboardService.getSpeedLeaderboardDTOs(timeFrame, classId);
            return ResponseEntity.ok(leaderboard);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Get quiz performance summary for a class
    @GetMapping("/class/{classId}/summary")
    public ResponseEntity<Object> getClassQuizSummary(@PathVariable UUID classId) {
        try {
            Object summary = leaderboardService.getClassQuizSummary(classId);
            return ResponseEntity.ok(summary);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Get quiz performance summary for a story
    @GetMapping("/story/{storyId}/summary")
    public ResponseEntity<Object> getStoryQuizSummary(@PathVariable UUID storyId) {
        try {
            Object summary = leaderboardService.getStoryQuizSummary(storyId);
            return ResponseEntity.ok(summary);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // STUDENT-SPECIFIC ENDPOINTS

    // Get classmate leaderboards for student's enrolled classes
    @GetMapping("/student/classmates")
    @RequireRole("STUDENT")
    public ResponseEntity<List<LeaderboardDTO>> getStudentClassmateLeaderboards(
            @RequestParam(required = false, defaultValue = "CLASS_QUIZ_PERFORMANCE") LeaderboardEntity.Category category,
            @RequestParam(required = false, defaultValue = "ALL_TIME") LeaderboardEntity.TimeFrame timeFrame) {
        try {
            // Get current student from authentication
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }
            
            String userIdentifier = authentication.getName();
            UserEntity currentUser = userService.getUserByEmail(userIdentifier);
            
            // If not found by email, try by username
            if (currentUser == null) {
                currentUser = userService.getUserByUsername(userIdentifier);
            }
            
            if (currentUser == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }
            
            // Get classmate leaderboards
            List<LeaderboardDTO> leaderboards = leaderboardService.getStudentClassmateLeaderboards(
                currentUser.getUserId(), category, timeFrame);
            return ResponseEntity.ok(leaderboards);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
