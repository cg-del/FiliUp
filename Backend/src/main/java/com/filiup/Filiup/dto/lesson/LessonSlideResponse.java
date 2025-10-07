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
public class LessonSlideResponse {
    private UUID id;
    private String title;
    private List<String> content;
    private Integer orderIndex;
}
