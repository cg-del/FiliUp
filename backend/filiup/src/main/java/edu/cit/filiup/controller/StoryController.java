package edu.cit.filiup.controller;

import edu.cit.filiup.dto.StoryCreateDTO;
import edu.cit.filiup.dto.StoryResponseDTO;
import edu.cit.filiup.entity.ClassEntity;
import edu.cit.filiup.entity.StoryEntity;
import edu.cit.filiup.entity.UserEntity;
import edu.cit.filiup.service.AIService;
import edu.cit.filiup.service.CloudinaryService;
import edu.cit.filiup.service.StoryService;
import edu.cit.filiup.util.RequireRole;
import edu.cit.filiup.mapper.StoryMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/story")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"}, allowCredentials = "true")
public class StoryController {
    private final StoryService storyService;
    private final AIService aiService;
    private final CloudinaryService cloudinaryService;
    private final StoryMapper storyMapper;

    @Autowired
    public StoryController(StoryService storyService, AIService aiService, CloudinaryService cloudinaryService, StoryMapper storyMapper) {
        this.storyService = storyService;
        this.aiService = aiService;
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
            // Extract user email from JWT token
            String userEmail = jwtAuthToken.getToken().getClaim("sub");
            
            // Log incoming request
            System.out.println("Received story creation request:");
            System.out.println("Story DTO: " + storyCreateDTO);
            System.out.println("User Email: " + userEmail);

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
            @PathVariable Long storyId,
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
    
    // Generate a story using AI and create it
    @PostMapping("/generate")
    @RequireRole({"TEACHER", "ADMIN"})
    public ResponseEntity<?> generateStory(
            @RequestBody StoryCreateDTO request,
            JwtAuthenticationToken jwtAuthToken) {
        try {
            // Extract user email from JWT token
            String userEmail = jwtAuthToken.getToken().getClaim("sub");
            
            // Log incoming request
            System.out.println("Received AI story generation request:");
            System.out.println("Request: " + request);
            System.out.println("User Email: " + userEmail);
            
            // Validate required fields
            if (request.getPrompt() == null || request.getPrompt().trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Prompt is required");
            }
            if (request.getTitle() == null || request.getTitle().trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Title is required");
            }
            if (request.getGenre() == null || request.getGenre().trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Genre is required");
            }
            if (request.getClassId() == null) {
                return ResponseEntity.badRequest().body("Class ID is required");
            }
            
            // Generate story content using AI
            String generatedContent = aiService.generateStory(request.getPrompt());
            
            // Create a new story entity with the generated content
            StoryEntity storyEntity = new StoryEntity();
            storyEntity.setTitle(request.getTitle());
            storyEntity.setContent(generatedContent);
            storyEntity.setGenre(request.getGenre());
            
            // Set class entity
            ClassEntity classEntity = new ClassEntity();
            classEntity.setClassId(request.getClassId());
            storyEntity.setClassEntity(classEntity);
            
            // Create the story
            StoryEntity createdStory = storyService.createStory(storyEntity, userEmail);
            
            // Log success
            System.out.println("AI-generated story created successfully: " + createdStory);
            
            return ResponseEntity.ok(createdStory);
        } catch (RuntimeException e) {
            // Log error
            System.err.println("Error generating story: " + e.getMessage());
            e.printStackTrace();
            
            // Return error response
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to generate story");
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
            @PathVariable Long storyId,
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
            @PathVariable Long storyId,
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
