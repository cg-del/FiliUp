package edu.cit.filiup.controller;

import edu.cit.filiup.entity.LeaderboardEntity;
import edu.cit.filiup.service.LeaderboardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/leaderboard")
@CrossOrigin(origins = "*")
public class LeaderboardController {
    private final LeaderboardService leaderboardService;

    @Autowired
    public LeaderboardController(LeaderboardService leaderboardService) {
        this.leaderboardService = leaderboardService;
    }

    // Create new leaderboard entry
    @PostMapping
    public ResponseEntity<LeaderboardEntity> createLeaderboardEntry(
            @RequestBody LeaderboardEntity leaderboardEntity,
            @RequestParam int studentId) {
        try {
            LeaderboardEntity createdEntry = leaderboardService.createLeaderboardEntry(leaderboardEntity, studentId);
            return ResponseEntity.ok(createdEntry);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // Get all leaderboard entries
    @GetMapping
    public ResponseEntity<List<LeaderboardEntity>> getAllLeaderboardEntries() {
        return ResponseEntity.ok(leaderboardService.getAllLeaderboardEntries());
    }

    // Get leaderboard entry by ID
    @GetMapping("/{entryId}")
    public ResponseEntity<LeaderboardEntity> getLeaderboardEntryById(@PathVariable Long entryId) {
        return leaderboardService.getLeaderboardEntryById(entryId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Get student's leaderboard entries
    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<LeaderboardEntity>> getStudentLeaderboardEntries(@PathVariable int studentId) {
        return ResponseEntity.ok(leaderboardService.getStudentLeaderboardEntries(studentId));
    }

    // Get leaderboard by category
    @GetMapping("/category/{category}")
    public ResponseEntity<List<LeaderboardEntity>> getLeaderboardByCategory(
            @PathVariable LeaderboardEntity.Category category) {
        return ResponseEntity.ok(leaderboardService.getLeaderboardByCategory(category));
    }

    // Get leaderboard by time frame
    @GetMapping("/timeframe/{timeFrame}")
    public ResponseEntity<List<LeaderboardEntity>> getLeaderboardByTimeFrame(
            @PathVariable LeaderboardEntity.TimeFrame timeFrame) {
        return ResponseEntity.ok(leaderboardService.getLeaderboardByTimeFrame(timeFrame));
    }

    // Get leaderboard by category and time frame
    @GetMapping("/category/{category}/timeframe/{timeFrame}")
    public ResponseEntity<List<LeaderboardEntity>> getLeaderboardByCategoryAndTimeFrame(
            @PathVariable LeaderboardEntity.Category category,
            @PathVariable LeaderboardEntity.TimeFrame timeFrame) {
        return ResponseEntity.ok(leaderboardService.getLeaderboardByCategoryAndTimeFrame(category, timeFrame));
    }

    // Update leaderboard entry
    @PutMapping("/{entryId}")
    public ResponseEntity<LeaderboardEntity> updateLeaderboardEntry(
            @PathVariable Long entryId,
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
    public ResponseEntity<Void> deleteLeaderboardEntry(@PathVariable Long entryId) {
        try {
            leaderboardService.deleteLeaderboardEntry(entryId);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // Update ranks for a category and time frame
    @PutMapping("/update-ranks")
    public ResponseEntity<Void> updateRanks(
            @RequestParam LeaderboardEntity.Category category,
            @RequestParam LeaderboardEntity.TimeFrame timeFrame) {
        try {
            leaderboardService.updateRanks(category, timeFrame);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
