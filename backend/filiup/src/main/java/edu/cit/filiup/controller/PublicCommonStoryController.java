package edu.cit.filiup.controller;

import edu.cit.filiup.entity.CommonStoryEntity;
import edu.cit.filiup.service.CommonStoryService;
import edu.cit.filiup.util.ResponseUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/public/common-stories")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"}, allowCredentials = "true")
public class PublicCommonStoryController {

    @Autowired
    private CommonStoryService commonStoryService;

    @GetMapping
    public ResponseEntity<?> getAllActiveCommonStories(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String genre,
            @RequestParam(required = false) String fictionType) {
        try {
            List<CommonStoryEntity> stories;
            
            if (genre != null) {
                stories = commonStoryService.getCommonStoriesByGenre(genre);
            } else if (fictionType != null) {
                stories = commonStoryService.getCommonStoriesByFictionType(fictionType);
            } else {
                stories = commonStoryService.getActiveCommonStories();
            }

            // Transform stories to include necessary user information (public view)
            List<Map<String, Object>> transformedStories = stories.stream()
                .map(story -> {
                    Map<String, Object> storyMap = new HashMap<>();
                    storyMap.put("storyId", story.getStoryId());
                    storyMap.put("title", story.getTitle());
                    storyMap.put("content", story.getContent());
                    storyMap.put("genre", story.getGenre());
                    storyMap.put("fictionType", story.getFictionType());
                    storyMap.put("createdAt", story.getCreatedAt());
                    storyMap.put("coverPictureUrl", story.getCoverPictureUrl());
                    
                    // Add simplified user information for public view
                            if (story.getCreatedBy() != null) {
            Map<String, Object> createdBy = new HashMap<>();
            // Display "FiliUp" for system user, otherwise show actual username
            String displayName = "FiliUp".equals(story.getCreatedBy().getUserName()) ? 
                               "FiliUp" : story.getCreatedBy().getUserName();
            createdBy.put("userName", displayName);
            storyMap.put("createdBy", createdBy);
        } else {
            Map<String, Object> createdBy = new HashMap<>();
            createdBy.put("userName", "FiliUp");
            storyMap.put("createdBy", createdBy);
        }
                    
                    return storyMap;
                })
                .collect(Collectors.toList());

            Map<String, Object> response = new HashMap<>();
            response.put("stories", transformedStories);
            response.put("totalStories", transformedStories.size());
            response.put("currentPage", page);

            return ResponseUtil.success("Common stories retrieved successfully", response);
        } catch (Exception e) {
            return ResponseUtil.serverError("Failed to retrieve common stories: " + e.getMessage());
        }
    }

    @GetMapping("/{storyId}")
    public ResponseEntity<?> getCommonStoryById(@PathVariable UUID storyId) {
        try {
            CommonStoryEntity story = commonStoryService.getCommonStoryById(storyId);
            if (story == null || !story.getIsActive()) {
                return ResponseUtil.notFound("Common story not found or not active");
            }

            // Transform story for public view
            Map<String, Object> storyMap = new HashMap<>();
            storyMap.put("storyId", story.getStoryId());
            storyMap.put("title", story.getTitle());
            storyMap.put("content", story.getContent());
            storyMap.put("genre", story.getGenre());
            storyMap.put("fictionType", story.getFictionType());
            storyMap.put("createdAt", story.getCreatedAt());
            storyMap.put("coverPictureUrl", story.getCoverPictureUrl());
            
            // Add simplified user information for public view
            if (story.getCreatedBy() != null) {
                Map<String, Object> createdBy = new HashMap<>();
                // Display "FiliUp" for system user, otherwise show actual username
                String displayName = "FiliUp".equals(story.getCreatedBy().getUserName()) ? 
                                   "FiliUp" : story.getCreatedBy().getUserName();
                createdBy.put("userName", displayName);
                storyMap.put("createdBy", createdBy);
            } else {
                Map<String, Object> createdBy = new HashMap<>();
                createdBy.put("userName", "FiliUp");
                storyMap.put("createdBy", createdBy);
            }

            return ResponseUtil.success("Common story retrieved successfully", storyMap);
        } catch (Exception e) {
            return ResponseUtil.serverError("Failed to retrieve common story: " + e.getMessage());
        }
    }

    @GetMapping("/genres")
    public ResponseEntity<?> getAvailableGenres() {
        try {
            List<CommonStoryEntity> stories = commonStoryService.getActiveCommonStories();
            Set<String> genres = stories.stream()
                .map(CommonStoryEntity::getGenre)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

            return ResponseUtil.success("Available genres retrieved successfully", genres);
        } catch (Exception e) {
            return ResponseUtil.serverError("Failed to retrieve genres: " + e.getMessage());
        }
    }

    @GetMapping("/fiction-types")
    public ResponseEntity<?> getAvailableFictionTypes() {
        try {
            List<CommonStoryEntity> stories = commonStoryService.getActiveCommonStories();
            Set<String> fictionTypes = stories.stream()
                .map(CommonStoryEntity::getFictionType)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

            return ResponseUtil.success("Available fiction types retrieved successfully", fictionTypes);
        } catch (Exception e) {
            return ResponseUtil.serverError("Failed to retrieve fiction types: " + e.getMessage());
        }
    }
} 