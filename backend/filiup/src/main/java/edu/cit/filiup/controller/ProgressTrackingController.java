package edu.cit.filiup.controller;

import edu.cit.filiup.entity.ProgressEntity;
import edu.cit.filiup.service.ProgressTrackingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/progress")
@CrossOrigin(origins = "*")
public class ProgressTrackingController {
    private final ProgressTrackingService progressTrackingService;

    @Autowired
    public ProgressTrackingController(ProgressTrackingService progressTrackingService) {
        this.progressTrackingService = progressTrackingService;
    }

    // Create new progress record
    @PostMapping
    public ResponseEntity<ProgressEntity> createProgress(
            @RequestBody ProgressEntity progressEntity,
            @RequestParam int studentId) {
        try {
            ProgressEntity createdProgress = progressTrackingService.createProgress(progressEntity, studentId);
            return ResponseEntity.ok(createdProgress);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // Get all progress for a student
    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<ProgressEntity>> getStudentProgress(@PathVariable int studentId) {
        return ResponseEntity.ok(progressTrackingService.getStudentProgress(studentId));
    }

    // Get progress by activity type
    @GetMapping("/student/{studentId}/activity/{activityType}")
    public ResponseEntity<List<ProgressEntity>> getProgressByActivityType(
            @PathVariable int studentId,
            @PathVariable ProgressEntity.ActivityType activityType) {
        return ResponseEntity.ok(progressTrackingService.getStudentProgressByActivityType(studentId, activityType));
    }

    // Get completed activities
    @GetMapping("/student/{studentId}/completed")
    public ResponseEntity<List<ProgressEntity>> getCompletedActivities(@PathVariable int studentId) {
        return ResponseEntity.ok(progressTrackingService.getCompletedActivities(studentId));
    }

    // Get progress by completion threshold
    @GetMapping("/student/{studentId}/threshold/{completionPercentage}")
    public ResponseEntity<List<ProgressEntity>> getProgressByThreshold(
            @PathVariable int studentId,
            @PathVariable Double completionPercentage) {
        return ResponseEntity.ok(progressTrackingService.getProgressByCompletionThreshold(studentId, completionPercentage));
    }

    // Get progress by ID
    @GetMapping("/{progressId}")
    public ResponseEntity<ProgressEntity> getProgressById(@PathVariable Long progressId) {
        return progressTrackingService.getProgressById(progressId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Update progress
    @PutMapping("/{progressId}")
    public ResponseEntity<ProgressEntity> updateProgress(
            @PathVariable Long progressId,
            @RequestBody ProgressEntity updatedProgress) {
        try {
            ProgressEntity updated = progressTrackingService.updateProgress(progressId, updatedProgress);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // Mark activity as completed
    @PutMapping("/{progressId}/complete")
    public ResponseEntity<ProgressEntity> markActivityCompleted(@PathVariable Long progressId) {
        try {
            ProgressEntity completed = progressTrackingService.markActivityCompleted(progressId);
            return ResponseEntity.ok(completed);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // Delete progress
    @DeleteMapping("/{progressId}")
    public ResponseEntity<Void> deleteProgress(@PathVariable Long progressId) {
        try {
            progressTrackingService.deleteProgress(progressId);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // Get student statistics
    @GetMapping("/student/{studentId}/statistics")
    public ResponseEntity<Map<String, Object>> getStudentStatistics(@PathVariable int studentId) {
        Double averageCompletion = progressTrackingService.calculateAverageCompletion(studentId);
        Integer totalTimeSpent = progressTrackingService.calculateTotalTimeSpent(studentId);
        
        Map<String, Object> statistics = Map.of(
            "averageCompletion", averageCompletion,
            "totalTimeSpentMinutes", totalTimeSpent
        );
        
        return ResponseEntity.ok(statistics);
    }
}
