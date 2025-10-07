package com.filiup.Filiup.dto;

import com.filiup.Filiup.entity.ActivityType;
import lombok.Data;

import java.util.List;
import java.util.UUID;

@Data
public class ActivityCreateRequest {
    private UUID lessonId;
    private ActivityType activityType;
    private String title;
    private String instructions;
    private String storyText;
    private Integer orderIndex;
    private Integer passingPercentage;
    private ActivityContentDto content;
    
    @Data
    public static class ActivityContentDto {
        private List<QuestionDto> questions;
        private List<DragDropCategoryDto> categories;
        private List<DragDropItemDto> items;
        private List<MatchingPairDto> pairs;
    }
    
    @Data
    public static class QuestionDto {
        private String questionText;
        private List<String> options;
        private Integer correctAnswerIndex;
        private String explanation;
        private Integer orderIndex;
    }
    
    @Data
    public static class DragDropCategoryDto {
        private String categoryId;
        private String name;
        private String colorClass;
        private Integer orderIndex;
    }
    
    @Data
    public static class DragDropItemDto {
        private String text;
        private String correctCategory;
        private Integer orderIndex;
    }
    
    @Data
    public static class MatchingPairDto {
        private String leftText;
        private String rightText;
        private Integer orderIndex;
    }
}
