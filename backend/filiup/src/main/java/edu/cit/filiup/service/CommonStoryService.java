package edu.cit.filiup.service;

import edu.cit.filiup.entity.CommonStoryEntity;
import edu.cit.filiup.entity.UserEntity;
import edu.cit.filiup.repository.CommonStoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class CommonStoryService {

    @Autowired
    private CommonStoryRepository commonStoryRepository;

    public List<CommonStoryEntity> getAllCommonStories() {
        return commonStoryRepository.findAll();
    }

    public List<CommonStoryEntity> getActiveCommonStories() {
        return commonStoryRepository.findByIsActiveTrue();
    }

    public CommonStoryEntity getCommonStoryById(UUID storyId) {
        return commonStoryRepository.findById(storyId).orElse(null);
    }

    public CommonStoryEntity createCommonStory(CommonStoryEntity story, UserEntity createdBy) {
        story.setCreatedBy(createdBy);
        story.setCreatedAt(LocalDateTime.now());
        story.setIsActive(true);
        return commonStoryRepository.save(story);
    }

    public CommonStoryEntity updateCommonStory(UUID storyId, CommonStoryEntity updatedStory) {
        CommonStoryEntity existingStory = commonStoryRepository.findById(storyId).orElse(null);
        if (existingStory == null) {
            return null;
        }

        if (updatedStory.getTitle() != null) {
            existingStory.setTitle(updatedStory.getTitle());
        }
        if (updatedStory.getContent() != null) {
            existingStory.setContent(updatedStory.getContent());
        }
        if (updatedStory.getGenre() != null) {
            existingStory.setGenre(updatedStory.getGenre());
        }
        if (updatedStory.getFictionType() != null) {
            existingStory.setFictionType(updatedStory.getFictionType());
        }
        if (updatedStory.getCoverPictureUrl() != null) {
            existingStory.setCoverPictureUrl(updatedStory.getCoverPictureUrl());
        }
        if (updatedStory.getCoverPictureType() != null) {
            existingStory.setCoverPictureType(updatedStory.getCoverPictureType());
        }
        if (updatedStory.getCoverPicture() != null) {
            existingStory.setCoverPicture(updatedStory.getCoverPicture());
        }
        if (updatedStory.getIsActive() != null) {
            existingStory.setIsActive(updatedStory.getIsActive());
        }

        return commonStoryRepository.save(existingStory);
    }

    public boolean deleteCommonStory(UUID storyId) {
        CommonStoryEntity story = commonStoryRepository.findById(storyId).orElse(null);
        if (story == null) {
            return false;
        }
        commonStoryRepository.delete(story);
        return true;
    }

    public boolean toggleCommonStoryStatus(UUID storyId) {
        CommonStoryEntity story = commonStoryRepository.findById(storyId).orElse(null);
        if (story == null) {
            return false;
        }
        story.setIsActive(!story.getIsActive());
        commonStoryRepository.save(story);
        return true;
    }

    public List<CommonStoryEntity> getCommonStoriesByGenre(String genre) {
        return commonStoryRepository.findByGenreAndIsActiveTrue(genre);
    }

    public List<CommonStoryEntity> getCommonStoriesByFictionType(String fictionType) {
        return commonStoryRepository.findByFictionTypeAndIsActiveTrue(fictionType);
    }
} 