package com.filiup.Filiup.dto;

import lombok.Data;
import lombok.Builder;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
public class LessonResponse {
    private UUID id;
    private UUID phaseId;
    private String title;
    private String description;
    private Integer orderIndex;
    private Integer slidesCount;
    private Integer activitiesCount;
    private LocalDateTime createdAt;
    private List<LessonSlideDto> slides;
    
    @Data
    @Builder
    public static class LessonSlideDto {
        private UUID id;
        private String title;
        private List<String> content;
        private Integer orderIndex;
    }
}
