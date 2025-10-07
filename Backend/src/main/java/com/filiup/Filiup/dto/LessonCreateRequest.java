package com.filiup.Filiup.dto;

import lombok.Data;

import java.util.List;
import java.util.UUID;

@Data
public class LessonCreateRequest {
    private UUID phaseId;
    private String title;
    private String description;
    private Integer orderIndex;
    private List<LessonSlideDto> slides;
    
    @Data
    public static class LessonSlideDto {
        private String title;
        private List<String> content;
        private Integer orderIndex;
    }
}
