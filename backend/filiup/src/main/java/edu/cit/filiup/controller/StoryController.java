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
        
        String userEmail = null;
        String userRole = null;
        
        try {
            // Extract user email and role from JWT token with improved error handling
            userEmail = extractUserEmail(jwtAuthToken);
            userRole = jwtAuthToken.getToken().getClaim("role");
            
            // Validate user authentication
            if (userEmail == null || userEmail.trim().isEmpty()) {
                return createErrorResponse(401, "Unauthorized", "Invalid or missing user authentication");
            }
            
            // Validate user role
            if (!"TEACHER".equals(userRole) && !"ADMIN".equals(userRole)) {
                return createErrorResponse(403, "Forbidden", "Only teachers and admins can create stories");
            }
            
            // Validate story data
            ResponseEntity<?> validationResult = validateStoryData(storyCreateDTO);
            if (validationResult != null) {
                return validationResult;
            }
            
            // Log request details (reduced logging for better performance)
            System.out.println("Creating story: title='" + storyCreateDTO.getTitle() + 
                             "', classId=" + storyCreateDTO.getClassId() + 
                             ", userEmail=" + userEmail);

            // Create the story using the email from JWT token
            StoryEntity createdStory = storyService.createStory(storyCreateDTO, userEmail);
            
            // Validate story creation result
            if (createdStory == null) {
                return createErrorResponse(500, "Creation Failed", "Story creation returned null result");
            }
            
            // Convert to response DTO with error handling
            StoryResponseDTO response = storyMapper.toResponseDTO(createdStory);
            if (response == null) {
                return createErrorResponse(500, "Mapping Failed", "Failed to convert story to response format");
            }
            
            System.out.println("Story created successfully with ID: " + response.getStoryId());
            return ResponseEntity.ok(response);
            
        } catch (IllegalArgumentException e) {
            System.err.println("Validation error creating story: " + e.getMessage());
            return createErrorResponse(400, "Validation Error", e.getMessage());
            
        } catch (SecurityException e) {
            System.err.println("Security error creating story: " + e.getMessage());
            return createErrorResponse(403, "Access Denied", e.getMessage());
            
        } catch (RuntimeException e) {
            System.err.println("Runtime error creating story for user " + userEmail + ": " + e.getMessage());
            e.printStackTrace();
            
            // Check for specific error types
            String errorMessage = e.getMessage();
            if (errorMessage != null) {
                if (errorMessage.contains("permission") || errorMessage.contains("unauthorized")) {
                    return createErrorResponse(403, "Permission Denied", errorMessage);
                } else if (errorMessage.contains("not found") || errorMessage.contains("does not exist")) {
                    return createErrorResponse(404, "Resource Not Found", errorMessage);
                } else if (errorMessage.contains("duplicate") || errorMessage.contains("already exists")) {
                    return createErrorResponse(409, "Conflict", errorMessage);
                }
            }
            
            return createErrorResponse(500, "Internal Server Error", 
                "An unexpected error occurred while creating the story. Please try again.");
                
        } catch (Exception e) {
            System.err.println("Unexpected error creating story: " + e.getClass().getSimpleName() + " - " + e.getMessage());
            e.printStackTrace();
            return createErrorResponse(500, "System Error", 
                "A system error occurred. Please contact support if this persists.");
        }
    }
    
    /**
     * Extract user email from JWT token with fallback logic
     */
    private String extractUserEmail(JwtAuthenticationToken jwtAuthToken) {
        if (jwtAuthToken == null || jwtAuthToken.getToken() == null) {
            return null;
        }
        
        // Try 'sub' claim first
        String userEmail = jwtAuthToken.getToken().getClaim("sub");
        
        // Fallback to 'email' claim if 'sub' is not an email
        if (userEmail == null || !userEmail.contains("@")) {
            String emailClaim = jwtAuthToken.getToken().getClaim("email");
            if (emailClaim != null && emailClaim.contains("@")) {
                userEmail = emailClaim;
            }
        }
        
        // Final fallback to token subject
        if (userEmail == null || !userEmail.contains("@")) {
            String subject = jwtAuthToken.getToken().getSubject();
            if (subject != null && subject.contains("@")) {
                userEmail = subject;
            }
        }
        
        return userEmail;
    }
    
    /**
     * Validate story creation data
     */
    private ResponseEntity<?> validateStoryData(StoryCreateDTO storyCreateDTO) {
        if (storyCreateDTO == null) {
            return createErrorResponse(400, "Bad Request", "Story data is required");
        }
        
        if (storyCreateDTO.getTitle() == null || storyCreateDTO.getTitle().trim().isEmpty()) {
            return createErrorResponse(400, "Validation Error", "Story title is required");
        }
        
        if (storyCreateDTO.getTitle().length() > 255) {
            return createErrorResponse(400, "Validation Error", "Story title cannot exceed 255 characters");
        }
        
        if (storyCreateDTO.getContent() == null || storyCreateDTO.getContent().trim().isEmpty()) {
            return createErrorResponse(400, "Validation Error", "Story content is required");
        }
        
        if (storyCreateDTO.getContent().length() > 100000) {
            return createErrorResponse(400, "Validation Error", "Story content cannot exceed 100,000 characters");
        }
        
        if (storyCreateDTO.getGenre() == null || storyCreateDTO.getGenre().trim().isEmpty()) {
            return createErrorResponse(400, "Validation Error", "Story genre is required");
        }
        
        if (storyCreateDTO.getClassId() == null) {
            return createErrorResponse(400, "Validation Error", "Class ID is required");
        }
        
        return null; // No validation errors
    }
    
    /**
     * Create standardized error response
     */
    private ResponseEntity<?> createErrorResponse(int statusCode, String error, String message) {
        Map<String, Object> errorResponse = new HashMap<>();
        errorResponse.put("timestamp", java.time.Instant.now().toString());
        errorResponse.put("status", statusCode);
        errorResponse.put("error", error);
        errorResponse.put("message", message);
        errorResponse.put("path", "/api/story/create");
        
        return ResponseEntity.status(statusCode).body(errorResponse);
    }
    
    // Upload cover image without story ID (for initial story creation)
    @PostMapping(value = "/upload-cover", consumes = "multipart/form-data")
    @RequireRole({"TEACHER", "ADMIN"})
    public ResponseEntity<?> uploadCoverImage(
            @RequestParam("file") MultipartFile file,
            JwtAuthenticationToken jwtAuthToken) {
        try {
            // Extract user email and role from JWT token
            String userEmail = jwtAuthToken.getToken().getClaim("sub");
            String userRole = jwtAuthToken.getToken().getClaim("role");
            
            // Fallback to other email claims if 'sub' is not an email
            if (userEmail == null || !userEmail.contains("@")) {
                String emailClaim = jwtAuthToken.getToken().getClaim("email");
                if (emailClaim != null && emailClaim.contains("@")) {
                    userEmail = emailClaim;
                    System.out.println("Using 'email' claim instead of 'sub': " + userEmail);
                }
            }
            
            // Log the request
            System.out.println("Upload cover image request:");
            System.out.println("User Email: " + userEmail);
            System.out.println("User Role: " + userRole);
            System.out.println("File name: " + file.getOriginalFilename());
            System.out.println("File size: " + file.getSize());
            System.out.println("Content type: " + file.getContentType());
            
            // Validate file type
            String contentType = file.getContentType();
            if (contentType == null || !(contentType.equals("image/jpeg") || 
                                         contentType.equals("image/png") || 
                                         contentType.equals("image/gif"))) {
                Map<String, String> errorResponse = new HashMap<>();
                errorResponse.put("error", "Invalid file type");
                errorResponse.put("message", "Only JPG, PNG, and GIF files are allowed");
                return ResponseEntity.badRequest().body(errorResponse);
            }
            
            // Validate file size (5MB = 5 * 1024 * 1024 bytes)
            if (file.getSize() > 5 * 1024 * 1024) {
                Map<String, String> errorResponse = new HashMap<>();
                errorResponse.put("error", "File too large");
                errorResponse.put("message", "Maximum file size is 5MB");
                return ResponseEntity.badRequest().body(errorResponse);
            }
            
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
    @PostMapping(value = "/upload-cover/{storyId}", consumes = "multipart/form-data")
    @RequireRole({"TEACHER", "ADMIN"})
    public ResponseEntity<?> uploadCoverImage(
            @PathVariable UUID storyId,
            @RequestParam("image") MultipartFile image,
            JwtAuthenticationToken jwtAuthToken) {
        try {
            // Extract user email and role from JWT token
            String userEmail = jwtAuthToken.getToken().getClaim("sub");
            String userRole = jwtAuthToken.getToken().getClaim("role");
            
            // Fallback to other email claims if 'sub' is not an email
            if (userEmail == null || !userEmail.contains("@")) {
                String emailClaim = jwtAuthToken.getToken().getClaim("email");
                if (emailClaim != null && emailClaim.contains("@")) {
                    userEmail = emailClaim;
                    System.out.println("Using 'email' claim instead of 'sub': " + userEmail);
                }
            }
            
            // Log the request
            System.out.println("Upload cover image request for story " + storyId + ":");
            System.out.println("User Email: " + userEmail);
            System.out.println("User Role: " + userRole);
            System.out.println("File name: " + image.getOriginalFilename());
            System.out.println("File size: " + image.getSize());
            System.out.println("Content type: " + image.getContentType());
            
            // Validate file type
            String contentType = image.getContentType();
            if (contentType == null || !(contentType.equals("image/jpeg") || 
                                         contentType.equals("image/png") || 
                                         contentType.equals("image/gif"))) {
                Map<String, String> errorResponse = new HashMap<>();
                errorResponse.put("error", "Invalid file type");
                errorResponse.put("message", "Only JPG, PNG, and GIF files are allowed");
                return ResponseEntity.badRequest().body(errorResponse);
            }
            
            // Validate file size (5MB = 5 * 1024 * 1024 bytes)
            if (image.getSize() > 5 * 1024 * 1024) {
                Map<String, String> errorResponse = new HashMap<>();
                errorResponse.put("error", "File too large");
                errorResponse.put("message", "Maximum file size is 5MB");
                return ResponseEntity.badRequest().body(errorResponse);
            }
            
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
                storyMap.put("fictionType", story.getFictionType());
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
    @RequireRole({"STUDENT", "TEACHER", "ADMIN"})
    public ResponseEntity<?> getStoriesByClass(
            @PathVariable UUID classId,
            JwtAuthenticationToken jwtAuthToken) {
        try {
            // Extract user email from JWT token
            String userEmail = jwtAuthToken.getToken().getClaim("sub");
            String userRole = jwtAuthToken.getToken().getClaim("role");
            
            // Fallback to other email claims if 'sub' is not an email
            if (userEmail == null || !userEmail.contains("@")) {
                String emailClaim = jwtAuthToken.getToken().getClaim("email");
                if (emailClaim != null && emailClaim.contains("@")) {
                    userEmail = emailClaim;
                    System.out.println("Using 'email' claim instead of 'sub': " + userEmail);
                }
            }
            
            if (userEmail == null) {
                Map<String, String> errorResponse = new HashMap<>();
                errorResponse.put("error", "User email not found in token");
                return ResponseEntity.badRequest().body(errorResponse);
            }
            
            // Log the request
            System.out.println("Get stories by class request:");
            System.out.println("User Email: " + userEmail);
            System.out.println("User Role: " + userRole);
            System.out.println("Class ID: " + classId);
            
            // Get stories by class - the service should handle access control
            List<StoryEntity> stories = storyService.getStoriesByClass(classId);
            return ResponseEntity.ok(stories);
        } catch (Exception e) {
            System.err.println("Error getting stories by class: " + e.getMessage());
            e.printStackTrace();
            
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to get stories");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    // Get stories by teacher
    @GetMapping("/teacher")
    @RequireRole({"TEACHER", "ADMIN"})
    public ResponseEntity<?> getStoriesByTeacher(JwtAuthenticationToken jwtAuthToken) {
        try {
            // Extract user email from JWT token
            String userEmail = jwtAuthToken.getToken().getClaim("sub");
            
            // Fallback to other email claims if 'sub' is not an email
            if (userEmail == null || !userEmail.contains("@")) {
                String emailClaim = jwtAuthToken.getToken().getClaim("email");
                if (emailClaim != null && emailClaim.contains("@")) {
                    userEmail = emailClaim;
                    System.out.println("Using 'email' claim instead of 'sub': " + userEmail);
                }
            }
            
            if (userEmail == null) {
                Map<String, String> errorResponse = new HashMap<>();
                errorResponse.put("error", "User email not found in token");
                return ResponseEntity.badRequest().body(errorResponse);
            }
            
            // Log the request
            System.out.println("Get stories by teacher request:");
            System.out.println("User Email: " + userEmail);
            
            List<StoryEntity> stories = storyService.getStoriesByTeacher(userEmail);
            return ResponseEntity.ok(stories);
        } catch (Exception e) {
            System.err.println("Error getting stories by teacher: " + e.getMessage());
            e.printStackTrace();
            
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to get stories");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    // Get stories by genre
    @GetMapping("/genre/{genre}")
    public ResponseEntity<List<StoryEntity>> getStoriesByGenre(@PathVariable String genre) {
        return ResponseEntity.ok(storyService.getStoriesByGenre(genre));
    }

    // Get stories by fiction type
    @GetMapping("/fiction-type/{fictionType}")
    public ResponseEntity<List<StoryEntity>> getStoriesByFictionType(@PathVariable String fictionType) {
        return ResponseEntity.ok(storyService.getStoriesByFictionType(fictionType));
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
                storyMap.put("fictionType", story.getFictionType());
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
    @PutMapping("/{storyId}")
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
    @DeleteMapping("/{storyId}")
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

    // Debug endpoint to help troubleshoot user/JWT issues
    @GetMapping("/debug/user-info")
    public ResponseEntity<?> debugUserInfo(JwtAuthenticationToken jwtAuthToken) {
        try {
            Map<String, Object> debugInfo = new HashMap<>();
            
            // JWT Claims
            String userEmail = jwtAuthToken.getToken().getClaim("sub");
            String userRole = jwtAuthToken.getToken().getClaim("role");
            String emailClaim = jwtAuthToken.getToken().getClaim("email");
            String usernameClaim = jwtAuthToken.getToken().getClaim("username");
            
            debugInfo.put("jwtClaims", jwtAuthToken.getToken().getClaims());
            debugInfo.put("subClaim", userEmail);
            debugInfo.put("roleClaim", userRole);
            debugInfo.put("emailClaim", emailClaim);
            debugInfo.put("usernameClaim", usernameClaim);
            
            // User lookup attempts
            Map<String, Object> userLookups = new HashMap<>();
            
            if (userEmail != null) {
                try {
                    StoryEntity testStory = storyService.getAllStories().stream().findFirst().orElse(null);
                    userLookups.put("foundUserBySubClaim", storyService.getStoriesByTeacher(userEmail).size() + " stories found");
                } catch (Exception e) {
                    userLookups.put("foundUserBySubClaim", "Error: " + e.getMessage());
                }
            }
            
            if (emailClaim != null) {
                try {
                    userLookups.put("foundUserByEmailClaim", storyService.getStoriesByTeacher(emailClaim).size() + " stories found");
                } catch (Exception e) {
                    userLookups.put("foundUserByEmailClaim", "Error: " + e.getMessage());
                }
            }
            
            debugInfo.put("userLookupResults", userLookups);
            
            return ResponseEntity.ok(debugInfo);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Debug failed");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }
}
