package edu.cit.filiup.controller;

import edu.cit.filiup.entity.CommonStoryEntity;
import edu.cit.filiup.service.CommonStoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/common-stories")
public class CommonStoryController {

    @Autowired
    private CommonStoryService commonStoryService;

    @GetMapping
    public List<CommonStoryEntity> getAllStories() {
        return commonStoryService.getAllStories();
    }

    @GetMapping("/{id}")
    public ResponseEntity<CommonStoryEntity> getStoryById(@PathVariable Long id) {
        return commonStoryService.getStoryById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public CommonStoryEntity createStory(@RequestBody CommonStoryEntity story) {
        return commonStoryService.saveStory(story);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteStory(@PathVariable Long id) {
        commonStoryService.deleteStory(id);
        return ResponseEntity.ok().build();
    }
} 