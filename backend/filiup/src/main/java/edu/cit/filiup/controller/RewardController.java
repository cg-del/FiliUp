package edu.cit.filiup.controller;

import edu.cit.filiup.entity.BadgeEntity;
import edu.cit.filiup.service.RewardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/rewards")
@CrossOrigin(origins = "*")
public class RewardController {
    private final RewardService rewardService;

    @Autowired
    public RewardController(RewardService rewardService) {
        this.rewardService = rewardService;
    }

    // Create a new badge
    @PostMapping("/badges")
    public ResponseEntity<BadgeEntity> createBadge(
            @RequestBody BadgeEntity badgeEntity,
            @RequestParam int userId) {
        try {
            BadgeEntity createdBadge = rewardService.createBadge(badgeEntity, userId);
            return ResponseEntity.ok(createdBadge);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // Get all active badges
    @GetMapping("/badges")
    public ResponseEntity<List<BadgeEntity>> getAllBadges() {
        return ResponseEntity.ok(rewardService.getAllBadges());
    }

    // Get badge by ID
    @GetMapping("/badges/{badgeId}")
    public ResponseEntity<BadgeEntity> getBadgeById(@PathVariable Long badgeId) {
        return rewardService.getBadgeById(badgeId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Get badges by teacher
    @GetMapping("/badges/teacher/{userId}")
    public ResponseEntity<List<BadgeEntity>> getBadgesByTeacher(@PathVariable int userId) {
        return ResponseEntity.ok(rewardService.getBadgesByTeacher(userId));
    }

    // Get badges by points value
    @GetMapping("/badges/points/{pointsValue}")
    public ResponseEntity<List<BadgeEntity>> getBadgesByPointsValue(@PathVariable Integer pointsValue) {
        return ResponseEntity.ok(rewardService.getBadgesByPointsValue(pointsValue));
    }

    // Search badges by title
    @GetMapping("/badges/search")
    public ResponseEntity<List<BadgeEntity>> searchBadgesByTitle(@RequestParam String title) {
        return ResponseEntity.ok(rewardService.searchBadgesByTitle(title));
    }

    // Update badge
    @PutMapping("/badges/{badgeId}")
    public ResponseEntity<BadgeEntity> updateBadge(
            @PathVariable Long badgeId,
            @RequestBody BadgeEntity updatedBadge) {
        try {
            BadgeEntity updated = rewardService.updateBadge(badgeId, updatedBadge);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // Delete badge (soft delete)
    @DeleteMapping("/badges/{badgeId}")
    public ResponseEntity<Void> deleteBadge(@PathVariable Long badgeId) {
        try {
            rewardService.deleteBadge(badgeId);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // Award badge to student
    @PostMapping("/badges/{badgeId}/award")
    public ResponseEntity<Void> awardBadgeToStudent(
            @PathVariable Long badgeId,
            @RequestParam int studentId) {
        try {
            rewardService.awardBadgeToStudent(badgeId, studentId);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
