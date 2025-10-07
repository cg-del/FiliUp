package com.filiup.Filiup.dto;

import com.filiup.Filiup.entity.ActivityType;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
public class ActivityResponse {
    private UUID id;
    private UUID lessonId;
    private ActivityType activityType;
    private String title;
    private String instructions;
    private String storyText;
    private Integer orderIndex;
    private Integer passingPercentage;
    private LocalDateTime createdAt;
    private ActivityContentDto content;
    
    @Data
    @Builder
    public static class ActivityContentDto {
        private List<QuestionDto> questions;
        private List<DragDropCategoryDto> categories;
        private List<DragDropItemDto> items;
        private List<MatchingPairDto> pairs;
    }
    
    @Data
    @Builder
    public static class QuestionDto {
        private UUID id;
        private String questionText;
        private List<String> options;
        private Integer correctAnswerIndex;
        private String explanation;
        private Integer orderIndex;
    }
    
    @Data
    @Builder
    public static class DragDropCategoryDto {
        private UUID id;
        private String categoryId;
        private String name;
        private String colorClass;
        private Integer orderIndex;
    }
    
    @Data
    @Builder
    public static class DragDropItemDto {
        private UUID id;
        private String text;
        private String correctCategory;
        private Integer orderIndex;
    }
    
    @Data
    @Builder
    public static class MatchingPairDto {
        private UUID id;
        private String leftText;
        private String rightText;
        private Integer orderIndex;
    }
}
