package edu.cit.filiup.service;

import edu.cit.filiup.entity.StoryEntity;
import edu.cit.filiup.entity.UserEntity;
import edu.cit.filiup.repository.StoryRepository;
import edu.cit.filiup.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class StoryService {
    private final StoryRepository storyRepository;
    private final UserRepository userRepository;

    @Autowired
    public StoryService(StoryRepository storyRepository, UserRepository userRepository) {
        this.storyRepository = storyRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public StoryEntity createStory(StoryEntity storyEntity, int userId) {
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        if (!"TEACHER".equals(user.getUserRole())) {
            throw new RuntimeException("Only teachers can create stories");
        }

        storyEntity.setCreatedBy(user);
        storyEntity.setIsActive(true);
        return storyRepository.save(storyEntity);
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

    public List<StoryEntity> getStoriesByDifficulty(StoryEntity.DifficultyLevel difficultyLevel) {
        return storyRepository.findByDifficultyLevel(difficultyLevel);
    }

    @Transactional
    public StoryEntity updateStory(Long storyId, StoryEntity updatedStory) {
        return storyRepository.findById(storyId)
                .filter(StoryEntity::getIsActive)
                .map(existingStory -> {
                    existingStory.setTitle(updatedStory.getTitle());
                    existingStory.setContent(updatedStory.getContent());
                    existingStory.setDifficultyLevel(updatedStory.getDifficultyLevel());
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
