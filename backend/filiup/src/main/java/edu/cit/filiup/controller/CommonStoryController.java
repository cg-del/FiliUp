package edu.cit.filiup.controller;

import edu.cit.filiup.entity.CommonStoryEntity;
import edu.cit.filiup.service.CommonStoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/common-stories")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"}, allowCredentials = "true")
public class CommonStoryController {

    @Autowired
    private CommonStoryService commonStoryService;

    @GetMapping
    public ResponseEntity<List<CommonStoryEntity>> getAllStories() {
        try {
            List<CommonStoryEntity> stories = commonStoryService.getAllStories();
            return ResponseEntity.ok(stories);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<CommonStoryEntity> getStoryById(@PathVariable Long id) {
        try {
        return commonStoryService.getStoryById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping
    public ResponseEntity<?> createStory(@RequestBody CommonStoryEntity story) {
        try {
            // Validate required fields
            if (story.getTitle() == null || story.getTitle().trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Title is required");
            }
            if (story.getContent() == null || story.getContent().trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Content is required");
            }
            if (story.getGenre() == null || story.getGenre().trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Genre is required");
            }

            CommonStoryEntity createdStory = commonStoryService.saveStory(story);
            return ResponseEntity.ok(createdStory);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to create story");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateStory(@PathVariable Long id, @RequestBody CommonStoryEntity story) {
        try {
            // Validate required fields
            if (story.getTitle() == null || story.getTitle().trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Title is required");
            }
            if (story.getContent() == null || story.getContent().trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Content is required");
            }
            if (story.getGenre() == null || story.getGenre().trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Genre is required");
            }

            return commonStoryService.getStoryById(id)
                    .map(existingStory -> {
                        story.setStoryId(id);
                        return ResponseEntity.ok(commonStoryService.saveStory(story));
                    })
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to update story");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteStory(@PathVariable Long id) {
        try {
            if (!commonStoryService.getStoryById(id).isPresent()) {
                return ResponseEntity.notFound().build();
            }
        commonStoryService.deleteStory(id);
        return ResponseEntity.ok().build();
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to delete story");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }
} 