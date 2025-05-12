package edu.cit.filiup.service;

import edu.cit.filiup.entity.CommonStoryEntity;
import edu.cit.filiup.repository.CommonStoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class CommonStoryService {

    @Autowired
    private CommonStoryRepository commonStoryRepository;

    public List<CommonStoryEntity> getAllStories() {
        return commonStoryRepository.findAll();
    }

    public Optional<CommonStoryEntity> getStoryById(Long id) {
        return commonStoryRepository.findById(id);
    }

    public CommonStoryEntity saveStory(CommonStoryEntity story) {
        return commonStoryRepository.save(story);
    }

    public void deleteStory(Long id) {
        commonStoryRepository.deleteById(id);
    }
} 