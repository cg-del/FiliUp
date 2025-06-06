package edu.cit.filiup.controller;

import edu.cit.filiup.entity.CommonStoryEntity;
import edu.cit.filiup.entity.UserEntity;
import edu.cit.filiup.service.CommonStoryService;
import edu.cit.filiup.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.UUID;

@RestController
@RequestMapping("/api/common-stories")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"}, allowCredentials = "true")
public class CommonStoryController {

    @Autowired
    private CommonStoryService commonStoryService;

    @Autowired
    private UserRepository userRepository;

    @GetMapping
    public ResponseEntity<List<CommonStoryEntity>> getAllStories() {
        try {
            List<CommonStoryEntity> stories = commonStoryService.getAllCommonStories();
            return ResponseEntity.ok(stories);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<CommonStoryEntity> getStoryById(@PathVariable UUID id) {
        try {
            CommonStoryEntity story = commonStoryService.getCommonStoryById(id);
            if (story != null) {
                return ResponseEntity.ok(story);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping
    public ResponseEntity<?> createStory(@RequestBody CommonStoryEntity story, JwtAuthenticationToken authentication) {
        try {
            // Get the authenticated user
            String userEmail = authentication.getName();
            UserEntity user = userRepository.findByUserEmail(userEmail);
            if (user == null) {
                return ResponseEntity.status(401).body("User not found");
            }

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

            CommonStoryEntity createdStory = commonStoryService.createCommonStory(story, user);
            return ResponseEntity.ok(createdStory);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to create story");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateStory(@PathVariable UUID id, @RequestBody CommonStoryEntity story) {
        try {
            // Validate required fields
            if (story.getTitle() != null && story.getTitle().trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Title cannot be empty");
            }
            if (story.getContent() != null && story.getContent().trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Content cannot be empty");
            }
            if (story.getGenre() != null && story.getGenre().trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Genre cannot be empty");
            }

            CommonStoryEntity updatedStory = commonStoryService.updateCommonStory(id, story);
            if (updatedStory != null) {
                return ResponseEntity.ok(updatedStory);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to update story");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteStory(@PathVariable UUID id) {
        try {
            boolean deleted = commonStoryService.deleteCommonStory(id);
            if (deleted) {
                return ResponseEntity.ok().build();
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to delete story");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }
} 