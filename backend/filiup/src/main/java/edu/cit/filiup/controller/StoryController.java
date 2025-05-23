package edu.cit.filiup.controller;

import edu.cit.filiup.entity.StoryEntity;
import edu.cit.filiup.entity.UserEntity;
import edu.cit.filiup.service.StoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.stream.Collectors;

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
    @PostMapping(consumes = "application/json")
    public ResponseEntity<?> createStory(
            @RequestBody StoryEntity storyEntity,
            @RequestParam int userId) {
        try {
            // Log incoming request
            System.out.println("Received story creation request:");
            System.out.println("Story Entity: " + storyEntity);
            System.out.println("User ID: " + userId);

            // Validate required fields
            if (storyEntity.getTitle() == null || storyEntity.getTitle().trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Title is required");
            }
            if (storyEntity.getContent() == null || storyEntity.getContent().trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Content is required");
            }
            if (storyEntity.getGenre() == null || storyEntity.getGenre().trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Genre is required");
            }
            
            // Validate class entity
            if (storyEntity.getClassEntity() == null) {
                return ResponseEntity.badRequest().body("Class entity is required");
            }
            if (storyEntity.getClassEntity().getClassId() == null) {
                return ResponseEntity.badRequest().body("Class ID is required");
            }

            // Create the story
            StoryEntity createdStory = storyService.createStory(storyEntity, userId);
            
            // Log success
            System.out.println("Story created successfully: " + createdStory);
            
            return ResponseEntity.ok(createdStory);
        } catch (RuntimeException e) {
            // Log error
            System.err.println("Error creating story: " + e.getMessage());
            e.printStackTrace();
            
            // Return error response
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to create story");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    // Get all active stories
    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getAllStories() {
        List<StoryEntity> stories = storyService.getAllStories();
        List<Map<String, Object>> storiesWithAuthorInfo = stories.stream()
            .map(story -> {
                Map<String, Object> storyMap = new HashMap<>();
                storyMap.put("storyId", story.getStoryId());
                storyMap.put("title", story.getTitle());
                storyMap.put("content", story.getContent());
                storyMap.put("genre", story.getGenre());
                storyMap.put("coverPicture", story.getCoverPicture());
                storyMap.put("coverPictureType", story.getCoverPictureType());
                storyMap.put("createdAt", story.getCreatedAt());
                storyMap.put("classEntity", story.getClassEntity());
                
                // Get author information
                UserEntity author = story.getCreatedBy();
                if (author != null) {
                    Map<String, Object> authorInfo = new HashMap<>();
                    authorInfo.put("userId", author.getUserId());
                    authorInfo.put("userName", author.getUserName());
                    authorInfo.put("userRole", author.getUserRole());
                    storyMap.put("createdBy", authorInfo);
                } else {
                    storyMap.put("createdBy", null);
                }
                
                return storyMap;
            })
            .collect(Collectors.toList());
        
        return ResponseEntity.ok(storiesWithAuthorInfo);
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

    // Get stories by genre
    @GetMapping("/genre/{genre}")
    public ResponseEntity<List<StoryEntity>> getStoriesByGenre(@PathVariable String genre) {
        return ResponseEntity.ok(storyService.getStoriesByGenre(genre));
    }

    // Get all stories with teacher information
    @GetMapping("/with-teacher-info")
    public ResponseEntity<List<Map<String, Object>>> getAllStoriesWithTeacherInfo() {
        List<StoryEntity> stories = storyService.getAllStories();
        List<Map<String, Object>> storiesWithTeacherInfo = stories.stream()
            .map(story -> {
                Map<String, Object> storyMap = new HashMap<>();
                storyMap.put("storyId", story.getStoryId());
                storyMap.put("title", story.getTitle());
                storyMap.put("content", story.getContent());
                storyMap.put("genre", story.getGenre());
                storyMap.put("coverPicture", story.getCoverPicture());
                storyMap.put("coverPictureType", story.getCoverPictureType());
                
                // Get teacher information from the createdBy field
                UserEntity teacher = story.getCreatedBy();
                if (teacher != null && "TEACHER".equals(teacher.getUserRole())) {
                    storyMap.put("teacherName", teacher.getUserName());
                } else {
                    storyMap.put("teacherName", "System");
                }
                
                return storyMap;
            })
            .collect(Collectors.toList());
        
        return ResponseEntity.ok(storiesWithTeacherInfo);
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
