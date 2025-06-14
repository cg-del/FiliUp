package edu.cit.filiup.controller;

import edu.cit.filiup.entity.CommonStoryEntity;
import edu.cit.filiup.entity.UserEntity;
import edu.cit.filiup.service.ClassService;
import edu.cit.filiup.service.UserService;
import edu.cit.filiup.util.RequireRole;
import edu.cit.filiup.util.ResponseUtil;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.UUID;

@RestController
@RequestMapping("/api/classes")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"}, allowCredentials = "true")
public class ClassCommonStoryController {

    @Autowired
    private ClassService classService;

    @Autowired
    private UserService userService;

    /**
     * Get all common stories added to a specific class
     * 
     * @param classId The ID of the class
     * @return List of common stories
     */
    @GetMapping("/{classId}/common-stories")
    public ResponseEntity<?> getClassCommonStories(@PathVariable UUID classId) {
        try {
            List<CommonStoryEntity> stories = classService.getClassCommonStories(classId);
            return ResponseUtil.success("Stories retrieved successfully", stories);
        } catch (EntityNotFoundException e) {
            return ResponseUtil.notFound(e.getMessage());
        } catch (Exception e) {
            return ResponseUtil.serverError("Failed to retrieve stories: " + e.getMessage());
        }
    }

    /**
     * Add a common story to a class
     * 
     * @param classId The ID of the class
     * @param storyId The ID of the common story to add
     * @param authentication JWT token containing the authenticated user
     * @return Success or error response
     */
    @PostMapping("/{classId}/common-stories/{storyId}")
    @RequireRole({"TEACHER", "ADMIN"})
    public ResponseEntity<?> addCommonStoryToClass(
            @PathVariable UUID classId,
            @PathVariable UUID storyId) {
        try {
            // Get the authenticated user from SecurityContextHolder
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            
            if (authentication == null) {
                return ResponseUtil.unauthorized("No authentication found");
            }
            
            String userIdentifier = authentication.getName();
            System.out.println("User identifier: " + userIdentifier);
            
            // Try to get user by email first
            UserEntity user = userService.getUserByEmail(userIdentifier);
            
            // If not found by email, try by username
            if (user == null) {
                user = userService.getUserByUsername(userIdentifier);
                System.out.println("User found by username: " + (user != null));
            } else {
                System.out.println("User found by email: " + (user != null));
            }
            
            if (user == null) {
                Map<String, Object> debugInfo = new HashMap<>();
                debugInfo.put("userIdentifier", userIdentifier);
                debugInfo.put("authenticationType", authentication.getClass().getName());
                debugInfo.put("authorities", authentication.getAuthorities());
                
                // Log debug info instead of passing it to the response
                System.out.println("DEBUG AUTH INFO: " + debugInfo);
                
                return ResponseUtil.unauthorized("User not found");
            }
            
            // Verify user is a teacher or admin
            if (!"TEACHER".equals(user.getUserRole()) && !"ADMIN".equals(user.getUserRole())) {
                return ResponseUtil.forbidden("Only teachers and admins can add stories to classes");
            }
            
            classService.addCommonStoryToClass(classId, storyId, user.getUserId());
            return ResponseUtil.success("Story added to class successfully", null);
        } catch (EntityNotFoundException e) {
            return ResponseUtil.notFound(e.getMessage());
        } catch (RuntimeException e) {
            return ResponseUtil.badRequest(e.getMessage());
        } catch (Exception e) {
            e.printStackTrace(); // Add this for debugging
            return ResponseUtil.serverError("Failed to add story to class: " + e.getMessage());
        }
    }

    /**
     * Remove a common story from a class
     * 
     * @param classId The ID of the class
     * @param storyId The ID of the common story to remove
     * @return Success or error response
     */
    @DeleteMapping("/{classId}/common-stories/{storyId}")
    @RequireRole({"TEACHER", "ADMIN"})
    public ResponseEntity<?> removeCommonStoryFromClass(
            @PathVariable UUID classId,
            @PathVariable UUID storyId) {
        try {
            // Get the authenticated user from SecurityContextHolder
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            
            if (authentication == null) {
                return ResponseUtil.unauthorized("No authentication found");
            }
            
            String userIdentifier = authentication.getName();
            
            // Try to get user by email first
            UserEntity user = userService.getUserByEmail(userIdentifier);
            
            // If not found by email, try by username
            if (user == null) {
                user = userService.getUserByUsername(userIdentifier);
            }
            
            if (user == null) {
                return ResponseUtil.unauthorized("User not found");
            }
            
            // Verify user is a teacher or admin
            if (!"TEACHER".equals(user.getUserRole()) && !"ADMIN".equals(user.getUserRole())) {
                return ResponseUtil.forbidden("Only teachers and admins can remove stories from classes");
            }
            
            classService.removeCommonStoryFromClass(classId, storyId, user.getUserId());
            return ResponseUtil.success("Story removed from class successfully", null);
        } catch (EntityNotFoundException e) {
            return ResponseUtil.notFound(e.getMessage());
        } catch (RuntimeException e) {
            return ResponseUtil.badRequest(e.getMessage());
        } catch (Exception e) {
            return ResponseUtil.serverError("Failed to remove story from class: " + e.getMessage());
        }
    }
} 