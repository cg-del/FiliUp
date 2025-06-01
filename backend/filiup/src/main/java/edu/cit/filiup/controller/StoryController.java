package edu.cit.filiup.controller;

import edu.cit.filiup.dto.StoryCreateDTO;
import edu.cit.filiup.dto.StoryResponseDTO;
import edu.cit.filiup.entity.ClassEntity;
import edu.cit.filiup.entity.StoryEntity;
import edu.cit.filiup.entity.UserEntity;
import edu.cit.filiup.service.CloudinaryService;
import edu.cit.filiup.service.StoryService;
import edu.cit.filiup.util.RequireRole;
import edu.cit.filiup.mapper.StoryMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import jakarta.validation.Valid;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/story")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"}, allowCredentials = "true")
public class StoryController {
    private final StoryService storyService;
    private final CloudinaryService cloudinaryService;
    private final StoryMapper storyMapper;

    @Autowired
    public StoryController(StoryService storyService, CloudinaryService cloudinaryService, StoryMapper storyMapper) {
        this.storyService = storyService;
        this.cloudinaryService = cloudinaryService;
        this.storyMapper = storyMapper;
    }

    // Create a new story
    @PostMapping("/create")
    @RequireRole({"TEACHER", "ADMIN"})
    public ResponseEntity<?> createStory(
            @Valid @RequestBody StoryCreateDTO storyCreateDTO,
            JwtAuthenticationToken jwtAuthToken) {
        try {
            // Extract user email and role from JWT token
            String userEmail = jwtAuthToken.getToken().getClaim("sub");
            String userRole = jwtAuthToken.getToken().getClaim("role");
            
            // Log incoming request
            System.out.println("Received story creation request:");
            System.out.println("Story DTO: " + storyCreateDTO);
            System.out.println("Title: " + storyCreateDTO.getTitle());
            System.out.println("Content length: " + (storyCreateDTO.getContent() != null ? storyCreateDTO.getContent().length() : "null"));
            System.out.println("Genre: " + storyCreateDTO.getGenre());
            System.out.println("ClassId: " + storyCreateDTO.getClassId());
            System.out.println("Cover URL: " + storyCreateDTO.getCoverPictureUrl());
            System.out.println("Cover Type: " + storyCreateDTO.getCoverPictureType());
            System.out.println("User Email: " + userEmail);
            System.out.println("User Role: " + userRole);

            // Validate user role
            if (!"TEACHER".equals(userRole) && !"ADMIN".equals(userRole)) {
                Map<String, String> errorResponse = new HashMap<>();
                errorResponse.put("error", "Forbidden");
                errorResponse.put("message", "Only teachers and admins can create stories");
                return ResponseEntity.status(403).body(errorResponse);
            }

            // Create the story using the email from JWT token
            StoryEntity createdStory = storyService.createStory(storyCreateDTO, userEmail);
            
            // Convert to response DTO
            StoryResponseDTO response = storyMapper.toResponseDTO(createdStory);
            
            // Log success
            System.out.println("Story created successfully: " + response);
            
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            // Log error
            System.err.println("Error creating story: " + e.getMessage());
            e.printStackTrace();
            
            // Return error response
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to create story");
            errorResponse.put("message", e.getMessage());
            
            // Return 403 if it's a permission error, 400 otherwise
            if (e.getMessage().contains("permission")) {
                return ResponseEntity.status(403).body(errorResponse);
            }
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }
    
    // Upload cover image without story ID (for initial story creation)
    @PostMapping("/upload-cover")
    @RequireRole({"TEACHER", "ADMIN"})
    public ResponseEntity<?> uploadCoverImage(
            @RequestParam("file") MultipartFile file,
            JwtAuthenticationToken jwtAuthToken) {
        try {
            // Extract user email and role from JWT token
            String userEmail = jwtAuthToken.getToken().getClaim("sub");
            String userRole = jwtAuthToken.getToken().getClaim("role");
            
            // Log the request
            System.out.println("Upload cover image request:");
            System.out.println("User Email: " + userEmail);
            System.out.println("User Role: " + userRole);
            
            // Upload the image to Cloudinary
            Map<String, String> uploadResult = cloudinaryService.uploadImage(file, "story-covers");
            
            // Return success response
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Cover image uploaded successfully");
            response.put("url", uploadResult.get("url"));
            
            return ResponseEntity.ok(response);
        } catch (IOException e) {
            // Log error
            System.err.println("Error uploading cover image: " + e.getMessage());
            e.printStackTrace();
            
            // Return error response
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to upload cover image");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }
    
    // Upload cover image for a story
    @PostMapping("/upload-cover/{storyId}")
    @RequireRole({"TEACHER", "ADMIN"})
    public ResponseEntity<?> uploadCoverImage(
            @PathVariable UUID storyId,
            @RequestParam("image") MultipartFile image,
            JwtAuthenticationToken jwtAuthToken) {
        try {
            // Extract user email and role from JWT token
            String userEmail = jwtAuthToken.getToken().getClaim("sub");
            String userRole = jwtAuthToken.getToken().getClaim("role");
            
            // Check if user has permission to update this story
            if (!storyService.hasPermission(storyId, userEmail, userRole)) {
                Map<String, String> errorResponse = new HashMap<>();
                errorResponse.put("error", "Forbidden");
                errorResponse.put("message", "You don't have permission to update this story");
                return ResponseEntity.status(403).body(errorResponse);
            }
            
            // Get the story
            Optional<StoryEntity> storyOpt = storyService.getStoryById(storyId);
            if (storyOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            
            StoryEntity story = storyOpt.get();
            
            // Upload the image to Cloudinary
            Map<String, String> uploadResult = cloudinaryService.uploadImage(image, "story-covers");
            
            // Update the story with the image URL
            story.setCoverPictureUrl(uploadResult.get("url"));
            story.setCoverPictureType(image.getContentType());
            
            // Save the updated story
            StoryEntity updatedStory = storyService.updateStory(storyId, story);
            
            // Return success response
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Cover image uploaded successfully");
            response.put("imageUrl", uploadResult.get("url"));
            response.put("story", updatedStory);
            
            return ResponseEntity.ok(response);
        } catch (IOException e) {
            // Log error
            System.err.println("Error uploading cover image: " + e.getMessage());
            e.printStackTrace();
            
            // Return error response
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to upload cover image");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        } catch (RuntimeException e) {
            // Log error
            System.err.println("Error updating story: " + e.getMessage());
            e.printStackTrace();
            
            // Return error response
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to update story");
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
                storyMap.put("coverPictureUrl", story.getCoverPictureUrl());
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
    public ResponseEntity<StoryEntity> getStoryById(@PathVariable UUID storyId) {
        return storyService.getStoryById(storyId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Get stories by class
    @GetMapping("/class/{classId}")
    public ResponseEntity<List<StoryEntity>> getStoriesByClass(@PathVariable UUID classId) {
        return ResponseEntity.ok(storyService.getStoriesByClass(classId));
    }

    // Get stories by teacher
    @GetMapping("/teacher/{userEmail}")
    public ResponseEntity<List<StoryEntity>> getStoriesByTeacher(@PathVariable String userEmail) {
        return ResponseEntity.ok(storyService.getStoriesByTeacher(userEmail));
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
                storyMap.put("coverPictureUrl", story.getCoverPictureUrl());
                
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
    @PutMapping("/update/{storyId}")
    @RequireRole({"TEACHER", "ADMIN"})
    public ResponseEntity<?> updateStory(
            @PathVariable UUID storyId,
            @RequestBody StoryEntity updatedStory,
            JwtAuthenticationToken jwtAuthToken) {
        try {
            // Extract user email from JWT token
            String userEmail = jwtAuthToken.getToken().getClaim("sub");
            
            // Get user role from JWT token
            String userRole = jwtAuthToken.getToken().getClaim("role");
            
            // Check if user has permission to update this story
            if (!storyService.hasPermission(storyId, userEmail, userRole)) {
                Map<String, String> errorResponse = new HashMap<>();
                errorResponse.put("error", "Forbidden");
                errorResponse.put("message", "You don't have permission to update this story");
                return ResponseEntity.status(403).body(errorResponse);
            }
            
            StoryEntity updated = storyService.updateStory(storyId, updatedStory);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Update failed");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    // Delete story (soft delete)
    @DeleteMapping("/delete/{storyId}")
    @RequireRole({"TEACHER", "ADMIN"})
    public ResponseEntity<?> deleteStory(
            @PathVariable UUID storyId,
            JwtAuthenticationToken jwtAuthToken) {
        try {
            // Extract user email from JWT token
            String userEmail = jwtAuthToken.getToken().getClaim("sub");
            
            // Get user role from JWT token
            String userRole = jwtAuthToken.getToken().getClaim("role");
            
            // Check if user has permission to delete this story
            if (!storyService.hasPermission(storyId, userEmail, userRole)) {
                Map<String, String> errorResponse = new HashMap<>();
                errorResponse.put("error", "Forbidden");
                errorResponse.put("message", "You don't have permission to delete this story");
                return ResponseEntity.status(403).body(errorResponse);
            }
            
            storyService.deleteStory(storyId);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Delete failed");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }
}
