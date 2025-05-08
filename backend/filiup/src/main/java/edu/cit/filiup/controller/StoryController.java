package edu.cit.filiup.controller;

import edu.cit.filiup.entity.StoryEntity;
import edu.cit.filiup.service.StoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/stories")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"}, allowCredentials = "true")
public class StoryController {
    private final StoryService storyService;

    @Autowired
    public StoryController(StoryService storyService) {
        this.storyService = storyService;
    }

    // Create a new story
    @PostMapping
    public ResponseEntity<StoryEntity> createStory(
            @RequestBody StoryEntity storyEntity,
            @RequestParam int userId) {
        try {
            StoryEntity createdStory = storyService.createStory(storyEntity, userId);
            return ResponseEntity.ok(createdStory);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // Get all active stories
    @GetMapping
    public ResponseEntity<List<StoryEntity>> getAllStories() {
        return ResponseEntity.ok(storyService.getAllStories());
    }

    // Get story by ID
    @GetMapping("/{storyId}")
    public ResponseEntity<StoryEntity> getStoryById(@PathVariable Long storyId) {
        return storyService.getStoryById(storyId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Get stories by class
    @GetMapping("/class/{classId}")
    public ResponseEntity<List<StoryEntity>> getStoriesByClass(@PathVariable Long classId) {
        return ResponseEntity.ok(storyService.getStoriesByClass(classId));
    }

    // Get stories by teacher
    @GetMapping("/teacher/{userId}")
    public ResponseEntity<List<StoryEntity>> getStoriesByTeacher(@PathVariable int userId) {
        return ResponseEntity.ok(storyService.getStoriesByTeacher(userId));
    }

    // Get stories by difficulty level
    @GetMapping("/difficulty/{difficultyLevel}")
    public ResponseEntity<List<StoryEntity>> getStoriesByDifficulty(
            @PathVariable StoryEntity.DifficultyLevel difficultyLevel) {
        return ResponseEntity.ok(storyService.getStoriesByDifficulty(difficultyLevel));
    }

    // Update story
    @PutMapping("/{storyId}")
    public ResponseEntity<StoryEntity> updateStory(
            @PathVariable Long storyId,
            @RequestBody StoryEntity updatedStory) {
        try {
            StoryEntity updated = storyService.updateStory(storyId, updatedStory);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // Delete story (soft delete)
    @DeleteMapping("/{storyId}")
    public ResponseEntity<Void> deleteStory(@PathVariable Long storyId) {
        try {
            storyService.deleteStory(storyId);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
