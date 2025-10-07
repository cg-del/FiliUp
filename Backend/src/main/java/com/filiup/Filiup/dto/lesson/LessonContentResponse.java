package com.filiup.Filiup.dto.lesson;

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
public class LessonContentResponse {
    private UUID id;
    private String title;
    private String description;
    private Integer orderIndex;
    private List<LessonSlideResponse> slides;
}
