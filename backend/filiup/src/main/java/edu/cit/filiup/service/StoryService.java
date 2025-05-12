package edu.cit.filiup.service;

import edu.cit.filiup.entity.StoryEntity;
import edu.cit.filiup.entity.UserEntity;
import edu.cit.filiup.entity.ClassEntity;
import edu.cit.filiup.repository.StoryRepository;
import edu.cit.filiup.repository.UserRepository;
import edu.cit.filiup.repository.ClassRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class StoryService {
    private final StoryRepository storyRepository;
    private final UserRepository userRepository;
    private final ClassRepository classRepository;

    @Autowired
    public StoryService(StoryRepository storyRepository, UserRepository userRepository, ClassRepository classRepository) {
        this.storyRepository = storyRepository;
        this.userRepository = userRepository;
        this.classRepository = classRepository;
    }

    @Transactional
    public StoryEntity createStory(StoryEntity storyEntity, int userId) {
        // Find the user (teacher)
        UserEntity teacher = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("Teacher not found"));

        // Find the class
        ClassEntity classEntity = classRepository.findById(storyEntity.getClassEntity().getClassId())
            .orElseThrow(() -> new RuntimeException("Class not found"));

        // Set the relationships
        storyEntity.setCreatedBy(teacher);
        storyEntity.setClassEntity(classEntity);
        storyEntity.setIsActive(true);
    
        // Save the story
        try {
            return storyRepository.save(storyEntity);
        } catch (Exception e) {
            throw new RuntimeException("Failed to create story: " + e.getMessage());
        }
    }

    public List<StoryEntity> getAllStories() {
        return storyRepository.findByIsActiveTrue();
    }

    public Optional<StoryEntity> getStoryById(Long storyId) {
        return storyRepository.findById(storyId)
                .filter(StoryEntity::getIsActive);
    }

    public List<StoryEntity> getStoriesByClass(Long classId) {
        return storyRepository.findByClassEntityClassIdAndIsActiveTrue(classId);
    }

    public List<StoryEntity> getStoriesByTeacher(int userId) {
        return storyRepository.findByCreatedByUserId(userId);
    }

    public List<StoryEntity> getStoriesByGenre(String genre) {
        return storyRepository.findByGenre(genre);
    }

    @Transactional
    public StoryEntity updateStory(Long storyId, StoryEntity updatedStory) {
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
                    return storyRepository.save(existingStory);
                })
                .orElseThrow(() -> new RuntimeException("Story not found"));
    }

    @Transactional
    public void deleteStory(Long storyId) {
        storyRepository.findById(storyId)
                .filter(StoryEntity::getIsActive)
                .ifPresent(story -> {
                    story.setIsActive(false);
                    storyRepository.save(story);
                });
    }
}
