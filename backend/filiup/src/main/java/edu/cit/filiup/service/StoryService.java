package edu.cit.filiup.service;

import edu.cit.filiup.dto.StoryCreateDTO;
import edu.cit.filiup.entity.StoryEntity;
import edu.cit.filiup.entity.UserEntity;
import edu.cit.filiup.entity.ClassEntity;
import edu.cit.filiup.repository.StoryRepository;
import edu.cit.filiup.repository.UserRepository;
import edu.cit.filiup.repository.ClassRepository;
import edu.cit.filiup.mapper.StoryMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class StoryService {
    private final StoryRepository storyRepository;
    private final UserRepository userRepository;
    private final ClassRepository classRepository;
    private final StoryMapper storyMapper;

    @Autowired
    public StoryService(StoryRepository storyRepository, UserRepository userRepository, ClassRepository classRepository, StoryMapper storyMapper) {
        this.storyRepository = storyRepository;
        this.userRepository = userRepository;
        this.classRepository = classRepository;
        this.storyMapper = storyMapper;
    }

    @Transactional
    public StoryEntity createStory(StoryCreateDTO storyCreateDTO, String userEmail) {
        // Get the user who is creating the story
        UserEntity user = userRepository.findByUserEmail(userEmail);
        if (user == null) {
            throw new RuntimeException("User not found");
        }

        // Get the class for the story
        ClassEntity classEntity = classRepository.findById(storyCreateDTO.getClassId())
            .orElseThrow(() -> new RuntimeException("Class not found"));

        // Verify that the user has permission to create stories in this class
        if (!classEntity.getTeacher().getUserId().equals(user.getUserId())) {
            throw new RuntimeException("User does not have permission to create stories in this class");
        }

        // Convert DTO to entity
        StoryEntity storyEntity = storyMapper.toEntity(storyCreateDTO, classEntity, user);

        // Save and return the story
        return storyRepository.save(storyEntity);
    }

    public List<StoryEntity> getAllStories() {
        return storyRepository.findByIsActiveTrue();
    }

    public Optional<StoryEntity> getStoryById(UUID storyId) {
        return storyRepository.findById(storyId)
                .filter(StoryEntity::getIsActive);
    }

    public List<StoryEntity> getStoriesByClass(UUID classId) {
        return storyRepository.findByClassEntityClassIdAndIsActiveTrue(classId);
    }

    public List<StoryEntity> getStoriesByTeacher(UUID userId) {
        return storyRepository.findByCreatedByUserId(userId);
    }
    
    public List<StoryEntity> getStoriesByTeacher(String userEmail) {
        UserEntity teacher = userRepository.findByUserEmail(userEmail);
        if (teacher == null) {
            throw new RuntimeException("Teacher not found with email: " + userEmail);
        }
        return storyRepository.findByCreatedByUserId(teacher.getUserId());
    }

    public List<StoryEntity> getStoriesByGenre(String genre) {
        return storyRepository.findByGenre(genre);
    }

    @Transactional
    public StoryEntity updateStory(UUID storyId, StoryEntity updatedStory) {
        return storyRepository.findById(storyId)
                .filter(StoryEntity::getIsActive)
                .map(existingStory -> {
                    existingStory.setTitle(updatedStory.getTitle());
                    existingStory.setContent(updatedStory.getContent());
                    existingStory.setGenre(updatedStory.getGenre());
                    // Update cover picture if provided
                    if (updatedStory.getCoverPicture() != null) {
                        existingStory.setCoverPicture(updatedStory.getCoverPicture());
                        existingStory.setCoverPictureType(updatedStory.getCoverPictureType());
                    }
                    // Update cover URL if provided
                    if (updatedStory.getCoverPictureUrl() != null) {
                        existingStory.setCoverPictureUrl(updatedStory.getCoverPictureUrl());
                    }
                    return storyRepository.save(existingStory);
                })
                .orElseThrow(() -> new RuntimeException("Story not found"));
    }

    @Transactional
    public void deleteStory(UUID storyId) {
        storyRepository.findById(storyId)
                .ifPresent(story -> {
                    storyRepository.delete(story);
                });
    }
    
    /**
     * Checks if a user has permission to modify a story
     * @param storyId the story ID
     * @param userEmail the user's email
     * @param userRole the user's role
     * @return true if the user has permission, false otherwise
     */
    public boolean hasPermission(UUID storyId, String userEmail, String userRole) {
        // Admins have permission to modify any story
        if ("ADMIN".equals(userRole)) {
            return true;
        }
        
        // For teachers, check if they are the creator of the story
        if ("TEACHER".equals(userRole)) {
            Optional<StoryEntity> storyOpt = storyRepository.findById(storyId);
            if (storyOpt.isPresent()) {
                UserEntity creator = storyOpt.get().getCreatedBy();
                if (creator != null && userEmail.equals(creator.getUserEmail())) {
                    return true;
                }
            }
        }
        
        return false;
    }
}
