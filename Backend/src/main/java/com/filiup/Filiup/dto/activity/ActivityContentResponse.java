package com.filiup.Filiup.dto.activity;

import com.filiup.Filiup.entity.ActivityType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ActivityContentResponse {
    private UUID id;
    private ActivityType activityType;
    private String title;
    private String instructions;
    private String storyText; // For Story Comprehension
    private Integer orderIndex;
    private Integer passingPercentage;
    
    // Activity-specific content
    private List<QuestionResponse> questions;
    private List<DragDropItemResponse> dragDropItems;
    private List<DragDropCategoryResponse> dragDropCategories;
    private List<MatchingPairResponse> matchingPairs;
}
